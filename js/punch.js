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

let punchCountSinceLastMove = 0;
let moveTriggerPunchCount = Phaser.Math.Between(5, 10);
let originalPosition = null;

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

    // 🔴 Drump face redness progression
    if (currentFrame < 30) currentFrame++;
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

    // 👊 Show new punch effect
    showPunchEffect();

    // ✨ Floating punch text
    animateFloatingText(`+1${bonus ? ` 🎉 +${bonus}` : ''}`);

    // ⏱ Hit cooldown
    setTimeout(() => { hitCooldown = false; }, 200);

    // 🔄 Begin backward animation if needed
    if (backwardInterval) clearInterval(backwardInterval);
    startBackwardAnimation();

    // 🧾 Save punch to backend
    submitPunchScore();

    // 🕹 Movement logic
    punchCountSinceLastMove++;
    if (punchCountSinceLastMove >= moveTriggerPunchCount) {
        punchCountSinceLastMove = 0;
        moveTriggerPunchCount = Phaser.Math.Between(5, 10);

        if (!originalPosition) {
            originalPosition = {
                x: drump.x,
                y: drump.y,
                scale: drump.scale
            };
        }

        moveDrumpRandomly(originalPosition);
    }

    // 🔁 Sync from backend every 20 punches
    if (window.punches % 20 === 0) {
        fetch(`https://drumpleaderboard-production.up.railway.app/profile?user_id=${window.userId}`)
            .then(res => res.json())
            .then(data => {
                if (typeof data.punches === "number" && data.punches > window.punches) {
                    window.punches = data.punches;
                    updatePunchDisplay();

                    const gamePunchEl = document.getElementById("punch-count");
                    if (gamePunchEl) gamePunchEl.textContent = window.punches;

                    const profilePunchEl = document.querySelector("#profile-container #punchProfileStat");
                    if (profilePunchEl) profilePunchEl.textContent = window.punches;
                }
            })
            .catch(err => console.error("❌ Failed to sync punches from server:", err));
    }
}


function showPunchEffect() {
    const scene = game.scene.scenes[0];
    const punchEffect = scene.add.image(drump.x + drump.displayWidth / 2, drump.y, "punch")
        .setOrigin(0.5)
        .setScale(0.4)
        .setAlpha(0)
        .setDepth(9999);

    scene.tweens.add({
        targets: punchEffect,
        alpha: 1,
        x: drump.x,
        duration: 100,
        onComplete: () => {
            scene.tweens.add({
                targets: punchEffect,
                alpha: 0,
                duration: 150,
                delay: 50,
                onComplete: () => punchEffect.destroy()
            });
        }
    });
}

let punchCountSinceLastMove = 0;
let moveTriggerPunchCount = Phaser.Math.Between(5, 10);
let originalPosition = null;

function moveDrumpRandomly() {
    if (!drump || !drump.scene) return;

    const scene = drump.scene;
    const margin = 50;
    const minScale = 0.7, maxScale = 1.3;

    const newX = Phaser.Math.Between(margin, scene.scale.width - margin);
    const newY = Phaser.Math.Between(scene.scale.height * 0.3, scene.scale.height * 0.75);
    const newScale = Phaser.Math.FloatBetween(minScale, maxScale);

    scene.tweens.add({
        targets: drump,
        x: newX,
        y: newY,
        scale: newScale,
        ease: "Sine.easeInOut",
        duration: 800,
        yoyo: true,
        hold: 2000,
        onComplete: () => {
            if (originalPosition) {
                scene.tweens.add({
                    targets: drump,
                    x: originalPosition.x,
                    y: originalPosition.y,
                    scale: originalPosition.scale,
                    duration: 600
                });
            }
        }
    });
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
