import { renderProfilePage } from "./profile.js";
import { showTab } from "./tabs.js";

let soundButton;
let soundEnabled = true;

function createLeaderboardPopup() {
    if (document.getElementById("leaderboard-reward-popup")) return; // already exists

    const popup = document.createElement("div");
    popup.id = "leaderboard-reward-popup";
    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100vw";
    popup.style.height = "100vh";
    popup.style.backgroundColor = "rgba(0,0,0,0.6)";
    popup.style.display = "none";
    popup.style.alignItems = "center";
    popup.style.justifyContent = "center";
    popup.style.zIndex = "4000";

    popup.innerHTML = `
      <div style="
          background: #fff;
          padding: 24px;
          border-radius: 14px;
          max-width: 340px;
          width: 90%;
          font-family: 'Segoe UI', sans-serif;
          text-align: left;
          box-shadow: 0 0 16px rgba(0,0,0,0.3);
          position: relative;
      ">
        <h3 style="text-align:center; color:#0047ab;">🏆 Leaderboard Rewards</h3>
        <ul style="font-size:14px; line-height:1.6; padding-left:18px; margin-top: 12px;">
          <li><b>Top-25</b>: +250 punches (once)</li>
          <li><b>Top-10</b>: +550 punches (once)</li>
          <li><b>Top-3</b>: +1000 | <b>Top-2</b>: +2000 | <b>Top-1</b>: +4000</li>
          <li><b>Drops:</b></li>
          <li>Left Top-10: -200</li>
          <li>Left Top-3/2/1: -600</li>
          <li>Left Top-25: -100</li>
        </ul>
        <div style="text-align:center; margin-top: 16px;">
            <div class="leaderboard-popup-close" style="position:absolute; top:8px; right:12px; cursor:pointer; color:#888;">
            ❌
            </div>
        </div>
        <div style="position:absolute; top:8px; right:12px; cursor:pointer; color:#888;" onclick="document.getElementById('leaderboard-reward-popup').style.display='none';">❌</div>
      </div>
    `;

    document.body.appendChild(popup);
}


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

function showReferralPopup() {
    const popup = document.createElement("div");
    popup.id = "referral-popup";
    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100vw";
    popup.style.height = "100vh";
    popup.style.backgroundColor = "rgba(0,0,0,0.6)";
    popup.style.display = "flex";
    popup.style.alignItems = "center";
    popup.style.justifyContent = "center";
    popup.style.zIndex = "4000";

    const card = document.createElement("div");
    card.style.background = "#fff";
    card.style.padding = "24px";
    card.style.borderRadius = "14px";
    card.style.maxWidth = "320px";
    card.style.width = "90%";
    card.style.position = "relative";
    card.style.fontFamily = "'Arial Black', sans-serif";
    card.style.textAlign = "center";
    card.innerHTML = `
        <h3>🎁 Refer a Friend</h3>
        <p style="font-size: 14px; color: #333;">
            Invite a friend and you both get <b>+1000 punches</b>!
        </p>
        <p style="font-size: 13px; color: #555;">Your unique referral link:</p>
        <input id="referral-link" value="https://t.me/Drump_punch_bot?start=referral_${window.userId}" readonly style="width: 100%; font-size: 13px; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 6px;" />
    `;

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "📋 Copy Link";
    copyBtn.style.marginTop = "4px";
    copyBtn.style.marginRight = "6px";
    copyBtn.style.padding = "8px 12px";
    copyBtn.style.border = "none";
    copyBtn.style.borderRadius = "8px";
    copyBtn.style.background = "#0047ab";
    copyBtn.style.color = "#fff";
    copyBtn.style.cursor = "pointer";
    copyBtn.onclick = () => {
        const linkInput = document.getElementById("referral-link");
        linkInput.select();
        document.execCommand("copy");
        copyBtn.innerText = "✅ Copied!";
        setTimeout(() => copyBtn.innerText = "📋 Copy Link", 2000);
    };

    const shareBtn = document.createElement("button");
    shareBtn.innerText = "📣 Share";
    shareBtn.style.marginTop = "4px";
    shareBtn.style.padding = "8px 12px";
    shareBtn.style.border = "none";
    shareBtn.style.borderRadius = "8px";
    shareBtn.style.background = "#0077cc";
    shareBtn.style.color = "#fff";
    shareBtn.style.cursor = "pointer";
    shareBtn.onclick = () => {
        const msg = `Punch to earn! Start here ➡️ https://t.me/Drump_punch_bot?start=referral_${window.userId}`;
        Telegram.WebApp.showPopup({
            title: "Share referral link",
            message: "Choose where to share your invite:",
            buttons: [
                { id: "telegram", type: "default", text: "Telegram" },
                { id: "x", type: "default", text: "X (Twitter)" },
                { id: "whatsapp", type: "default", text: "WhatsApp" }
            ]
        }, (btnId) => {
            const links = {
                telegram: `https://t.me/share/url?url=${encodeURIComponent(msg)}`,
                whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`,
                x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`
            };
            if (btnId && links[btnId]) {
                window.open(links[btnId], "_blank");
            }
        });
    };

    const btnGroup = document.createElement("div");
    btnGroup.style.display = "flex";
    btnGroup.style.justifyContent = "center";
    btnGroup.appendChild(copyBtn);
    btnGroup.appendChild(shareBtn);
    card.appendChild(btnGroup);

    const close = document.createElement("div");
    close.innerText = "❌";
    close.style.position = "absolute";
    close.style.top = "10px";
    close.style.right = "14px";
    close.style.fontSize = "18px";
    close.style.cursor = "pointer";
    close.style.color = "#999";
    close.onclick = () => popup.remove();
    card.appendChild(close);

    popup.appendChild(card);
    document.body.appendChild(popup);
}

export {
    renderTopBar,
    updatePunchDisplay,
    renderTabs,
    createLeaderboardPopup,
    showReferralPopup
};

