import { handlePunch, initPunchModule } from "./punch.js";
import { updatePunchDisplay } from "./ui.js";
import { getIncompleteTaskCount } from "./earn_tab.js";
import { showTab, renderTabs } from "./ui_tabs.js";
import { renderTopBar } from "./topbar.js";
import { renderPunchBar, fetchPunchGap } from "./punchbar.js";
import { createReferralButton } from "./buttons.js";
import { showInfoPage } from "./popups.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

let game;
let drump;
let punchSounds = [];
let loadeddrumpFrames = new Set(["drump-images/Drump_1-01.png"]);
window.soundEnabled = true;

let pendingPunches = 0;
let lastSubmitTime = 0;
const SUBMIT_INTERVAL = 15000;
const PUNCH_THRESHOLD = 10;

window.onload = () => {
  createLoader();
  createGame();
};

function createGame() {
  const gameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: COLORS.badgeBg,
    scene: { preload, create },
    audio: { disableWebAudio: false }
  };
  game = new Phaser.Game(gameConfig);
  window.game = game;
}

function preload() {
  this.load.image("Drump_1-01", "drump-images/Drump_1-01.png");
  this.load.image("Drump_2-02", "drump-images/Drump_2-02.png");
  this.load.image("Drump_3-03", "drump-images/Drump_3-03.png");

  this.load.image("bonusCoin", "drump-images/coin.png");

  this.load.image("background", "drump-images/background.png");
  this.load.image("punch", "drump-images/punch.png");
  this.load.audio("laugh", "laugh1.mp3");
  this.load.audio("oof", "oof1.mp3");
  for (let i = 1; i <= 4; i++) {
    this.load.audio("punch" + i, `punch${i}.mp3`);
  }
  this.load.image("drump-images/sound_on.svg");
  this.load.image("drump-images/sound_off.svg");
}

async function create() {
  Telegram.WebApp.ready();
  const initUser = Telegram.WebApp.initDataUnsafe?.user;
  if (initUser) {
    const fallbackUsername = initUser.username || "Anonymous";
    const firstName = initUser.first_name || "";
    const lastName = initUser.last_name || "";
    let displayName = firstName.trim() || lastName.trim() || fallbackUsername;
    window.storedUsername = displayName;
    window.telegramUsername = fallbackUsername;
    window.userId = initUser.id.toString();
  }

  window.activeTab = "game";

  const cached = localStorage.getItem(`score_${window.userId}`);
  if (cached !== null) {
    window.punches = parseInt(cached);
  }

  updatePunchDisplay();
  renderTopBar();

  fetch(`https://drumpleaderboard-production.up.railway.app/profile?user_id=${window.userId}`)
    .then(res => res.json())
    .then(profile => {
      if (typeof profile.punches === "number" && profile.punches > window.punches) {
        window.punches = profile.punches;
        updatePunchDisplay();
      }
    })
    .catch(err => console.error("❌ Failed to sync punches from server:", err));

  if (this.sound.context.state === "suspended") {
    this.sound.context.resume();
  }

  punchSounds = [];
  for (let i = 1; i <= 4; i++) {
    try {
      const sound = this.sound.add("punch" + i, { volume: 0.8, loop: false });
      punchSounds.push(sound);
    } catch (e) {
      console.warn(`⚠️ Failed to load punch sound ${i}:`, e);
    }
  }

  if (window.userId) {
    await fetchPunchGap(window.userId);
  }

  showTab("game", this);
  registerUser();
  createReferralButton(window.userId);

  if (!localStorage.getItem("onboarding_complete")) {
    setTimeout(() => showOnboarding(), 300);
  }
}

function showGameUI(scene) {
  scene.add.image(scene.scale.width / 2, scene.scale.height / 2, "background")
    .setOrigin(0.5)
    .setDisplaySize(scene.scale.width, scene.scale.height)
    .setDepth(-10);

  scene.add.rectangle(
    scene.scale.width / 2,
    scene.scale.height / 2,
    scene.scale.width,
    scene.scale.height,
    0x000000,
    0
  ).setDepth(-9);

  drawDrump(scene, "Drump_1-01");

}

