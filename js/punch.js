// ✅ Fully cleaned up and updated punch.js

import { updatePunchDisplay } from "./ui.js";
import { showFloatingBonus } from "./punchbar.js";

let drump, punchSounds, loadeddrumpFrames;
let hitCooldown = false;
let lastPunchTime = 0;
let lastOofTime = 0;
let recentPunches = [];
let activeWiggleTween = null;

const OOF_MIN_INTERVAL = 12000;
const SUBMIT_INTERVAL = 15000;
const PUNCH_THRESHOLD = 10;

let pendingPunches = 0;
let lastSubmitTime = 0;

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
  window.punches = newPunches;

  const now = Date.now();
  lastPunchTime = now;
  updatePunchDisplay();
  localStorage.setItem(`score_${window.userId}`, window.punches);

  if (window.soundEnabled && punchSounds.length > 0) {
    const sound = Phaser.Math.RND.pick(punchSounds);
    sound.play();
  }

  const scene = game.scene.scenes[0];

  // Stop any previous wiggle first
  if (activeWiggleTween) {
    activeWiggleTween.stop();
    drump.setAngle(0);
  }

  // Start new wiggle
  activeWiggleTween = scene.tweens.add({
    targets: drump,
    angle: { from: -5, to: 5 },
    duration: 80,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });


  // Animate frames: 1 -> 2 -> 3
  const frames = ["drump-images/Drump 1-01.png", "drump-images/Drump 2-02.png", "drump-images/Drump 3-03.png"];
  let frameIndex = 0;

  const showNextFrame = () => {
    if (frameIndex >= frames.length) {
      if (activeWiggleTween) {
        activeWiggleTween.stop();
        drump.setAngle(0);
        activeWiggleTween = null;
      }

      showPunchEffect();
      showPunchZapEffect();
      showFloatingBonus("+1");
      setTimeout(() => { hitCooldown = false; }, 50);
      return;
    }

    const key = frames[frameIndex];
    const textureKey = key.split("/").pop();

    if (!loadeddrumpFrames.has(textureKey)) {
      scene.load.image(textureKey, key);
      scene.load.once(`filecomplete-image-${textureKey}`, () => {
        loadeddrumpFrames.add(textureKey);
        drump.setTexture(textureKey);
        frameIndex++;
        setTimeout(showNextFrame, 60);
      });
      scene.load.start();
    } else {
      drump.setTexture(textureKey);
      frameIndex++;
      setTimeout(showNextFrame, 60);
    }
  };

  showNextFrame();

  pendingPunches++;
  if (pendingPunches >= PUNCH_THRESHOLD || now - lastSubmitTime >= SUBMIT_INTERVAL) {
    submitPunchScore();
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
  const centerY = drump.y - drump.displayHeight * 0.38;
  const radius = drump.displayWidth * 0.4;

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

export { initPunchModule, handlePunch };
