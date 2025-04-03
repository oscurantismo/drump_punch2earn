import { renderProfilePage } from "./profile.js";
import { showTab } from "./tabs.js";

let soundButton;
let soundEnabled = true;

function renderTopBar() {
    const top = document.createElement("div");
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

    const usernameElement = document.createElement("div");
    usernameElement.innerHTML = `👤 ${window.storedUsername}`;
    usernameElement.style.cursor = "pointer";
    usernameElement.onclick = () => {
        window.activeTab = "profile";
        renderProfilePage();
    };
    top.appendChild(usernameElement);
    document.body.appendChild(top);

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
    punchBar.innerText = `🥾 Punches: ${window.punches || 0}`;
    document.body.appendChild(punchBar);

    const iconSize = 32;
    soundButton = document.createElement("img");
    soundButton.src = "sound_on.svg";
    soundButton.style.position = "fixed";
    soundButton.style.top = "calc(0.5rem + 4px)";
    soundButton.style.right = "12px";
    soundButton.style.width = iconSize + "px";
    soundButton.style.height = iconSize + "px";
    soundButton.style.cursor = "pointer";
    soundButton.style.zIndex = "1001";
    soundButton.onclick = () => {
        soundEnabled = !soundEnabled;
        soundButton.src = soundEnabled ? "sound_on.svg" : "sound_off.svg";
        window.soundEnabled = soundEnabled;
    };
    document.body.appendChild(soundButton);

    document.body.style.cursor = "default"; // Always default cursor
}

function updatePunchDisplay() {
    const bar = document.getElementById("punch-bar");
    if (bar) {
        bar.innerText = `🥾 Punches: ${window.punches}`;
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
        btn.style.background = (tab === window.activeTab) ? "#003f8a" : "#002868";
        btn.onclick = () => {
            window.activeTab = tab;
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
        const botLink = "https://t.me/Drump_bot";
        const message = `I punched ${window.punches || 0} points in Drump | Punch2Earn. Wanna punch to earn?`;

        Telegram.WebApp.showPopup({
            title: "Share your score",
            message: `Choose where to share your ${window.punches} punches:`,
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

export {
    renderTopBar,
    updatePunchDisplay,
    renderTabs,
    renderShareButton
};
