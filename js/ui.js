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

/* ────────────────────────────────────────────────────────────────────────── */
/*  BOTTOM TAB BAR                                                          */
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
    boxShadow: "0 -4px 10px rgba(0,0,0,0.2)",
  });

  /* active tab list */
  ["game", "leaderboard", "earn"].forEach((tab) => {
    const btn = document.createElement("button");

    /* Icon / label selection */
    let label = "❓";
    if (tab === "game")       label = "🥊";
    else if (tab === "leaderboard") label = "📊";
    else if (tab === "earn")  label = "💥 EARN";

    btn.textContent = label;
    btn.style.flex = "1";
    btn.style.padding = "12px 0";
    btn.style.fontSize = "20px";
    btn.style.border = "none";
    btn.style.transition = "all 0.3s ease";
    btn.style.borderTop = "2px solid #FFCC68";
    btn.style.fontFamily = FONT.body;
    btn.style.display = "flex";
    btn.style.justifyContent = "center";
    btn.style.alignItems = "center";
    btn.style.userSelect = "none";
    btn.style.cursor = "pointer";

    /* Active / inactive colours */
    const setActive = (isActive) => {
      btn.style.background = isActive ? "#ffffff" : COLORS.primary;
      btn.style.color      = isActive ? COLORS.primary : COLORS.textLight;
    };
    setActive(tab === window.activeTab);

    /* Click  */
    btn.onclick = () => {
      window.activeTab = tab;
      showTab(tab);
      document.querySelectorAll("#tab-container button").forEach((b) =>
        setActive(false)
      );
      setActive(true);
    };

    tabBar.appendChild(btn);
  });

  document.body.appendChild(tabBar);
}

/* ────────────────────────────────────────────────────────────────────────── */
export { renderTabs, updatePunchDisplay };
