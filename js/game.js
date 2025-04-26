import { handlePunch, initPunchModule } from "./punch.js";
import { updatePunchDisplay } from "./ui.js";
import { getIncompleteTaskCount } from "./earn_tab.js";
import { showTab, renderTabs } from "./ui_tabs.js";
import { renderTopBar } from "./topbar.js";
import { renderPunchBar, fetchPunchGap } from "./punchbar.js";
import { createReferralAndRewardsButtons } from "./buttons.js";
import { showInfoPage } from "./popups.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

let game;
let drump;
let punchSounds = [];
let loadeddrumpFrames = new Set(["drump-images/Drump 1-01.png"]);
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
  this.load.image("drump1", "drump-images/Drump 1-01.png");
  this.load.image("drump2", "drump-images/Drump 2-02.png");
  this.load.image("drump3", "drump-images/Drump 3-03.png");
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
    let displayName = "Anonymous";
    if (firstName.trim()) displayName = firstName;
    else if (lastName.trim()) displayName = lastName;
    else displayName = fallbackUsername;
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
  createReferralAndRewardsButtons(window.userId);

  if (!localStorage.getItem("onboarding_complete")) {
    setTimeout(() => showOnboarding(), 300);
  }
}

function showGameUI(scene) {
  scene.add.image(scene.scale.width / 2, scene.scale.height / 2, "background")
    .setOrigin(0.5)
    .setDisplaySize(scene.scale.width, scene.scale.height)
    .setDepth(-10);

  const darkOverlay = scene.add.rectangle(
    scene.scale.width / 2,
    scene.scale.height / 2,
    scene.scale.width,
    scene.scale.height,
    0x000000,
    0
  ).setDepth(-9);

  const textureKey = `Drump 1-01.png`;
  if (!loadeddrumpFrames.has(textureKey)) {
    scene.load.image(textureKey, `drump-images/${textureKey}`);
    scene.load.once(`filecomplete-image-${textureKey}`, () => {
      loadeddrumpFrames.add(textureKey);
      drawDrump(scene, textureKey);
    });
    scene.load.start();
  } else {
    drawDrump(scene, textureKey);
  }
}

function drawDrump(scene, textureKey) {
  const image = scene.textures.get(textureKey).getSourceImage();
  if (!image) return;

  const maxWidth = window.innerWidth * 0.75;
  const scale = Math.min(maxWidth / image.width, window.innerHeight / image.height);

  if (drump) drump.destroy();

  const yPosition = scene.scale.height / 2.6 + (scene.scale.height * 0.15);

  drump = scene.add.image(scene.scale.width / 2, yPosition, textureKey)
    .setScale(scale)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  drump.setInteractive(new Phaser.Geom.Rectangle(0, 0, drump.width, drump.height), Phaser.Geom.Rectangle.Contains);
  drump.originalScale = scale;

  drump.on("pointerdown", (pointer) => {
    const profileVisible = document.getElementById("profile-container");
    const referralVisible = document.getElementById("referral-popup");

    if (window.activeTab !== "game" || profileVisible || referralVisible) return;

    const bounds = drump.getBounds();
    if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
      handlePunch();
    }
    // ❌ No wiggle or laugh on missed tap
  });

  initPunchModule({ drump, punchSounds, loadeddrumpFrames });
}

export { game, showGameUI, drawDrump };
