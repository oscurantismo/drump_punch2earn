let game;
let punches = 0;
let activeTab = "game";
let storedUsername = "Anonymous";
let usernameElement;
let userId = "";
let loadeddrumpFrames = new Set(["drump-images/1a-min.png"]);
let backwardInterval;
let lastPunchTime = 0;
let currentFrame = 1; // Track Drump's current image frame
let lastFrameBeforeBackwards = 1; // Track the last frame before backward animation
const BACKWARD_DELAY = 2000; // 2 seconds before going backward
const BACKWARD_SPEED = 50; // 300ms per frame

window.onload = () => {
    createLoader();

    const gameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#ffffff",
        scene: { preload, create }
    };

    game = new Phaser.Game(gameConfig);
};

let drump, punchSounds = [], soundButton;
let hitCooldown = false;
let soundEnabled = true;

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
            Made with ❤️ and contribution from &#127464;&#127462;
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

    setTimeout(() => removeLoader(), 5000);
}

function removeLoader() {
    const el = document.getElementById("loader");
    if (el) el.remove();
}

function preload() {
    this.load.image("drump1", "drump-images/1a-min.png");
    this.load.image("background", "drump-images/Background.png"); // Make sure the file is available
    this.load.spritesheet("punch", "drump-images/punch-ezgif.com-gif-to-sprite-converter.png", {
        frameWidth: 200, // Adjust to your actual frame width
        frameHeight: 200, // Adjust to your actual frame height
        endFrame: 8 // Adjust to your actual frame count
        });

    this.load.image("sound_on", "sound_on.svg");
    this.load.image("sound_off", "sound_off.svg");
    for (let i = 1; i <= 4; i++) {
        this.load.audio("punch" + i, "punch" + i + ".mp3");
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
    if (cached !== null) {
        punches = parseInt(cached);
    }

    this.anims.create({
        key: 'punchAnim',
        frames: this.anims.generateFrameNumbers('punch', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: 0
    });

    this.input.setDefaultCursor("default"); // Apply default cursor on all devices

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

// Fetch user profile data
function fetchProfileData() {
    fetch(`https://drumpleaderboard-production.up.railway.app/profile?user_id=${userId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            document.getElementById("coin-count").textContent = data.coins || 0;
        })
        .catch(error => {
            console.error("Error fetching profile data:", error);
            alert("Failed to fetch profile data. Please try again later.");
        });
}

function renderProfilePage() {
    // Remove any existing profile container to prevent duplicates
    const existingProfile = document.getElementById("profile-container");
    if (existingProfile) {
        existingProfile.remove();
    }

    // Create the profile container
    const container = document.createElement("div");
    container.id = "profile-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.background = "#ffffff";
    container.style.zIndex = "2000";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.fontFamily = "'Arial Black', sans-serif";

    // Profile card
    const card = document.createElement("div");
    card.style.background = "#0047ab";
    card.style.color = "#fff";
    card.style.padding = "30px";
    card.style.borderRadius = "20px";
    card.style.width = "90%";
    card.style.maxWidth = "400px";
    card.style.textAlign = "center";
    card.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
    card.style.border = "2px solid #002868";

    // Title
    const title = document.createElement("h2");
    title.innerText = `${storedUsername}'s Profile`;
    title.style.color = "#ffffff";
    title.style.marginBottom = "20px";
    card.appendChild(title);

    // Coins display
    const coinDisplay = document.createElement("p");
    coinDisplay.innerHTML = `💰 Coins: <span id="coin-count">0</span>`;
    coinDisplay.style.fontSize = "18px";
    coinDisplay.style.marginBottom = "20px";
    card.appendChild(coinDisplay);

    // Referral message
    const referralMessage = document.createElement("p");
    referralMessage.innerText = "Invite friends and earn 10 coins per referral!";
    referralMessage.style.fontSize = "14px";
    referralMessage.style.color = "#ffcc00";
    referralMessage.style.marginBottom = "20px";
    card.appendChild(referralMessage);

    // Referral Link Section
    const referralContainer = document.createElement("div");
    referralContainer.style.display = "flex";
    referralContainer.style.alignItems = "center";
    referralContainer.style.marginBottom = "20px";

    const referralInput = document.createElement("input");
    referralInput.type = "text";
    referralInput.value = `https://t.me/TrumpToss_bot?start=referral_${userId}`;
    referralInput.readOnly = true;
    referralInput.style.flex = "1";
    referralInput.style.padding = "10px";
    referralInput.style.border = "2px solid #0047ab";
    referralInput.style.borderRadius = "12px";
    referralInput.style.background = "#fff";
    referralInput.style.color = "#000";
    referralInput.style.fontSize = "14px";

    // Copy Button
    const copyButton = document.createElement("button");
    copyButton.innerText = "📋 Copy";
    copyButton.style.marginLeft = "10px";
    copyButton.style.padding = "10px";
    copyButton.style.background = "#0077cc";
    copyButton.style.color = "#fff";
    copyButton.style.border = "none";
    copyButton.style.borderRadius = "12px";
    copyButton.style.cursor = "pointer";
    copyButton.onclick = () => {
        referralInput.select();
        navigator.clipboard.writeText(referralInput.value).then(() => {
            alert("Referral link copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy referral link: ", err);
            alert("Failed to copy referral link. Please try again.");
        });
    };

    referralContainer.appendChild(referralInput);
    referralContainer.appendChild(copyButton);
    card.appendChild(referralContainer);

    // Share Button
    const shareButton = document.createElement("button");
    shareButton.innerText = "🚀 Share Link";
    shareButton.style.padding = "12px 20px";
    shareButton.style.background = "#0047ab";
    shareButton.style.color = "#fff";
    shareButton.style.border = "none";
    shareButton.style.borderRadius = "12px";
    shareButton.style.cursor = "pointer";
    shareButton.style.marginBottom = "20px";
    shareButton.onclick = () => {
        const message = `Hey! 👋 I’ve been playing TrumpToss and it's hilarious! 😂 Earn points by throwing shoes at Trump. Join me and get started here: https://t.me/TrumpToss_bot?start=referral_${userId}`;
        Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(`https://t.me/TrumpToss_bot?start=referral_${userId}`)}&text=${encodeURIComponent(message)}`);
    };
    card.appendChild(shareButton);

    // Close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "❌ Close";
    closeButton.style.background = "#ff6756";
    closeButton.style.color = "#fff";
    closeButton.style.padding = "10px 20px";
    closeButton.style.borderRadius = "12px";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.transition = "background 0.3s";
    closeButton.onmouseover = () => closeButton.style.background = "#e05547";
    closeButton.onmouseout = () => closeButton.style.background = "#ff6756";
    closeButton.onclick = closeProfile;
    card.appendChild(closeButton);

    // Append card to container and to the body
    container.appendChild(card);
    document.body.appendChild(container);

    // Fetch and display profile data
    fetchProfileData();
}


function closeProfile() {
    const container = document.getElementById("profile-container");
    if (container) container.remove();
}


// Event to Open Profile
function renderTopBar() {
    // Remove any existing top bar to prevent duplicates
    const existingTopBar = document.getElementById("top-bar");
    if (existingTopBar) {
        existingTopBar.remove();
    }

    // Create the top bar container
    const top = document.createElement("div");
    top.id = "top-bar";
    top.style.position = "fixed";
    top.style.top = "0.5rem";
    top.style.left = "1rem";
    top.style.background = "#fff";
    top.style.color = "#000";
    top.style.border = "2px solid #0047ab";
    top.style.borderRadius = "10px";
    top.style.fontFamily = "'Arial Black', sans-serif";
    top.style.padding = "6px 12px";
    top.style.zIndex = "1000";

    // Create the username display with profile access
    usernameElement = document.createElement("div"); 
    usernameElement.innerHTML = `👤 ${storedUsername}`;
    usernameElement.style.cursor = "pointer";
    usernameElement.onclick = renderProfilePage;
    top.appendChild(usernameElement);

    // Create the punch counter
    const punchBar = document.createElement("div");
    punchBar.id = "punch-bar";
    punchBar.style.position = "fixed";
    punchBar.style.top = "50px";
    punchBar.style.left = "1rem";
    punchBar.style.right = "1rem";
    punchBar.style.background = "#b22234";
    punchBar.style.color = "#ffffff";
    punchBar.style.textAlign = "center";
    punchBar.style.fontFamily = "'Arial Black', sans-serif";
    punchBar.style.fontSize = "18px";
    punchBar.style.padding = "6px 0";
    punchBar.style.borderRadius = "8px";
    punchBar.style.zIndex = "999";
    punchBar.innerText = `🥾 Punches: ${punches}`;
    document.body.appendChild(punchBar);

    // Add sound toggle button
    const iconSize = 32;
    soundButton = document.createElement("img");
    soundButton.src = soundEnabled ? "sound_on.svg" : "sound_off.svg";
    soundButton.style.position = "fixed";
    soundButton.style.top = "calc(0.5rem + 4px)";
    soundButton.style.right = "12px";
    soundButton.style.width = `${iconSize}px`;
    soundButton.style.height = `${iconSize}px`;
    soundButton.style.cursor = "pointer";
    soundButton.style.zIndex = "1001";
    soundButton.onclick = () => {
        soundEnabled = !soundEnabled;
        soundButton.src = soundEnabled ? "sound_on.svg" : "sound_off.svg";
    };
    document.body.appendChild(soundButton);

    // Append the top bar to the document
    document.body.appendChild(top);

    // Ensure default cursor on all devices
    document.body.style.cursor = "default";
}


function updatePunchDisplay() {
    const bar = document.getElementById("punch-bar");
    if (bar) {
        bar.innerText = `🥾 Punches: ${punches}`;
    }
}


function renderTabs() {
    const tabBar = document.createElement("div");
    tabBar.id = "tab-container";
    tabBar.style.position = "fixed";
    tabBar.style.bottom = "0";
    tabBar.style.left = "0";
    tabBar.style.width = "100%";
    tabBar.style.display = "flex";
    tabBar.style.justifyContent = "space-around";
    tabBar.style.background = "#002868";
    tabBar.style.zIndex = "1000";

    ["game", "leaderboard", "info"].forEach(tab => {
        const btn = document.createElement("button");
        btn.innerText = tab.toUpperCase();
        btn.style.flex = "1";
        btn.style.padding = "12px";
        btn.style.fontSize = "14px";
        btn.style.border = "none";
        btn.style.color = "#fff";
        btn.style.background = (tab === activeTab) ? "#003f8a" : "#002868";
        btn.onclick = () => {
            activeTab = tab;
            showTab(tab);
            document.querySelectorAll("#tab-container button").forEach(b => b.style.background = "#002868");
            btn.style.background = "#003f8a";
        };
        tabBar.appendChild(btn);
    });

    document.body.appendChild(tabBar);
}

function renderShareButton() {
    const btn = document.createElement("button");
    btn.innerText = "📣 Share Score";
    btn.style.position = "fixed";
    btn.style.bottom = "60px";
    btn.style.right = "20px";
    btn.style.padding = "10px 14px";
    btn.style.fontSize = "14px";
    btn.style.background = "#0077cc";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.fontFamily = "'Arial Black', sans-serif";
    btn.style.zIndex = "1001";

    btn.onclick = () => {
        const botLink = "https://t.me/Drump_punch_bot";
        const message = `I punched ${punches} points in Drump | Punch2Earn. Wanna punch to earn?`;

        Telegram.WebApp.showPopup({
            title: "Share your score",
            message: `Choose where to share your ${punches} punches:`,
            buttons: [
                { id: "telegram", type: "default", text: "Telegram" },
                { id: "x", type: "default", text: "X (Twitter)" },
                { id: "whatsapp", type: "default", text: "WhatsApp" },
            ]
        }, (btnId) => {
            const links = {
                telegram: `https://t.me/share/url?url=${encodeURIComponent(botLink)}&text=${encodeURIComponent(message)}`,
                whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(message + ' ' + botLink)}`,
                x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message + ' ' + botLink)}`
            };
            if (btnId && links[btnId]) {
                window.open(links[btnId], "_blank");
            }
        });
    };

    document.body.appendChild(btn);
}

