import { handlePunch, initPunchModule } from "./punch.js";
import { renderTopBar, renderTabs, renderShareButton } from "./ui.js";

let game;
let drump;
let punchSounds = [];
let loadeddrumpFrames = new Set(["drump-images/1a-min.png"]);

window.onload = () => {
    createLoader();
    createGame();
};

function createGame() {
    const gameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#ffffff",
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
    this.load.image("background", "drump-images/Background.png");
    this.load.spritesheet("punch", "drump-images/punch-ezgif.com-gif-to-sprite-converter.png", {
        frameWidth: 200,
        frameHeight: 200,
        endFrame: 8
    });

    for (let i = 1; i <= 4; i++) {
        this.load.audio("punch" + i, `punch${i}.mp3`);
    }

    this.load.image("sound_on", "sound_on.svg");
    this.load.image("sound_off", "sound_off.svg");
}

function create() {
    Telegram.WebApp.ready();

    const initUser = Telegram.WebApp.initDataUnsafe?.user;
    if (initUser) {
        window.storedUsername = initUser.username || `${initUser.first_name}_${initUser.last_name || ""}`.trim();
        window.userId = initUser.id.toString();
    }

    window.activeTab = "game";

    const cached = localStorage.getItem(`score_${window.userId}`);

    if (cached !== null) {
    window.punches = parseInt(cached);
    }
    updatePunchDisplay(); // ✅ Move this here after punches are loaded


    this.anims.create({
        key: "punchAnim",
        frames: this.anims.generateFrameNumbers("punch", { start: 0, end: 7 }),
        frameRate: 10,
        repeat: 0
    });

    // Load punch sounds with fallback
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
    renderShareButton();

    showGameUI(this);

    initPunchModule({
        drump,
        punchSounds,
        loadeddrumpFrames
    });

    registerUser();
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
    }).then(res => res.json())
      .then(res => console.log("User registration:", res))
      .catch(console.error);
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

export { game, showGameUI, drawDrump };
