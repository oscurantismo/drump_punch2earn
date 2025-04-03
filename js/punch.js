let drump, punchSounds, loadeddrumpFrames;
let hitCooldown = false;
let currentFrame = 1;
let lastPunchTime = 0;
let backwardInterval;
const BACKWARD_DELAY = 2000;
const BACKWARD_SPEED = 50;

function initPunchModule(config) {
    drump = config.drump;
    punchSounds = config.punchSounds;
    loadeddrumpFrames = config.loadeddrumpFrames;
}

function handlePunch() {
    if (!drump || hitCooldown || window.activeTab !== "game") return;

    hitCooldown = true;
    window.punches = (window.punches || 0) + 1;
    lastPunchTime = Date.now();

    updatePunchDisplay();
    localStorage.setItem(`score_${window.userId}`, window.punches);

    if (window.soundEnabled && punchSounds.length > 0) {
        const sound = Phaser.Math.RND.pick(punchSounds);
        sound.play();
    }

    if (currentFrame < 30) currentFrame++;

    const key = `${currentFrame}a-min.png`;

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

    showPunchEffect();
    animateFloatingText("+1");

    setTimeout(() => { hitCooldown = false; }, 200);

    if (backwardInterval) clearInterval(backwardInterval);
    startBackwardAnimation();

    submitPunchScore();
}

function showPunchEffect() {
    const scene = game.scene.scenes[0];
    const punchEffect = scene.add.sprite(drump.x, drump.y, "punch")
        .setScale(0.9)
        .setOrigin(0.5)
        .setDepth(9999)
        .play("punchAnim");

    setTimeout(() => punchEffect.destroy(), 500);
}

function animateFloatingText(text) {
    const scene = game.scene.scenes[0];
    const floating = scene.add.text(drump.x, drump.y - 100, `🤛${text}`, {
        font: "bold 24px Arial",
        fill: "#ff0000",
        stroke: "#fff",
        strokeThickness: 3
    }).setOrigin(0.5);

    scene.tweens.add({
        targets: floating,
        y: floating.y - 50,
        alpha: 0,
        duration: 800,
        ease: 'Power1',
        onComplete: () => floating.destroy()
    });
}

function startBackwardAnimation() {
    const adjustedSpeed = BACKWARD_SPEED * 0.7;

    backwardInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastPunchTime < BACKWARD_DELAY) return;

        if (currentFrame <= 1) {
            clearInterval(backwardInterval);
            currentFrame = 1;
            return;
        }

        currentFrame--;
        const key = `${currentFrame}a-min.png`;

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
    }, adjustedSpeed);
}

function updatePunchDisplay() {
    const bar = document.getElementById("punch-bar");
    if (bar) {
        bar.innerText = `🥾 Punches: ${window.punches}`;
    }
}

function submitPunchScore() {
    fetch("https://drumpleaderboard-production.up.railway.app/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: window.storedUsername,
            user_id: window.userId,
            score: window.punches
        })
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
    })
    .then(() => console.log("✅ Punch score submitted"))
    .catch(err => console.error("❌ Punch submit failed:", err));
}

export { initPunchModule, handlePunch };
