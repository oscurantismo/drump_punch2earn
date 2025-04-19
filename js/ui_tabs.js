import { renderProfilePage } from "./profile.js";
import { showGameUI } from "./game.js";
import { createLeaderboardPopup } from "./popups.js";
import { renderEarnTab, getIncompleteTaskCount } from "./earn_tab.js";
import { renderTabs } from "./ui.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";
import { renderTopBar } from "./topbar.js";
import { renderPunchBar, renderPunchBadge } from "./punchbar.js";

function showTab(tab, scene = null) {
  document.querySelectorAll(
    "#top-bar, #punch-badge, #punch-bar, #punch-progress, #bonus-hint, #leaderboard-container, #earn-container, #profile-container"
  ).forEach(el => el && el.remove());

  // Set background
  document.body.style.backgroundImage = "url('drump-images/background.png')";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.transition = "background 0.3s ease";

  // Topbar always visible
  renderTopBar();

  // Update tab highlight and task badge
  const updateTabHighlight = () => {
    document.querySelectorAll("#tab-container button").forEach(btn => {
      const active = btn.dataset.tab === tab;
      btn.classList.toggle("active-tab", active);

      // Remove old badge with smooth transition
      const existingBadge = btn.querySelector(".task-badge");
      if (existingBadge) {
        existingBadge.style.opacity = "0";
        existingBadge.style.transform = "scale(0.8)";
        setTimeout(() => existingBadge.remove(), 200);
      }

      // If Earn tab, attach count badge
      if (btn.dataset.tab === "earn") {
        const incomplete = getIncompleteTaskCount?.() || 0;
        if (incomplete > 0) {
          const badge = document.createElement("span");
          badge.className = "task-badge";
          badge.textContent = incomplete;
          btn.appendChild(badge);
        }
      }
    });
  };

  renderTabs(tab);
  setTimeout(updateTabHighlight, 50);

  // === GAME TAB ===
  if (tab === "game") {
    if (!document.getElementById("punch-bar")) renderPunchBar();
    if (!document.getElementById("punch-badge")) renderPunchBadge();
    if (scene) showGameUI(scene);

  // === LEADERBOARD TAB ===
  } else if (tab === "leaderboard") {
    const container = document.createElement("div");
    container.id = "leaderboard-container";
    Object.assign(container.style, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      zIndex: ZINDEX.punchBar,
      background: "transparent",
    });

    const iframe = document.createElement("iframe");
    iframe.src = `https://drumpleaderboard-production.up.railway.app/leaderboard-page?user_id=${window.userId}`;
    Object.assign(iframe.style, {
      width: "100%",
      height: "100%",
      border: "none",
      display: "block",
    });

    const showFallback = () => {
      container.innerHTML = `
        <div style="height:100%;display:flex;align-items:center;justify-content:center;
                    padding:0 16px;box-sizing:border-box;background:#f8f9fe;">
          <div style="width:100%;max-width:420px;background:#fff;border:2px solid #2a3493;
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
    createLeaderboardPopup();

  // === EARN TAB ===
  } else if (tab === "earn") {
    renderEarnTab();

  // === PROFILE TAB ===
  } else if (tab === "profile") {
    renderProfilePage();

  // === INFO TAB (optional) ===
  } else if (tab === "info" && typeof renderInfoPage === "function") {
    renderInfoPage();
  }
}

export { showTab };
