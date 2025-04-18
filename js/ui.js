/* ui.js
 * Top‑bar, punch‑bar and bottom‑tab rendering
 * — updated for the new “earn” tab —
 */
import { renderProfilePage } from "./profile.js";
import { showTab } from "./ui_tabs.js";
import { createLeaderboardPopup, showReferralPopup } from "./popups.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

let soundButton;
let soundEnabled = true;

/* ────────────────────────────────────────────────────────────────────────── */
/*  TOP BAR & PUNCH BAR                                                     */
function renderTopBar() {
  /* Keyframe helpers injected once */
  if (!document.getElementById("punchbar-stripe-style")) {
    const style = document.createElement("style");
    style.id = "punchbar-stripe-style";
    style.innerHTML = `
      @keyframes stripes {
        from { background-position: 0 0; }
        to   { background-position: 30px 0; }
      }
      .stripe-overlay {
        position: absolute; inset: 0;
        background-image: linear-gradient(45deg,
          rgba(255,255,255,.2) 25%, transparent 25%,
          transparent 50%,           rgba(255,255,255,.2) 50%,
          rgba(255,255,255,.2) 75%,  transparent 75%);
        background-size: 30px 30px;
        animation: stripes 1.2s linear infinite;
        pointer-events: none; z-index: 2;
      }
      @keyframes floatStars {
        0%   { transform: translateY(0)   scale(1);   opacity: 1; }
        100% { transform: translateY(-40px) scale(1.3); opacity: 0; }
      }
      .floating-star {
        position: absolute; bottom: 4px;
        width: 12px; height: 12px; border-radius: 50%;
        background: #fff9a0;
        animation: floatStars 2s ease-out infinite;
        pointer-events: none; z-index: 3;
      }
    `;
    document.head.appendChild(style);
  }

  /* === USERNAME PILL ==================================================== */
  const top = document.createElement("div");
  Object.assign(top.style, {
    position: "fixed",
    top: "0.5rem",
    left: "1rem",
    background: COLORS.offWhite,
    color: COLORS.primary,
    border: `2px solid ${COLORS.primary}`,
    borderRadius: BORDER.radius,
    fontFamily: FONT.heading,
    padding: "6px 12px",
    zIndex: ZINDEX.topBar,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  });
  top.title = "Tap to open your profile";

  const usernameElement = document.createElement("div");
  usernameElement.innerHTML = window.storedUsername;
  usernameElement.style.fontWeight = "bold";

  const settingsIcon = document.createElement("img");
  settingsIcon.src = "drump-images/settings.svg";
  Object.assign(settingsIcon.style, {
    width: "18px",
    height: "18px",
    opacity: "0.75",
  });

  top.onclick = () => {
    window.activeTab = "profile";
    renderProfilePage();
  };

  top.append(usernameElement, settingsIcon);
  document.body.appendChild(top);

  /* === PUNCH BAR ======================================================== */
  const punchBar = document.createElement("div");
  punchBar.id = "punch-bar";
  Object.assign(punchBar.style, {
    position: "fixed",
    top: "50px",
    left: "1rem",
    right: "1rem",
    background: "#000",
    color: "#fff",
    textAlign: "center",
    fontFamily: FONT.body,
    fontSize: "18px",
    padding: "6px 0",
    borderRadius: "8px",
    zIndex: ZINDEX.punchBar,
    overflow: "hidden",
  });

  const punchText = document.createElement("div");
  punchText.id = "punch-text";
  punchText.innerHTML = `🥊 Punches: ${window.punches || 0}`;
  Object.assign(punchText.style, {
    position: "relative",
    zIndex: "4",
    pointerEvents: "none",
    padding: "4px 10px",
    fontWeight: "bold",
  });
  punchBar.appendChild(punchText);

  /* Progress fill */
  const progressFill = document.createElement("div");
  progressFill.id = "punch-fill";
  Object.assign(progressFill.style, {
    position: "absolute",
    inset: "0 auto 0 0",
    borderRadius: "8px 0 0 8px",
    width: "0%",
    background: COLORS.primary,
    transition: "width 0.4s ease",
    zIndex: 1,
  });
  progressFill.appendChild(Object.assign(document.createElement("div"), { className: "stripe-overlay" }));
  punchBar.appendChild(progressFill);

  /* Decorative stars */
  for (let i = 0; i < 5; i++) {
    const star = document.createElement("div");
    star.className = "floating-star";
    star.style.left = `${10 + i * 20}%`;
    star.style.animationDelay = `${i * 0.4}s`;
    punchBar.appendChild(star);
  }

  document.body.appendChild(punchBar);

  /* Milestone / bonus info lines */
  const punchProgress = document.createElement("div");
  punchProgress.id = "punch-progress";
  Object.assign(punchProgress.style, {
    position: "fixed",
    top: "105px",
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: FONT.body,
    fontSize: "16px",
    color: "#222",
    zIndex: ZINDEX.punchBar,
  });
  document.body.appendChild(punchProgress);

  const bonusHint = document.createElement("div");
  bonusHint.id = "bonus-hint";
  Object.assign(bonusHint.style, {
    position: "fixed",
    top: "126px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "13px",
    color: "#222",
    fontFamily: FONT.body,
    zIndex: ZINDEX.punchBar,
    transition: "opacity 0.3s ease, transform 0.3s ease",
  });
  document.body.appendChild(bonusHint);

  updatePunchDisplay();

  /* Sound toggle */
  const iconSize = 32;
  soundButton = document.createElement("img");
  soundButton.src = "sound_on.svg";
  Object.assign(soundButton.style, {
    position: "fixed",
    top: "calc(0.5rem + 4px)",
    right: "12px",
    width: `${iconSize}px`,
    height: `${iconSize}px`,
    cursor: "pointer",
    zIndex: ZINDEX.soundIcon,
  });
  soundButton.onclick = () => {
    soundEnabled = !soundEnabled;
    soundButton.src = soundEnabled ? "sound_on.svg" : "sound_off.svg";
    window.soundEnabled = soundEnabled;
  };
  document.body.appendChild(soundButton);

  document.body.style.cursor = "default";
}

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
export { renderTopBar, renderTabs, updatePunchDisplay };
