import { renderProfilePage } from "./profile.js";
import { showGameUI } from "./game.js";
import { createLeaderboardPopup } from "./popups.js";
import { renderEarnTab, getIncompleteTaskCount } from "./earn_tab.js";
import { renderTabs } from "./ui.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";
import { renderTopBar } from "./topbar.js";
import { renderPunchBar, renderPunchBadge } from "./punchbar.js";

function showTab(tab, scene = null) {
  window.activeTab = tab;

  // Clean up dynamic page content
  document.getElementById("page-content")?.remove();
  document.getElementById("punch-bar")?.remove();
  document.getElementById("punch-badge")?.remove();

  // Create the main content wrapper
  const content = document.createElement("div");
  content.id = "page-content";
  Object.assign(content.style, {
    position: "fixed",
    top: "60px",
    bottom: "64px",
    left: "0",
    right: "0",
    overflow: "hidden",
    zIndex: ZINDEX.punchBar,
  });

  // Always render top bar and tabs
  renderTopBar();
  renderTabs(tab);

  const updateTabHighlight = () => {
    document.querySelectorAll("#tab-container button").forEach(btn => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle("active-tab", isActive);

      const badge = btn.querySelector(".task-badge");
      if (badge) badge.remove();

      if (btn.dataset.tab === "earn") {
        const incomplete = getIncompleteTaskCount?.() || 0;
        if (incomplete > 0) {
          const newBadge = document.createElement("span");
          newBadge.className = "task-badge";
          newBadge.textContent = incomplete;
          btn.appendChild(newBadge);
        }
      }
    });
  };

  setTimeout(updateTabHighlight, 50);

  // === GAME TAB ===
  if (tab === "game") {
    if (!document.getElementById("punch-bar")) renderPunchBar();
    if (!document.getElementById("punch-badge")) renderPunchBadge();

    // ✅ Use stored scene fallback if needed
    const activeScene = scene || window.phaserScene;
    if (activeScene) {
      showGameUI(activeScene);
    } else {
      console.warn("⚠️ No Phaser scene available to render game.");
    }

  // === LEADERBOARD TAB ===
  } else if (tab === "leaderboard") {
    const iframe = document.createElement("iframe");
    iframe.src = `https://drumpleaderboard-production.up.railway.app/leaderboard-page?user_id=${window.userId}`;
    Object.assign(iframe.style, {
      width: "100%",
      height: "100%",
      border: "none",
      display: "block",
      background: "transparent",
    });

    iframe.onerror = () => {
      content.innerHTML = `
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

    const timeout = setTimeout(() => iframe.onerror(), 5000);
    iframe.onload = () => clearTimeout(timeout);

    content.appendChild(iframe);
    document.body.appendChild(content);
    createLeaderboardPopup();

  // === EARN TAB ===
  } else if (tab === "earn") {
    document.body.appendChild(content);
    renderEarnTab();

  // === PROFILE TAB ===
  } else if (tab === "profile") {
    document.body.appendChild(content);
    renderProfilePage();

  // === INFO TAB ===
  } else if (tab === "info" && typeof renderInfoPage === "function") {
    document.body.appendChild(content);
    renderInfoPage();
  }
}

export { showTab };
