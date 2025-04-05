import { updatePunchDisplay } from "./ui.js";

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
    updatePunchDisplay(); // Initial sync
}

function handlePunch() {
    if (!drump || hitCooldown || window.activeTab !== "game") return;

    hitCooldown = true;

    const previousPunches = window.punches || 0;
    const newPunches = previousPunches + 1;

    let bonus = 0;
    if (newPunches % 100 === 0) {
        bonus = 25;
        window.punches = newPunches + bonus;
    } else {
        window.punches = newPunches;
    }

    lastPunchTime = Date.now();

    updatePunchDisplay();
    localStorage.setItem(`score_${window.userId}`, window.punches);

    if (window.soundEnabled && punchSounds.length > 0) {
        const sound = Phaser.Math.RND.pick(punchSounds);
        sound.play();
    }

    if (currentFrame < 30) currentFrame++;

    const key = `${currentFrame}a-min.png`;
    const scene = game.scene.scenes[0];

    if (!loadeddrumpFrames.has(key)) {
        scene.load.image(key, `drump-images/${key}`);
        scene.load.once('complete', () => {
            loadeddrumpFrames.add(key);
            drump.setTexture(key);
        });
        scene.load.start();
    } else {
        drump.setTexture(key);
    }

    showPunchEffect();
    animateFloatingText(`+1${bonus ? ` 🎉 +${bonus}` : ''}`);

    setTimeout(() => { hitCooldown = false; }, 200);

    if (backwardInterval) clearInterval(backwardInterval);
    startBackwardAnimation();

    submitPunchScore();

    // ✅ Only fetch from backend every 20 punches
    if (window.punches % 20 === 0) {
        fetch(`https://drumpleaderboard-production.up.railway.app/profile?user_id=${window.userId}`)
            .then(res => res.json())
            .then(data => {
                if (typeof data.punches === "number" && data.punches > window.punches) {
                    window.punches = data.punches;

                    const gamePunchEl = document.getElementById("punch-count");
                    if (gamePunchEl) gamePunchEl.textContent = window.punches;

                    const profilePunchEl = document.querySelector("#profile-container #punchProfileStat");
                    if (profilePunchEl) profilePunchEl.textContent = window.punches;

                    updatePunchDisplay();
                }
            })
            .catch(err => console.error("❌ Failed to sync punches from server:", err));
    }
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
        ease: "Power1",
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

        const scene = game.scene.scenes[0];
        if (!loadeddrumpFrames.has(key)) {
            scene.load.image(key, `drump-images/${key}`);
            scene.load.once("complete", () => {
                loadeddrumpFrames.add(key);
                drump.setTexture(key);
            });
            scene.load.start();
        } else {
            drump.setTexture(key);
        }
    }, adjustedSpeed);
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
