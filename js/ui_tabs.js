/* ui_tabs.js
 * Tab‑switching logic for Drump | Punch2Earn
 * Replaces the old “tasks” tab with the new “earn” tab.
 */
import { renderProfilePage } from "./profile.js";
import { showGameUI } from "./game.js";
import { createLeaderboardPopup } from "./popups.js";
import { renderEarnTab } from "./earn_tab.js";          // ← NEW
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Keyframe helpers (kept from original)                                   */
if (!document.getElementById("badge-anim-style")) {
  const style = document.createElement("style");
  style.id = "badge-anim-style";
  style.innerHTML = `
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0);   }
    }
    @keyframes borderPulse {
      0%   { box-shadow: 0 0 0 0 rgba(255,204,104,.7); }
      70%  { box-shadow: 0 0 0 6px rgba(255,204,104,0);}
      100% { box-shadow: 0 0 0 0 rgba(255,204,104,0);}
    }
  `;
  document.head.appendChild(style);
}

/* ────────────────────────────────────────────────────────────────────────── */
function showTab(tab, scene = null) {
  /* Clear any previously rendered containers */
  [
    "game-container",
    "leaderboard-container",
    "earn-container",      // ← updated id
    "profile-container",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  /* GAME TAB ------------------------------------------------------------- */
  if (tab === "game" && scene) {
    showGameUI(scene);

  /* LEADERBOARD TAB ------------------------------------------------------ */
  } else if (tab === "leaderboard") {
    const container = document.createElement("div");
    container.id = "leaderboard-container";
    Object.assign(container.style, {
      position: "fixed",
      top: "100px",                 // below punch bar
      bottom: "0",
      left: "0",
      right: "0",
      /* width 100 % is implicit with left/right 0; avoids 100 vw scrollbar issue */
      height: "calc(100vh - 100px)",
      zIndex: 999,
      overflow: "hidden",           // prevent horizontal bleed
      animation: "fadeSlideIn 0.4s ease-out",
    });

    const iframe = document.createElement("iframe");
    iframe.src = `https://drumpleaderboard-production.up.railway.app/leaderboard-page?user_id=${window.userId}`;
    Object.assign(iframe.style, {
      width: "100%",
      height: "100%",
      border: "none",
      display: "block",
    });

  container.appendChild(iframe);
  document.body.appendChild(container);
  createLeaderboardPopup();


  /* EARN TAB (new) ------------------------------------------------------- */
  } else if (tab === "earn") {
    renderEarnTab();   // earn_tab.js takes care of its own DOM & styling

  /* PROFILE TAB (called elsewhere) -------------------------------------- */
  } else if (tab === "profile") {
    renderProfilePage();
  }
}

export { showTab };