function showTab(tab, scene = null) {
    ["game-container", "leaderboard-container", "info-container"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });

    if (tab === "game" && scene) {
        showGameUI(scene);
    } else if (tab === "leaderboard") {
        const container = document.createElement("div");
        container.id = "leaderboard-container";
        container.style.position = "fixed";
        container.style.overflowY = "auto";
        container.style.top = "100px"; // below punch bar
        container.style.bottom = "0"; // Remove gaps by aligning to bottom
        container.style.left = "0";
        container.style.right = "0";
        container.style.width = "100vw";
        container.style.height = "calc(100vh - 100px)"; // Adjust dynamically to fit screen without gaps
        container.style.background = "#ffffff";
        container.style.zIndex = "999";

        const iframe = document.createElement("iframe");
        iframe.src = `https://drumpleaderboard-production.up.railway.app/leaderboard-page?user_id=${userId}`;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";

        container.appendChild(iframe);
        document.body.appendChild(container);
    } else if (tab === "info") {
        const info = document.createElement("div");
        info.id = "info-container";
        info.style.position = "fixed";
        info.style.top = "100px"; // Start below punch bar
        info.style.bottom = "0"; // Remove gaps by aligning to bottom
        info.style.left = "0";
        info.style.right = "0";
        info.style.width = "100vw";
        info.style.height = "calc(100vh - 100px)"; // Adjust dynamically to fit screen without gaps
        info.style.padding = "20px";
        info.style.background = "#ffffff";
        info.style.fontFamily = "Arial";
        info.style.overflowY = "auto";
        info.style.overflowX = "hidden";
        info.style.boxSizing = "border-box";
        info.style.zIndex = "999";
        info.innerHTML = `
            <h2>👟 Drump | Punch2Earn</h2>
            <p>Punch drump with a shoe. Simple as that. From like-minded cryptonerds tired of unpredictability. 
            <h3>What do I do?</h3>
            <p>Punch to earn. Collect punches. Compete on the leaderboard.</p>
            <p>🏗 <b>Upcoming:</b> Event drops, airdrops, collectibles. Stay tuned for more updates.</p>
            <p>🤖 Powered by frustration.py</p>
        `;
        document.body.appendChild(info);
    }
}


