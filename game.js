let game;
let punches = 0;
let activeTab = "game";
let storedUsername = "Anonymous";
let userId = "";
let loadeddrumpFrames = new Set(["1a-min.png"]);
let backwardInterval;
let lastPunchTime = 0;
const BACKWARD_DELAY = 2000; // 2 seconds before going backward
const BACKWARD_SPEED = 300; // 300ms per frame

window.onload = () => {
    createLoader();

    const gameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#ffffff",
        scene: { preload, create, update }
    };

    game = new Phaser.Game(gameConfig);
};

let drump, shoeCursor, punchSounds = [], soundButton;
let hitCooldown = false;
let soundEnabled = true;

function createLoader() {
    const loader = document.createElement("div");
    loader.id = "loader";
    loader.style.position = "fixed";
    loader.style.top = "0";
    loader.style.left = "0";
    loader.style.width = "100%";
    loader.style.height = "100%";
    loader.style.display = "flex";
    loader.style.alignItems = "center";
    loader.style.justifyContent = "center";
    loader.style.background = "#ffffff";
    loader.style.zIndex = "2000";
    loader.innerHTML = `
        <div class="spinner"></div>
        <style>
        .spinner {
            border: 6px solid #eee;
            border-top: 6px solid #b22234;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        </style>
    `;
    document.body.appendChild(loader);
}

function removeLoader() {
    const el = document.getElementById("loader");
    if (el) el.remove();
}

function preload() {
    this.load.image("drump1", "drump-images/1a-min.png");
    this.load.image("shoe", "shoe.png");
    this.load.image("sound_on", "sound_on.svg");
    this.load.image("sound_off", "sound_off.svg");
    for (let i = 1; i <= 4; i++) {
        this.load.audio("punch" + i, "punch" + i + ".mp3");
    }
}

function create() {
    Telegram.WebApp.ready();
    const initUser = Telegram.WebApp.initDataUnsafe?.user;
    if (initUser) {
        storedUsername = initUser.username || `${initUser.first_name}_${initUser.last_name || ""}`.trim();
        userId = initUser.id.toString();
    }

    const cached = localStorage.getItem(`score_${userId}`);
    if (cached !== null) {
        punches = parseInt(cached);
    }

    fetch("https://drumpleaderboard-production.up.railway.app/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: storedUsername, user_id: userId })
    })
    .then(() => fetch("https://drumpleaderboard-production.up.railway.app/leaderboard"))
    .then(res => res.json())
    .then(scores => {
        const entry = scores.find(u => u.user_id == userId);
        if (entry && entry.score > punches) {
            punches = entry.score;
            localStorage.setItem(`score_${userId}`, punches);
        }
        removeLoader();
        renderTopBar();
        renderTabs();
        renderShareButton();
        showTab("game", this);
    });
}

function renderTopBar() {
    const top = document.createElement("div");
    top.style.position = "fixed";
    top.style.top = "0.5rem";
    top.style.left = "1rem";
    top.style.background = "#fff";
    top.style.color = "#000";
    top.style.border = "2px solid #0047ab";
    top.style.borderRadius = "10px";
    top.style.fontFamily = "'Arial Black', sans-serif";
    top.style.padding = "6px 12px";
    top.style.zIndex = "1000";
    top.innerText = `${storedUsername}`;
    document.body.appendChild(top);

    const punchBar = document.createElement("div");
    punchBar.id = "punch-bar";
    punchBar.style.position = "fixed";
    punchBar.style.top = "50px";
    punchBar.style.left = "1rem";
    punchBar.style.right = "1rem";
    punchBar.style.background = "#b22234";
    punchBar.style.color = "#ffffff";
    punchBar.style.textAlign = "center";
    punchBar.style.fontFamily = "'Arial Black', sans-serif";
    punchBar.style.fontSize = "18px";
    punchBar.style.padding = "6px 0";
    punchBar.style.borderRadius = "8px";
    punchBar.style.zIndex = "999";
    punchBar.innerText = `🥾 Punches: ${punches}`;
    document.body.appendChild(punchBar);

    const iconSize = 32;
    soundButton = document.createElement("img");
    soundButton.src = "sound_on.svg";
    soundButton.style.position = "fixed";
    soundButton.style.top = "calc(0.5rem + 4px)";
    soundButton.style.right = "12px";
    soundButton.style.width = iconSize + "px";
    soundButton.style.height = iconSize + "px";
    soundButton.style.cursor = "pointer";
    soundButton.style.zIndex = "1001";
    soundButton.onclick = () => {
        soundEnabled = !soundEnabled;
        soundButton.src = soundEnabled ? "sound_on.svg" : "sound_off.svg";
    };
    document.body.appendChild(soundButton);
}


