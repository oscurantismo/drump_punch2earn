// punch.js

let punches = 0;
let hitCooldown = false;
let currentFrame = 1;
let lastPunchTime = 0;
let backwardInterval;
const BACKWARD_DELAY = 2000;
const BACKWARD_SPEED = 50;

let drumpRef;
let punchSoundsRef = [];
let loadedFrames = new Set(["drump-images/1a-min.png"]);

/**
 * Initialize punch module
 * Should be called once in game.js or main setup file
 */
function initPunchModule({ drump, punchSounds, loadeddrumpFrames }) {
    drumpRef = drump;
    punchSoundsRef = punchSounds;
    if (loadeddrumpFrames) {
        loadedFrames = loadeddrumpFrames;
    }
}

/**
 * Returns true if the user is currently on the game tab
 */
function isOnGameScreen() {
    const otherContainers = [
        document.getElementById("leaderboard-container"),
        document.getElementById("info-container"),
        document.getElementById("profile-container")
    ];
    return otherContainers.every(c => c === null);
}

function handlePunch() {
    if (!isOnGameScreen()) {
        console.log("Score submission blocked. User is not on the game screen.");
        return;
    }

    punches++;
    lastPunchTime = Date.now();
    updatePunchDisplay();
    localStorage.setItem(`score_${window.userId}`, punches);

    if (window.soundEnabled && punchSoundsRef.length > 0) {
        const sound = Phaser.Math.RND.pick(punchSoundsRef);
        sound.play();
    }

    if (!hitCooldown) {
        hitCooldown = true;

        if (currentFrame < 30) currentFrame++;
        const key = `${currentFrame}a-min.png`;
        const scene = window.game.scene.scenes[0];

        if (!loadedFrames.has(key)) {
            scene.load.image(key, `drump-images/${key}`);
            scene.load.once('complete', () => {
                loadedFrames.add(key);
                drumpRef.setTexture(key);
            });
            scene.load.start();
        } else {
            drumpRef.setTexture(key);
        }

        showPunchEffect(scene);
        animateFloatingText(scene);

        setTimeout(() => {
            hitCooldown = false;
        }, 200);

        if (backwardInterval) clearInterval(backwardInterval);
        startBackwardAnimation(scene);
    }

    fetch("https://drumpleaderboard-production.up.railway.app/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: window.storedUsername,
            user_id: window.userId,
            score: punches
        })
    }).catch(console.error);
}

function showPunchEffect(scene) {
    if (!drumpRef) return;

    const punchEffect = scene.add.sprite(drumpRef.x, drumpRef.y, "punch")
        .setScale(0.9)
        .setOrigin(0.5)
        .setDepth(9999)
        .play("punchAnim");

    setTimeout(() => {
        punchEffect.destroy();
    }, 500);
}

function animateFloatingText(scene) {
    if (!drumpRef) return;

    const text = scene.add.text(drumpRef.x, drumpRef.y - 100, "🤛+1", {
        font: "bold 24px Arial",
        fill: "#ff0000",
        stroke: "#fff",
        strokeThickness: 3
    }).setOrigin(0.5);

    scene.tweens.add({
        targets: text,
        y: text.y - 50,
        alpha: 0,
        duration: 800,
        ease: "Power1",
        onComplete: () => text.destroy()
    });
}

function startBackwardAnimation(scene) {
    if (backwardInterval) clearInterval(backwardInterval);

    backwardInterval = setInterval(() => {
        if (Date.now() - lastPunchTime >= BACKWARD_DELAY) {
            const frameNum = parseInt(drumpRef.texture.key.replace("a-min.png", ""));
            if (frameNum <= 1) {
                clearInterval(backwardInterval);
                currentFrame = 1;
                return;
            }

            const newFrameNum = frameNum - 1;
            currentFrame = newFrameNum;
            const key = `${newFrameNum}a-min.png`;

            if (!loadedFrames.has(key)) {
                scene.load.image(key, `drump-images/${key}`);
                scene.load.once("complete", () => {
                    loadedFrames.add(key);
                    drumpRef.setTexture(key);
                });
                scene.load.start();
            } else {
                drumpRef.setTexture(key);
            }
        }
    }, BACKWARD_SPEED * 0.7);
}

function updatePunchDisplay() {
    const bar = document.getElementById("punch-bar");
    if (bar) {
        bar.innerText = `🥾 Punches: ${punches}`;
    }
}

export {
    initPunchModule,
    handlePunch,
    showPunchEffect,
    startBackwardAnimation,
    updatePunchDisplay,
    punches
};
