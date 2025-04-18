import { updatePunchDisplay } from "./ui.js";
import { showFloatingBonus } from "./punchbar.js";

let drump, punchSounds, loadeddrumpFrames;
let hitCooldown = false;
let currentFrame = 1;
let lastPunchTime = 0;
let backwardInterval;
let lastOofTime = 0;
let recentPunches = [];
const OOF_MIN_INTERVAL = 12000;
const BACKWARD_DELAY = 2000;
const BACKWARD_SPEED = 50;

let pendingPunches = 0;
let lastSubmitTime = 0;
const SUBMIT_INTERVAL = 15000;
const PUNCH_THRESHOLD = 10;

function initPunchModule(config) {
    drump = config.drump;
    punchSounds = config.punchSounds;
    loadeddrumpFrames = config.loadeddrumpFrames;
    if (typeof window.updatePunchDisplay === "function") {
        window.updatePunchDisplay();
    }
}

function handlePunch() {
    if (!drump || hitCooldown || window.activeTab !== "game" || window.isPopupOpen?.()) return;

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

    const now = Date.now();
    recentPunches = recentPunches.filter(ts => now - ts < 10000);
    recentPunches.push(now);

    if (recentPunches.length >= 8 && now - lastOofTime >= OOF_MIN_INTERVAL) {
        lastOofTime = now;
        if (window.soundEnabled && game.scene.scenes[0].sound) {
            const oofSound = game.scene.scenes[0].sound.add("oof");
            oofSound.play({ volume: 0.75 });
        }
    }

    lastPunchTime = now;
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
        scene.load.once("complete", () => {
            loadeddrumpFrames.add(key);
            drump.setTexture(key);
        });
        scene.load.start();
    } else {
        drump.setTexture(key);
    }

    showPunchEffect();
    showPunchZapEffect();
    showFloatingBonus("+1");
    if (bonus) showFloatingBonus("+25", true);

    wiggleDrump(scene);

    setTimeout(() => { hitCooldown = false; }, 200);

    if (backwardInterval) clearInterval(backwardInterval);
    startBackwardAnimation();

    pendingPunches++;
    if (pendingPunches >= PUNCH_THRESHOLD || now - lastSubmitTime >= SUBMIT_INTERVAL) {
        submitPunchScore();
    }

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

function showPunchZapEffect() {
    const scene = game.scene.scenes[0];
    const zapGroup = scene.add.group();
    const numZaps = 5;

    const centerX = drump.x;
    const centerY = drump.y - drump.displayHeight * 0.38; // 👈 closer to the top of Drump’s head
    const radius = drump.displayWidth * 0.4; // smaller radius so it hugs the head

    for (let i = 0; i < numZaps; i++) {
        const angle = (360 / numZaps) * i;
        const radians = Phaser.Math.DegToRad(angle);

        const x = centerX + Math.cos(radians) * radius;
        const y = centerY + Math.sin(radians) * radius;

        const zap = scene.add.text(x, y, "⚡", {
            font: "24px Arial Black",
            fill: "#ffea00",
            stroke: "#000",
            strokeThickness: 4
        })
        .setOrigin(0.5)
        .setDepth(10000)
        .setAlpha(1);

        zapGroup.add(zap);

        // Animate each zap upward + fade
        scene.tweens.add({
            targets: zap,
            y: y - 10,
            alpha: 0,
            duration: 400,
            ease: "Cubic.easeOut",
            onComplete: () => zap.destroy()
        });
    }
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

function submitPunchScore(retry = false) {
    lastSubmitTime = Date.now();
    pendingPunches = 0;

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
    .catch(err => {
        console.error("❌ Punch submit failed:", err);
        if (!retry) setTimeout(() => submitPunchScore(true), 2000);
    });
}

function wiggleDrump(scene) {
    if (!drump || !scene) return;

    scene.tweens.add({
        targets: drump,
        angle: { from: -5, to: 5 },
        duration: 80,
        yoyo: true,
        repeat: 4,
        ease: "Sine.easeInOut",
        onComplete: () => drump.setAngle(0)
    });
}

export { initPunchModule, handlePunch, wiggleDrump };
