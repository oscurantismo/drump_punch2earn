/* ui_tabs.js
 * Tab‑switching logic for Drump | Punch2Earn
 * Replaces the old “tasks” tab with the new “earn” tab.
 */
import { renderProfilePage } from "./profile.js";
import { showGameUI } from "./game.js";
import { createLeaderboardPopup } from "./popups.js";
import { renderEarnTab } from "./earn_tab.js";
import { renderTopBar, renderTabs } from "./ui.js";
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
      top: "0",                   // full height (was 100px before)
      bottom: "0",
      left: "0",
      right: "0",
      width: "100%",
      height: "100vh",
      overflow: "hidden",
      zIndex: ZINDEX.topBar,
      background: "#ffe242",     // fallback background while loading
    });

    const iframe = document.createElement("iframe");
    iframe.src = `https://drumpleaderboard-production.up.railway.app/leaderboard-page?user_id=${window.userId}`;
    Object.assign(iframe.style, {
      width: "100%",
      height: "100%",
      border: "none",
      display: "block",
    });

    // ─── graceful fallback ───
    const showFallback = () => {
      container.innerHTML = `
        <div style="
          height:100%;display:flex;align-items:center;justify-content:center;
          padding:0 16px;box-sizing:border-box;background:#f8f9fe;">
          <div style="
            width:100%;max-width:420px;background:#fff;border:2px solid #2a3493;
            border-radius:10px;padding:24px;text-align:center;
            font-family:'Segoe UI',sans-serif;color:#2a3493;">
            <h2 style="margin:0 0 6px;">🚧 Leaderboard under maintenance</h2>
            <p style="margin:0;">Please check back soon – we’re improving your experience.</p>
          </div>
        </div>`;
    };

    iframe.onerror = showFallback;
    const timeout = setTimeout(showFallback, 5000);
    iframe.onload = () => clearTimeout(timeout);

    container.appendChild(iframe);
    document.body.appendChild(container);
    renderTopBar();
    renderTabs();
    createLeaderboardPopup();

  /* EARN TAB ------------------------------------------------------------- */
  } else if (tab === "earn") {
    renderEarnTab();

  /* PROFILE TAB ---------------------------------------------------------- */
  } else if (tab === "profile") {
    renderProfilePage();
  }
}

export { showTab };
