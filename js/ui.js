import { renderProfilePage } from "./profile.js";
import { showTab } from "./ui_tabs.js";
import { createLeaderboardPopup, showReferralPopup } from "./popups.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

let soundButton;
let soundEnabled = true;


// Add new CSS for punchbar pattern
if (!document.getElementById("punchbar-animation-style")) {
    const style = document.createElement("style");
    style.id = "punchbar-animation-style";
    style.innerHTML = `
        @keyframes stripes {
            from { background-position: 0 0; }
            to { background-position: 30px 0; }
        }
        .punch-stripe-fill::after {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: linear-gradient(45deg,
                rgba(0, 0, 0, .1) 25%,
                transparent 25%,
                transparent 50%,
                rgba(0, 0, 0, .1) 50%,
                rgba(0, 0, 0, .1) 75%,
                transparent 75%,
                transparent);
            background-size: 30px 30px;
            border-radius: 16px;
            animation: stripes 2s linear infinite;
            z-index: 1;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}

function renderTopBar() {
    const top = document.createElement("div");
    top.style.position = "fixed";
    top.style.top = "0.5rem";
    top.style.left = "1rem";
    top.style.background = COLORS.offWhite;
    top.style.color = COLORS.badgeBg;
    top.style.border = `2px solid ${COLORS.deepRed}`;
    top.style.borderRadius = BORDER.radius;
    top.style.fontFamily = FONT.heading;
    top.style.padding = "6px 12px";
    top.style.zIndex = ZINDEX.topBar;
    top.style.display = "flex";
    top.style.alignItems = "center";
    top.style.gap = "8px";
    top.style.cursor = "pointer";
    top.title = "Tap to open your profile";

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
    Object.assign(punchBar.style, {
        position: "fixed",
        top: "50px",
        left: "1rem",
        right: "1rem",
        background: COLORS.deepRed,
        color: COLORS.badgeBg,
        textAlign: "center",
        fontFamily: FONT.body,
        fontSize: "18px",
        padding: "6px 0",
        borderRadius: "8px",
        zIndex: ZINDEX.punchBar,
        overflow: "hidden"
    });

    const punchText = document.createElement("div");
    punchText.id = "punch-text";
    punchText.innerHTML = `🥊 Punches: ${window.punches || 0}`;
    punchText.style.position = "relative";
    punchText.style.color = COLORS.badgeBg;
    punchText.style.zIndex = "2";
    punchText.style.pointerEvents = "none";
    punchBar.appendChild(punchText);

    const progressFill = document.createElement("div");
    progressFill.id = "punch-fill";
    Object.assign(progressFill.style, {
        height: "100%",
        position: "absolute",
        left: "0",
        top: "0",
        zIndex: "1",
        borderRadius: "8px 0 0 8px",
        width: "0%",
        background: `repeating-linear-gradient(
            45deg,
            ${COLORS.badgeBg},
            ${COLORS.badgeBg} 10px,
            ${COLORS.primary} 10px,
            ${COLORS.primary} 20px
        )`,
        backgroundSize: "40px 40px",
        animation: "stripeAnim 1.2s linear infinite",
        transition: "width 0.4s ease"
    });
    punchBar.appendChild(progressFill);
    document.body.appendChild(punchBar);

    // Add floating stars
    for (let i = 0; i < 5; i++) {
        const star = document.createElement("div");
        star.className = "floating-star";
        star.style.left = `${10 + i * 20}%`;
        star.style.animationDelay = `${i * 0.4}s`;
        punchBar.appendChild(star);
    }

    const punchProgress = document.createElement("div");
    punchProgress.id = "punch-progress";
    Object.assign(punchProgress.style, {
        position: "fixed",
        top: "88px",
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: FONT.body,
        fontSize: "16px",
        color: COLORS.primary,
        zIndex: ZINDEX.punchBar
    });
    document.body.appendChild(punchProgress);

    const bonusHint = document.createElement("div");
    bonusHint.id = "bonus-hint";
    Object.assign(bonusHint.style, {
        position: "fixed",
        top: "112px",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "13px",
        color: COLORS.badgeBg,
        zIndex: ZINDEX.punchBar,
        fontFamily: FONT.body,
        transition: "opacity 0.3s ease, transform 0.3s ease",
        opacity: "1"
    });
    document.body.appendChild(bonusHint);

    updatePunchDisplay = function () {
        const punches = window.punches || 0;
        const nextMilestone = Math.ceil(punches / 100) * 100;
        const base = nextMilestone - 100;
        const progress = punches - base;
        const percent = Math.min(100, (progress / 100) * 100);
        const remaining = 100 - progress;

        document.getElementById("punch-text").innerHTML = `🥊 Punches: ${punches}`;
        document.getElementById("punch-fill").style.width = `${percent}%`;
        document.getElementById("punch-progress").innerText = `${punches} / ${nextMilestone}`;
        const hint = document.getElementById("bonus-hint");
        hint.innerText = `${remaining} punches left until bonus 🏅`;
        hint.style.transform = `translateX(-50%) scale(${percent < 5 ? 1.2 : 1})`;
        hint.style.opacity = percent < 5 ? "0.6" : "1";
    };

    updatePunchDisplay();

    const iconSize = 32;
    soundButton = document.createElement("img");
    soundButton.src = "sound_on.svg";
    Object.assign(soundButton.style, {
        position: "fixed",
        top: "calc(0.5rem + 4px)",
        right: "12px",
        width: iconSize + "px",
        height: iconSize + "px",
        cursor: "pointer",
        zIndex: ZINDEX.soundIcon
    });
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
    Object.assign(tabBar.style, {
        position: "fixed",
        bottom: "0",
        left: "0",
        width: "100%",
        display: "flex",
        fontFamily: FONT.body,
        background: COLORS.primary,
        zIndex: ZINDEX.tabBar,
        boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.2)"
    });

    ["game", "leaderboard", "tasks"].forEach(tab => {
        const btn = document.createElement("button");

        let label = tab.toUpperCase();
        if (tab === "leaderboard") label = "LEADERBOARD";
        if (tab === "tasks") label = "💥 EARN";
        if (tab === "game") label = "PUNCH";

        btn.innerText = label;
        btn.style.flex = "1";
        btn.style.padding = "14px 8px";
        btn.style.fontSize = "13px";
        btn.style.border = "none";
        btn.style.background = (tab === window.activeTab) ? COLORS.badgeBg : COLORS.primary;
        btn.style.color = COLORS.textLight;
        btn.style.transition = "background 0.3s ease, transform 0.2s ease";
        btn.style.letterSpacing = "1px";
        btn.style.cursor = "pointer";

        btn.onmouseenter = () => btn.style.transform = "scale(1.05)";
        btn.onmouseleave = () => btn.style.transform = "scale(1)";

        btn.onclick = () => {
            window.activeTab = tab;
            showTab(tab);
            document.querySelectorAll("#tab-container button").forEach(b => b.style.background = COLORS.primary);
            btn.style.background = COLORS.badgeBg;
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

