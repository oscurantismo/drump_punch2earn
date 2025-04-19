import { handlePunch, initPunchModule, wiggleDrump } from "./punch.js";
import { renderTabs, updatePunchDisplay } from "./ui.js";
import { getIncompleteTaskCount } from "./earn_tab.js";
import { showTab } from "./ui_tabs.js";
import { renderTopBar } from "./topbar.js";
import { renderPunchBar } from "./punchbar.js";
import { createReferralAndRewardsButtons } from "./buttons.js";
import { showInfoPage } from "./popups.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

let game;
let drump;
let punchSounds = [];
let loadeddrumpFrames = new Set(["drump-images/1a-min.png"]);
window.soundEnabled = true; // ✅ make globally accessible

let pendingPunches = 0;
let lastSubmitTime = 0;
const SUBMIT_INTERVAL = 15000; // 15 seconds
const PUNCH_THRESHOLD = 10;    // Punches per sync

window.onload = () => {
    createLoader();
    createGame();
    renderTopBar();          // Always show topbar
    renderPunchBar();        // Show punch bar immediately
    renderTabs();
    setTimeout(() => {
        const earnBtn = document.querySelector('#tab-container button[data-tab="earn"]');
        if (earnBtn && !earnBtn.querySelector(".task-badge")) {
            const incomplete = getIncompleteTaskCount?.() || 0;
            if (incomplete > 0) {
                const badge = document.createElement("span");
                badge.className = "task-badge";
                badge.textContent = incomplete;
                earnBtn.appendChild(badge);
            }
        }
    }, 20); // wait for tab to fully render
    // Show bottom nav
    showTab("game");         // Default tab on launch
};

function createGame() {
    const gameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: COLORS.badgeBg,
        scene: { preload, create },
        audio: {
            disableWebAudio: false
        }
    };

    game = new Phaser.Game(gameConfig);
    window.game = game;
}

