// ✅ Final cleaned and fixed punch.js
import { updatePunchDisplay } from "./ui.js";
import { showFloatingBonus } from "./punchbar.js";

let drump, punchSounds, loadeddrumpFrames;
let lastPunchTime = 0;
let pendingPunches = 0;
let lastSubmitTime = 0;
let activeWiggleTween = null;

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

let isAnimatingPunch = false; // 🔥 Add globally

function getBonusAmount(punchCount) {
  const withinCycle = punchCount % 500;
  switch (withinCycle) {
    case 100: return 25;
    case 200: return 30;
    case 300: return 35;
    case 400: return 40;
    case 0: return punchCount > 0 ? 50 : 0;
    default: return 0;
  }
}


function handlePunch() {
  if (!drump || window.activeTab !== "game" || window.isPopupOpen?.()) return;
  if (isAnimatingPunch) return; // 🔥 Failsafe: Ignore if already animating punch!

  isAnimatingPunch = true; // 🔥 Start locking animation

  const previousPunches = window.punches || 0;
  const rawPunches = previousPunches + 1;
  const bonus = getBonusAmount(rawPunches);
  const newPunches = rawPunches + bonus;
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

  if (activeWiggleTween) {
    activeWiggleTween.stop();
    drump.setAngle(0);
  }

  activeWiggleTween = scene.tweens.add({
    targets: drump,
    angle: { from: -5, to: 5 },
    duration: 80,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  const frames = ["Drump_1-01", "Drump_2-02", "Drump_3-03"];
  let frameIndex = 0;
  let punchEffect = null;

  const showNextFrame = () => {
    if (frameIndex < frames.length) {
      const textureKey = frames[frameIndex];
      drump.setTexture(textureKey);

      if (textureKey === "Drump_2-02") {
        punchEffect = scene.add.image(drump.x + drump.displayWidth / 1.5, drump.y, "punch")
          .setOrigin(0.5)
          .setScale(0.4)
          .setAlpha(1)
          .setDepth(9999);

        scene.tweens.add({
          targets: punchEffect,
          x: drump.x,
          duration: 150,
          ease: "Cubic.easeOut",
        });
      }

      if (textureKey === "Drump_3-03" && punchEffect) {
        scene.tweens.add({
          targets: punchEffect,
          alpha: 0,
          duration: 100,
          ease: "Power2",
          onComplete: () => punchEffect.destroy(),
        });
      }

      frameIndex++;
      setTimeout(showNextFrame, 80);
    } else {
      setTimeout(() => {
        if (activeWiggleTween) {
          activeWiggleTween.stop();
          drump.setAngle(0);
          activeWiggleTween = null;
        }

        drump.setTexture("Drump_1-01");

        showPunchZapEffect();
        showFloatingBonus("+1");
        
        if (bonus > 0) showBonusCoin(`+${bonus}`);


        isAnimatingPunch = false; // 🔥 UNLOCK after animation finishes!
      }, 250);
    }
  };

  showNextFrame();

  pendingPunches++;
  if (pendingPunches >= PUNCH_THRESHOLD || now - lastSubmitTime >= SUBMIT_INTERVAL) {
    submitPunchScore();
  }
}

function showBonusCoin(floatingText = "+25") {
  const scene = game.scene.scenes[0];

  // === Position under punch bar and above Drump's head ===
  const x = scene.scale.width / 2;
  const y = 200; // 💡 Position near punch bar (tweak if needed)

  const coin = scene.add.text(x, y, floatingText, {
    fontFamily: "'Negrita Pro', sans-serif",
    fontSize: "22px",
    backgroundColor: "#D10000",
    color: "#fff",
    padding: { x: 20, y: 14 },
    align: "center",
    stroke: "#000",
    strokeThickness: 3,
    fixedWidth: 84,
    fixedHeight: 84
  })
    .setOrigin(0.5)
    .setAlpha(1)
    .setDepth(10001);

  // 🧿 Make text look circular
  coin.setStyle({ backgroundColor: "#D10000" });

  // 🟠 Optional: simulate roundness via scale or container if needed
  coin.setScale(1);

  // === Bounce, then float upward and fade out ===
  scene.tweens.add({
    targets: coin,
    y: y - 10,
    ease: "Back.easeOut", // subtle bounce
    duration: 300,
    onComplete: () => {
      scene.tweens.add({
        targets: coin,
        y: y - 140,
        alpha: 0,
        ease: "Cubic.easeIn",
        duration: 1600,
        delay: 300,
        onComplete: () => coin.destroy()
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