function drawDrump(scene, textureKey) {
  if (drump) drump.destroy();

  const maxWidth = window.innerWidth * 0.6; // 60vw
  const yPosition = scene.scale.height / 2.6 + (scene.scale.height * 0.15);

  const image = scene.textures.get(textureKey).getSourceImage();
  const naturalWidth = image.width;
  const scaleFactor = Math.min(1, maxWidth / naturalWidth);

  drump = scene.add.image(scene.scale.width / 2, yPosition, textureKey)
    .setOrigin(0.5)
    .setScale(scaleFactor)
    .setInteractive({ useHandCursor: true });

  drump.setInteractive(new Phaser.Geom.Rectangle(0, 0, drump.width, drump.height), Phaser.Geom.Rectangle.Contains);

  // ✅ IMPORTANT: Disable smoothing on the texture
  scene.textures.get(textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);

  drump.on("pointerdown", (pointer) => {
    const profileVisible = document.getElementById("profile-container");
    const referralVisible = document.getElementById("referral-popup");
    if (window.activeTab !== "game" || profileVisible || referralVisible) return;

    const bounds = drump.getBounds();
    if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
      handlePunch();
    }
  });

  initPunchModule({ drump, punchSounds, loadeddrumpFrames });
}


function createLoader() {
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.style.position = "fixed";
  loader.style.top = "0";
  loader.style.left = "0";
  loader.style.width = "100%";
  loader.style.height = "100%";
  loader.style.display = "flex";
  loader.style.flexDirection = "column";
  loader.style.alignItems = "center";
  loader.style.justifyContent = "center";
  loader.style.background = COLORS.badgeBg;
  loader.style.zIndex = ZINDEX.modal;
  loader.innerHTML = `
    <div class="spinner"></div>
    <p style="font-family: ${FONT.body}, sans-serif; font-size: 14px; color: ${COLORS.primary}; margin-top: 20px;">
      Made with ❤️ and collaboration from 🇨🇦
    </p>
    <style>
    .spinner {
      border: 6px solid ${COLORS.primary};
      border-top: 6px solid ${COLORS.badgeBg};
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

  setTimeout(() => {
    const el = document.getElementById("loader");
    if (el) el.remove();
  }, 3000);
}

function registerUser() {
  const url = "https://drumpleaderboard-production.up.railway.app/register";
  const referrerId = new URLSearchParams(window.location.search).get("start")?.replace("referral_", "");

  const body = {
    username: window.storedUsername,
    user_id: window.userId,
    ...(referrerId ? { referrer_id: referrerId } : {})
  };

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(res => console.log("User registration:", res))
    .catch(console.error);

  fetch(`https://drumpleaderboard-production.up.railway.app/profile?user_id=${window.userId}`)
    .then(res => res.json())
    .then(profile => {
      if (profile.already_claimed_referral) {
        showPopupMessage("Oops, seems like you already claimed a referral bonus. Read more about referral rules in the \"Info\" tab.");
      }
    });
}

function showPopupMessage(message) {
  const popup = document.createElement("div");
  popup.innerText = message;
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = COLORS.offWhite;
  popup.style.border = "2px solid COLORS.primary";
  popup.style.color = COLORS.primary;
  popup.style.fontFamily = FONT.body;
  popup.style.fontSize = "16px";
  popup.style.padding = "20px 24px";
  popup.style.borderRadius = "12px";
  popup.style.boxShadow = "0 0 12px rgba(0,0,0,0.3)";
  popup.style.zIndex = "3000";

  const dismiss = document.createElement("button");
  dismiss.innerText = "Got it!";
  dismiss.style.marginTop = "12px";
  dismiss.style.padding = "6px 14px";
  dismiss.style.background = COLORS.primary;
  dismiss.style.color = COLORS.offWhite;
  dismiss.style.border = "none";
  dismiss.style.borderRadius = "8px";
  dismiss.onclick = () => popup.remove();

  popup.appendChild(document.createElement("br"));
  popup.appendChild(dismiss);
  document.body.appendChild(popup);
}

window.onbeforeunload = () => {
  if (window.punches && pendingPunches > 0) {
    navigator.sendBeacon(
      "https://drumpleaderboard-production.up.railway.app/submit",
      new Blob([JSON.stringify({
        username: window.storedUsername,
        user_id: window.userId,
        score: window.punches
      })], { type: "application/json" })
    );
  }
};

export { game, showGameUI, drawDrump };