function drawdrump(scene, textureKey) {
    const image = scene.textures.get(textureKey).getSourceImage();

    if (!image) {
        console.error(`Failed to retrieve image: ${textureKey}`);
        return;
    }

    const imageWidth = image.width;
    const imageHeight = image.height;
    const maxWidth = window.innerWidth * 0.7; // 60vw
    const scale = Math.min(maxWidth / imageWidth, window.innerHeight / imageHeight);

    if (drump) {
        drump.destroy();
    }

    // Shift downwards by 10% of screen height
    const yPosition = scene.scale.height / 2.3 + (scene.scale.height * 0.15);

    drump = scene.add.image(scene.scale.width / 2, yPosition, textureKey)
        .setScale(scale)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

    drump.on("pointerdown", () => handlePunch());
}

function showGameUI(scene) {
    // Add the background image and set it to cover the whole screen
    const background = scene.add.image(scene.scale.width / 2, scene.scale.height / 2, "background")
        .setOrigin(0.5)
        .setDisplaySize(scene.scale.width, scene.scale.height)
        .setDepth(-10); // Ensure it's behind everything else

    // Always start with the first image (1a-min.png) when the app is launched
    const textureKey = `1a-min.png`;
    console.log(`Setting initial image to: ${textureKey}`);
    
    if (!loadeddrumpFrames.has(textureKey)) {
        scene.load.image(textureKey, `drump-images/${textureKey}`);
        scene.load.once(`filecomplete-image-${textureKey}`, () => {
            console.log(`Successfully loaded: ${textureKey}`);
            loadeddrumpFrames.add(textureKey);
            drawdrump(scene, textureKey);
        });

        scene.load.once('loaderror', (file) => {
            if (file.key === textureKey) {
                console.error(`Failed to load image: ${file.key}. Please check the file path.`);
            }
        });

        scene.load.start();
    } else {
        console.log(`Image already loaded: ${textureKey}`);
        drawdrump(scene, textureKey);
    }

    for (let i = 1; i <= 4; i++) {
        punchSounds.push(scene.sound.add("punch" + i));
    }

}