function showGameUI(scene) {
    const current = Math.min(punches, 30);
    const textureKey = `${current}a-min.png`;
    if (!loadeddrumpFrames.has(textureKey)) {
        scene.load.image(textureKey, `drump-images/${textureKey}`);
        scene.load.once('complete', () => {
            loadeddrumpFrames.add(textureKey);
            drawdrump(scene, textureKey);
        });
        scene.load.start();
    } else {
        drawdrump(scene, textureKey);
    }

    for (let i = 1; i <= 4; i++) {
        punchSounds.push(scene.sound.add("punch" + i));
    }

    scene.input.setDefaultCursor("none");
    shoeCursor = scene.add.image(scene.input.activePointer.x, scene.input.activePointer.y, "shoe")
        .setScale(0.5)
        .setDepth(999);
}

function drawdrump(scene, textureKey) {
    const imageWidth = scene.textures.get(textureKey).getSourceImage().width;
    const drumpScale = (scene.scale.width * 0.7) / imageWidth;

    drump = scene.add.image(scene.scale.width / 2, scene.scale.height / 2.3, textureKey)
        .setScale(drumpScale)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

    drump.on("pointerdown", () => handlePunch());
}

function handlePunch() {
    punches++;
    lastPunchTime = Date.now();
    updatePunchDisplay();
    localStorage.setItem(`score_${userId}`, punches);

    if (soundEnabled) {
        const sound = Phaser.Math.RND.pick(punchSounds);
        sound.play();
    }

    if (!hitCooldown) {
        hitCooldown = true;
        const frameNum = Math.min(punches, 30);
        const key = `${frameNum}a-min.png`;
        if (!loadeddrumpFrames.has(key)) {
            game.scene.scenes[0].load.image(key, `drump-images/${key}`);
            game.scene.scenes[0].load.once('complete', () => {
                loadeddrumpFrames.add(key);
                drump.setTexture(key);
            });
            game.scene.scenes[0].load.start();
        } else {
            drump.setTexture(key);
        }

        const floatingText = drump.scene.add.text(drump.x, drump.y - 100, "+1", {
            font: "bold 24px Arial",
            fill: "#ff0000",
            stroke: "#fff",
            strokeThickness: 3
        }).setOrigin(0.5);

        drump.scene.tweens.add({
            targets: floatingText,
            y: floatingText.y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            onComplete: () => floatingText.destroy()
        });

        setTimeout(() => {
            hitCooldown = false;
        }, 200);

        if (backwardInterval) clearInterval(backwardInterval);
        startBackwardAnimation();
    }
}

function startBackwardAnimation() {
    backwardInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastPunchTime >= BACKWARD_DELAY) {
            const frameNum = parseInt(drump.texture.key.replace('a-min.png', ''));
            if (frameNum > 1) {
                const newFrameNum = frameNum - 1;
                const key = `${newFrameNum}a-min.png`;
                if (!loadeddrumpFrames.has(key)) {
                    game.scene.scenes[0].load.image(key, `drump-images/${key}`);
                    game.scene.scenes[0].load.once('complete', () => {
                        loadeddrumpFrames.add(key);
                        drump.setTexture(key);
                    });
                    game.scene.scenes[0].load.start();
                } else {
                    drump.setTexture(key);
                }
            }
        }
    }, BACKWARD_SPEED);
}

function update() {
    if (shoeCursor && game.input && game.input.activePointer) {
        const pointer = game.input.activePointer;
        shoeCursor.setPosition(pointer.x, pointer.y);
    }
}
