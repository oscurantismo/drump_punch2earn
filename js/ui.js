import { renderProfilePage } from "./profile.js";
import { showTab } from "./ui_tabs.js";
import { createLeaderboardPopup, showReferralPopup } from "./popups.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

let soundButton;
let soundEnabled = true;

function renderTopBar() {
    const top = document.createElement("div");
    top.style.position = "fixed";
    top.style.top = "0.5rem";
    top.style.left = "1rem";
    top.style.background = COLORS.offWhite;
    top.style.color = COLORS.deepRed;
    top.style.border = `2px solid ${COLORS.deepRed}`;
    top.style.borderRadius = BORDER.radius;
    top.style.fontFamily = FONT.heading;
    top.style.padding = "6px 12px";
    top.style.zIndex = ZINDEX.topBar;
    top.style.display = "flex";
    top.style.alignItems = "center";
    top.style.gap = "8px";
    top.style.cursor = "pointer";
    top.title = "Tap to open profile";

    const usernameElement = document.createElement("div");
    usernameElement.innerHTML = `${window.storedUsername}`;
    usernameElement.style.fontWeight = "bold";

    const settingsIcon = document.createElement("img");
    settingsIcon.src = "drump-images/settings.svg";
    settingsIcon.alt = "Settings";
    settingsIcon.style.width = "18px";
    settingsIcon.style.height = "18px";
    settingsIcon.style.marginLeft = "4px";
    settingsIcon.style.opacity = "0.75";

    top.onclick = () => {
        window.activeTab = "profile";
        renderProfilePage();
    };

    top.appendChild(usernameElement);
    top.appendChild(settingsIcon);
    document.body.appendChild(top);

    const punchBar = document.createElement("div");
    punchBar.id = "punch-bar";
    punchBar.style.position = "fixed";
    punchBar.style.top = "50px";
    punchBar.style.left = "1rem";
    punchBar.style.right = "1rem";
    punchBar.style.background = COLORS.deepRed;
    punchBar.style.color = COLORS.badgeBg;
    punchBar.style.textAlign = "center";
    punchBar.style.fontFamily = FONT.body;
    punchBar.style.fontSize = "18px";
    punchBar.style.padding = "6px 0";
    punchBar.style.borderRadius = "8px";
    punchBar.style.zIndex = ZINDEX.punchBar;
    punchBar.innerHTML = `🥊 Punches: ${window.punches || 0}`;

    const progressFill = document.createElement("div");
    progressFill.id = "punch-fill";
    progressFill.style.height = "6px";
    progressFill.style.marginTop = "6px";
    progressFill.style.borderRadius = "4px";
    progressFill.style.background = COLORS.badgeBg;
    progressFill.style.transition = "width 0.3s ease";
    punchBar.appendChild(progressFill);
    document.body.appendChild(punchBar);

    const punchProgress = document.createElement("div");
    punchProgress.id = "punch-progress";
    punchProgress.style.position = "fixed";
    punchProgress.style.top = "88px";
    punchProgress.style.left = "50%";
    punchProgress.style.transform = "translateX(-50%)";
    punchProgress.style.fontFamily = FONT.body;
    punchProgress.style.fontSize = "16px";
    punchProgress.style.color = COLORS.primary;
    punchProgress.style.zIndex = ZINDEX.punchBar;
    document.body.appendChild(punchProgress);

    const bonusHint = document.createElement("div");
    bonusHint.id = "bonus-hint";
    bonusHint.style.position = "fixed";
    bonusHint.style.top = "112px";
    bonusHint.style.left = "50%";
    bonusHint.style.transform = "translateX(-50%)";
    bonusHint.style.fontSize = "13px";
    bonusHint.style.color = COLORS.primary;
    bonusHint.style.zIndex = ZINDEX.punchBar;
    bonusHint.style.fontFamily = FONT.body;
    bonusHint.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    bonusHint.style.opacity = "1";
    document.body.appendChild(bonusHint);

    updatePunchDisplay = function () {
        const punchBarText = document.getElementById("punch-bar");
        const punchFill = document.getElementById("punch-fill");
        const punchProgress = document.getElementById("punch-progress");
        const bonusHint = document.getElementById("bonus-hint");

        const punches = window.punches || 0;
        const nextMilestone = Math.ceil(punches / 100) * 100;
        const base = nextMilestone - 100;
        const progress = punches - base;
        const percent = Math.min(100, (progress / 100) * 100);
        const remaining = 100 - progress;

        punchBarText.innerHTML = `🥊 Punches: ${punches}`;
        punchBarText.appendChild(punchFill);
        punchFill.style.width = `${percent}%`;

        punchProgress.innerText = `${punches} / ${nextMilestone}`;
        bonusHint.innerText = `${remaining} punches left until bonus 🏅`;

        bonusHint.style.transform = `translateX(-50%) scale(${percent < 5 ? 1.2 : 1})`;
        bonusHint.style.opacity = percent < 5 ? "0.6" : "1";
    };

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
    soundButton.style.zIndex = ZINDEX.soundIcon;
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
    tabBar.style.fontFamily = FONT.body;
    tabBar.style.color = COLORS.primary;
    tabBar.style.justifyContent = "space-around";
    tabBar.style.background = COLORS.badgeBg;
    tabBar.style.zIndex = "1000";

    ["game", "leaderboard", "tasks"].forEach(tab => {
        const btn = document.createElement("button");

        let label = tab.toUpperCase();
        if (tab === "leaderboard") label = "LEADERBOARD";
        if (tab === "tasks") label = "💥 EARN"; 
        if (tab === "game") label = "PUNCH"; 

        btn.innerText = label;
        btn.style.flex = "1";
        btn.style.padding = "12px";
        btn.style.fontSize = "14px";
        btn.style.border = "none";
        btn.style.color = "#fff";
        btn.style.background = (tab === window.activeTab) ? COLORS.badgeBg : COLORS.primary;
        btn.onclick = () => {
            window.activeTab = tab;
            showTab(tab);
            document.querySelectorAll("#tab-container button").forEach(b => b.style.background = COLORS.badgeBg);
            btn.style.background = COLORS.primary;
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

