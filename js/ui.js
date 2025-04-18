import { showTab } from "./ui_tabs.js";
import { renderProfilePage } from "./profile.js";
import { createLeaderboardPopup, showReferralPopup } from "./popups.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

let soundButton;
let soundEnabled = true;


/* ────────────────────────────────────────────────────────────────────────── */
function updatePunchDisplay() {
  const count = window.punches || 0;
  const punchTextEl = document.getElementById("punch-text");
  const fillEl = document.getElementById("punch-fill");
  const countEl = document.getElementById("punch-progress");
  const hintEl = document.getElementById("bonus-hint");

  if (punchTextEl) punchTextEl.innerHTML = `🥊 Punches: ${count}`;

  const nextMilestone = Math.ceil(count / 100) * 100;
  const showMilestone = nextMilestone === count ? nextMilestone + 100 : nextMilestone;
  const remaining = showMilestone - count;
  const percent = Math.min(100, ((count - (showMilestone - 100)) / 100) * 100);

  if (fillEl) fillEl.style.width = `${percent}%`;
  if (countEl) countEl.textContent = `${count} / ${showMilestone}`;
  if (hintEl) {
    hintEl.textContent = `${remaining} punches until +25 bonus`;
    hintEl.style.transform = `translateX(-50%) scale(${percent < 5 ? 1.2 : 1})`;
    hintEl.style.opacity = percent < 5 ? "0.6" : "1";
  }
}

function renderTabs(activeTab = "game") {
  const tabBar = document.createElement("div");
  tabBar.id = "tab-container";
  Object.assign(tabBar.style, {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    background: "transparent",
    padding: "12px 0",
    zIndex: ZINDEX.tabBar,
  });

  const tabs = [
    { id: "game", label: "PUNCH", icon: "drump-images/punch.svg" },
    { id: "leaderboard", label: "LEADERBOARD", icon: "drump-images/leaderboard.svg" },
    { id: "earn", label: "EARN", icon: "drump-images/earn.svg" },
  ];

  tabs.forEach((tab) => {
    const btn = document.createElement("button");
    btn.dataset.tab = tab.id;

    Object.assign(btn.style, {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px 14px",
      fontFamily: FONT.body,
      fontSize: "13px",
      fontWeight: "bold",
      borderRadius: "12px",
      border: "2px solid #000",
      background: tab.id === activeTab ? "#fff2c5" : COLORS.badgeBg,
      boxShadow: tab.id === activeTab ? "inset 0 0 0 3px #000" : "2px 2px 0 #000",
      transition: "all 0.2s ease",
      cursor: "pointer",
      width: "110px",
      textAlign: "center",
    });

    btn.innerHTML = `
      <img src="${tab.icon}" alt="${tab.label}" style="height: 26px; margin-bottom: 6px;" />
      ${tab.label}
    `;

    btn.onclick = () => {
      window.activeTab = tab.id;
      showTab(tab.id);
    };

    tabBar.appendChild(btn);
  });

  document.body.appendChild(tabBar);
}


/* ────────────────────────────────────────────────────────────────────────── */
export { renderTabs, updatePunchDisplay };