function preload() {
    this.load.image("drump1", "drump-images/1a-min.png");
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

function create() {
    Telegram.WebApp.ready();

    const initUser = Telegram.WebApp.initDataUnsafe?.user;
        if (initUser) {
            const fallbackUsername = initUser.username || "Anonymous";
            const firstName = initUser.first_name || "";
            const lastName = initUser.last_name || "";

            // Display name logic
            let displayName = "Anonymous";
            if (firstName.trim()) {
                displayName = firstName;
            } else if (lastName.trim()) {
                displayName = lastName;
            } else {
                displayName = fallbackUsername;
            }

            window.storedUsername = displayName; // For display
            window.telegramUsername = fallbackUsername; // For logging / backend
            window.userId = initUser.id.toString();
        }


    window.activeTab = "game";

    const cached = localStorage.getItem(`score_${window.userId}`);
    if (cached !== null) {
        window.punches = parseInt(cached);
    }

    updatePunchDisplay();

    fetch(`https://drumpleaderboard-production.up.railway.app/profile?user_id=${window.userId}`)
    .then(res => res.json())
    .then(profile => {
        if (typeof profile.punches === "number") {
            // Update only if backend score is higher
            if (profile.punches > window.punches) {
                window.punches = profile.punches;
                updatePunchDisplay();
                const punchEl = document.getElementById("punch-count");
                if (punchEl) punchEl.textContent = window.punches;
            }
        }
    })
    .catch(err => console.error("❌ Failed to sync punches from server:", err));


    // ✅ Resume audio context if needed
    if (this.sound.context.state === "suspended") {
        this.sound.context.resume();
    }

    // ✅ Load punch sounds with fallback
    punchSounds = [];
    for (let i = 1; i <= 4; i++) {
        try {
            const sound = this.sound.add("punch" + i, {
                volume: 0.8,
                loop: false
            });
            punchSounds.push(sound);
        } catch (e) {
            console.warn(`⚠️ Failed to load punch sound ${i}:`, e);
        }
    }

    renderTopBar();
    renderTabs();

    showGameUI(this);
    registerUser();

    createReferralAndRewardsButtons(window.userId);

    if (!localStorage.getItem("onboarding_complete")) {
        setTimeout(() => showOnboarding(), 300); // Give UI time to render
    }

}

function showGameUI(scene) {
    // 1. Add background
    scene.add.image(scene.scale.width / 2, scene.scale.height / 2, "background")
        .setOrigin(0.5)
        .setDisplaySize(scene.scale.width, scene.scale.height)
        .setDepth(-10);

    // 2. Add dark overlay above background but behind Drump
    const darkOverlay = scene.add.rectangle(
        scene.scale.width / 2,
        scene.scale.height / 2,
        scene.scale.width,
        scene.scale.height,
        0x000000,
        0 // Opacity (0 to 1) – adjust for how dark you want
    ).setDepth(-9);

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

function showOnboarding() {
    const steps = [
        {
            title: "👋 Welcome to Drump | Punch2Earn",
            message: "Tap Drump as many times as you can. Each punch earns points!"
        },
        {
            title: "👊 How it works",
            message: "Tap directly on Drump to punch. The more you punch, the redder he gets!"
        },
        {
            title: "🏆 Why it matters",
            message: "Climb the leaderboard, earn rewards, and unlock daily tasks soon!"
        }
    ];

    let step = 0;

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "80vw";
    overlay.style.height = "80vh";
    overlay.style.background = "rgba(0, 0, 0, 0.75)";
    overlay.style.zIndex = "4000";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.color = "#fff";
    overlay.style.fontFamily = FONT.body;
    overlay.style.textAlign = "center";
    overlay.style.padding = "20px";

    const box = document.createElement("div");
    box.style.background = COLORS.primary;
    box.style.color = COLORS.offWhite;
    box.style.padding = "24px";
    box.style.borderRadius = "16px";
    box.style.maxWidth = "80vw";
    box.style.boxShadow = "0 0 12px rgba(0,0,0,0.4)";

    const title = document.createElement("h2");
    const message = document.createElement("p");
    const button = document.createElement("button");

    button.innerText = "Next";
    button.style.marginTop = "12px";
    button.style.padding = "10px 18px";
    button.style.background = COLORS.offWhite;
    button.style.color = COLORS.primary;
    button.style.border = "none";
    button.style.borderRadius = "10px";
    button.style.fontSize = "16px";

    function renderStep(index) {
        title.innerText = steps[index].title;
        message.innerText = steps[index].message;
        if (index === steps.length - 1) {
            button.innerText = "Let’s go!";
        }
    }

    button.onclick = () => {
        step++;
        if (step >= steps.length) {
            localStorage.setItem("onboarding_complete", "true");
            overlay.remove();
        } else {
            renderStep(step);
        }
    };

    box.appendChild(title);
    box.appendChild(message);
    box.appendChild(button);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    renderStep(step);
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

    drump.originalScale = scale; // ✅ store for movement logic


    drump.on("pointerdown", (pointer) => {
        const profileVisible = document.getElementById("profile-container");
        const referralVisible = document.getElementById("referral-popup");

        if (window.activeTab !== "game" || profileVisible || referralVisible) return;

        const bounds = drump.getBounds();
        if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
            handlePunch(); // ✅ Successful hit
        } else {
            // ❌ Missed hit
            wiggleDrump(drump.scene);

            if (window.soundEnabled && drump.scene.sound) {
                const laugh = drump.scene.sound.add("laugh");
                laugh.play({ volume: 0.6 });
            }
        }
    });



    // ✅ Pass reference to punch.js
    initPunchModule({ drump, punchSounds, loadeddrumpFrames });
}

function showPopupMessage(message) {
    const popup = document.createElement("div");
    popup.innerText = message;
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = COLORS.offWhite;
    popup.style.border = "2px solid COLORS.offWhite";
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
