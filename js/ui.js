import { renderProfilePage } from "./profile.js";
import { showTab } from "./ui_tabs.js";
import { createLeaderboardPopup, showReferralPopup } from "./popups.js";

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
    punchBar.innerHTML = `🥊 Punches: ${window.punches || 0}`;
    document.body.appendChild(punchBar);

    const punchProgress = document.createElement("div");
    punchProgress.id = "punch-progress";
    punchProgress.style.position = "fixed";
    punchProgress.style.top = "88px";
    punchProgress.style.left = "1rem";
    punchProgress.style.fontFamily = "'Arial Black', sans-serif";
    punchProgress.style.fontSize = "16px";
    punchProgress.style.color = "#002868";
    punchProgress.style.zIndex = "999";
    document.body.appendChild(punchProgress);

    const bonusHint = document.createElement("div");
    bonusHint.id = "bonus-hint";
    bonusHint.style.position = "fixed";
    bonusHint.style.top = "112px";
    bonusHint.style.left = "1rem";
    bonusHint.style.fontSize = "13px";
    bonusHint.style.color = "#444";
    bonusHint.style.zIndex = "999";
    bonusHint.style.fontFamily = "Arial, sans-serif";
    document.body.appendChild(bonusHint);

    updatePunchDisplay();

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

    document.body.style.cursor = "default";
}

function updatePunchDisplay() {
    const count = window.punches || 0;

    const punchBar = document.getElementById("punch-bar");
    if (punchBar) punchBar.innerHTML = `🥊 Punches: ${count}`;

    const nextMilestone = Math.ceil(count / 100) * 100;
    const showMilestone = nextMilestone === count ? nextMilestone + 100 : nextMilestone;
    const remaining = showMilestone - count;

    const countEl = document.getElementById("punch-progress");
    const hintEl = document.getElementById("bonus-hint");

    if (countEl) countEl.innerHTML = `🥊 ${count} / ${showMilestone}`;
    if (hintEl) hintEl.innerText = `${remaining} punches until +25 bonus`;
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

    ["game", "leaderboard", "tasks"].forEach(tab => {
        const btn = document.createElement("button");

        let label = tab.toUpperCase();
        if (tab === "leaderboard") label = "🏆 LEADERBOARD";
        if (tab === "tasks") label = "💥 EARN"; 
        if (tab === "game") label = "🥊PUNCH"; 

        btn.innerText = label;
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

export {
    renderTopBar,
    updatePunchDisplay,
    renderTabs
};