function showPunchEffect() {
    if (!game.scene.scenes[0]) return;

    // Ensure punch effect is created and visible
    const punchEffect = game.scene.scenes[0].add.sprite(
        drump.x,
        drump.y,
        "punch"
    )
    .setScale(0.9)
    .setOrigin(0.5) // Center the frame
    .setCrop(0, 0, 200, 200) // Ensure only one frame is visible
    .setDepth(9999) // Ensure it is above everything else
    .play('punchAnim');

    console.log("Punch effect shown");

    // Keep the punch effect visible for 2 seconds before removing it
    setTimeout(() => {
        punchEffect.destroy();
        console.log("Punch effect removed");
    }, 500);
}

function handlePunch() {
    if (activeTab !== "game") {
        console.log("Score submission blocked. User is not on the game screen.");
        return; // Prevent score submission if not on the game screen
    }

    punches++;
    lastPunchTime = Date.now();
    updatePunchDisplay();
    localStorage.setItem(`score_${userId}`, punches);

    if (soundEnabled) {
        const sound = Phaser.Math.RND.pick(punchSounds);
        sound.play();
    }

    if (!hitCooldown) {
        hitCooldown = true;

        // Ensure the frame continues from the current state, without jumping to 30
        if (currentFrame < 30) {
            currentFrame++;
        }

        const key = `${currentFrame}a-min.png`;

        // Check if image is preloaded; load if not
        if (!loadeddrumpFrames.has(key)) {
            game.scene.scenes[0].load.image(key, `drump-images/${key}`);
            game.scene.scenes[0].load.once('complete', () => {
                loadeddrumpFrames.add(key);
                drump.setTexture(key);
            });
            game.scene.scenes[0].load.start();
        } else {
            drump.setTexture(key);
        }

        // Show punch effect
        showPunchEffect();

        const floatingText = drump.scene.add.text(drump.x, drump.y - 100, "🤛+1", {
            font: "bold 24px Arial",
            fill: "#ff0000",
            stroke: "#fff",
            strokeThickness: 3
        }).setOrigin(0.5);

        drump.scene.tweens.add({
            targets: floatingText,
            y: floatingText.y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            onComplete: () => floatingText.destroy()
        });

        setTimeout(() => {
            hitCooldown = false;
        }, 200);

        if (backwardInterval) clearInterval(backwardInterval);
        startBackwardAnimation();
    }

    fetch("https://drumpleaderboard-production.up.railway.app/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: storedUsername, user_id: userId, score: punches })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("Score submitted successfully!");
    })
    .catch(error => {
        console.error("Error submitting score:", error);
    });
}

function startBackwardAnimation() {
    if (backwardInterval) clearInterval(backwardInterval);

    const adjustedSpeed = BACKWARD_SPEED * 0.7; // 30% faster

    backwardInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastPunchTime >= BACKWARD_DELAY) {
            const frameNum = parseInt(drump.texture.key.replace('a-min.png', ''));

            // Ensure the backward animation stops at image 1
            if (frameNum <= 1) {
                clearInterval(backwardInterval);
                currentFrame = 1; // Reset to 1a-min.png
                return;
            }

            const newFrameNum = frameNum - 1;
            currentFrame = newFrameNum; // Update the current frame
            const key = `${newFrameNum}a-min.png`;

            if (!loadeddrumpFrames.has(key)) {
                game.scene.scenes[0].load.image(key, `drump-images/${key}`);
                game.scene.scenes[0].load.once('complete', () => {
                    loadeddrumpFrames.add(key);
                    drump.setTexture(key);
                });
                game.scene.scenes[0].load.start();
            } else {
                drump.setTexture(key);
            }
        }
    }, adjustedSpeed); // Faster animation (30% faster)
}
