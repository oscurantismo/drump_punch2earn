import { handlePunch, initPunchModule } from "./punch.js";
import { renderTopBar, renderTabs, renderShareButton, updatePunchDisplay } from "./ui.js";

let game;
let punches = 0;
let activeTab = "game";
let storedUsername = "Anonymous";
let userId = "";
let loadeddrumpFrames = new Set(["drump-images/1a-min.png"]);
let backwardInterval;
let lastPunchTime = 0;
let currentFrame = 1;
let lastFrameBeforeBackwards = 1;
const BACKWARD_DELAY = 2000;
const BACKWARD_SPEED = 50;

window.soundEnabled = true; // ✅ GLOBAL ACCESS
let punchSounds = [];
let drump, shoeCursor, soundButton;
let hitCooldown = false;

window.onload = () => {
    createLoader();
    const gameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#ffffff",
        scene: { preload, create, update },
        audio: { disableWebAudio: false }
    };
    game = new Phaser.Game(gameConfig);
};

function preload() {
    this.load.image("drump1", "drump-images/1a-min.png");
    this.load.image("background", "drump-images/Background.png");
    this.load.spritesheet("punch", "drump-images/punch-ezgif.com-gif-to-sprite-converter.png", {
        frameWidth: 200,
        frameHeight: 200,
        endFrame: 8
    });
    this.load.image("sound_on", "sound_on.svg");
    this.load.image("sound_off", "sound_off.svg");
    for (let i = 1; i <= 4; i++) {
        this.load.audio("punch" + i, `punch${i}.mp3`);
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
    if (cached !== null) punches = parseInt(cached);

    this.anims.create({
        key: 'punchAnim',
        frames: this.anims.generateFrameNumbers('punch', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: 0
    });

    // ✅ Resume audio context if needed
    if (this.sound.context.state === "suspended") {
        this.sound.context.resume();
    }

    // ✅ Load punch sounds
    punchSounds = [];
    for (let i = 1; i <= 4; i++) {
        try {
            const sound = this.sound.add("punch" + i, { volume: 0.8 });
            punchSounds.push(sound);
        } catch (e) {
            console.warn(`⚠️ Failed to load punch sound ${i}:`, e);
        }
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

function showGameUI(scene) {
    scene.add.image(scene.scale.width / 2, scene.scale.height / 2, "background")
        .setOrigin(0.5)
        .setDisplaySize(scene.scale.width, scene.scale.height)
        .setDepth(-10);

    const textureKey = `1a-min.png`;
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
    if (!image) {
        console.error(`Failed to retrieve image: ${textureKey}`);
        return;
    }

    const scale = Math.min(
        (window.innerWidth * 0.7) / image.width,
        window.innerHeight / image.height
    );

    const yPosition = scene.scale.height / 2.3 + (scene.scale.height * 0.15);

    if (drump) drump.destroy();

    drump = scene.add.image(scene.scale.width / 2, yPosition, textureKey)
        .setScale(scale)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

    drump.on("pointerdown", () => {
        if (window.activeTab === "game" && !document.getElementById("profile-container")) {
            handlePunch();
        } else {
            console.log("❌ Score submission blocked. User is not on the game screen.");
        }
    });

    // Pass reference to punch.js
    initPunchModule({ drump, punchSounds, loadeddrumpFrames });
}

function showPopupMessage(message) {
    const popup = document.createElement("div");
    popup.innerText = message;
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "#fff";
    popup.style.border = "2px solid #b22234";
    popup.style.color = "#000";
    popup.style.fontFamily = "'Arial Black', sans-serif";
    popup.style.fontSize = "16px";
    popup.style.padding = "20px 24px";
    popup.style.borderRadius = "12px";
    popup.style.boxShadow = "0 0 12px rgba(0,0,0,0.3)";
    popup.style.zIndex = "3000";

    const dismiss = document.createElement("button");
    dismiss.innerText = "Got it!";
    dismiss.style.marginTop = "12px";
    dismiss.style.padding = "6px 14px";
    dismiss.style.background = "#0047ab";
    dismiss.style.color = "#fff";
    dismiss.style.border = "none";
    dismiss.style.borderRadius = "8px";
    dismiss.style.fontWeight = "bold";
    dismiss.onclick = () => popup.remove();

    popup.appendChild(document.createElement("br"));
    popup.appendChild(dismiss);
    document.body.appendChild(popup);
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
    loader.style.background = "#ffffff";
    loader.style.zIndex = "2000";
    loader.innerHTML = `
        <div class="spinner"></div>
        <p style="font-family: 'Arial', sans-serif; font-size: 14px; color: #000; margin-top: 20px;">
            Made with ❤️ and collaboration from 🇨🇦
        </p>
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

    setTimeout(() => {
        const el = document.getElementById("loader");
        if (el) el.remove();
    }, 3000);
}

function update() {
    // This function runs every frame. Useful for animations or input tracking.
}


export { game, showGameUI, drawDrump };
