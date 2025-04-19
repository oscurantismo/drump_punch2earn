import { renderProfilePage } from "./profile.js";
import { showGameUI } from "./game.js";
import { createLeaderboardPopup } from "./popups.js";
import { renderEarnTab, getIncompleteTaskCount } from "./earn_tab.js";
import { renderTabs } from "./ui.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";
import { renderTopBar } from "./topbar.js";
import { renderPunchBar, renderPunchBadge } from "./punchbar.js";

function showTab(tab, scene = null) {
  // === Keep topbar and bottom tabs — only remove content ===
  document.getElementById("page-content")?.remove();

  // === Create dedicated container for tab-specific content ===
  const content = document.createElement("div");
  content.id = "page-content";
  Object.assign(content.style, {
    position: "fixed",
    top: "60px", // below topbar
    bottom: "64px", // above nav tabs
    left: "0",
    right: "0",
    zIndex: ZINDEX.punchBar,
    overflow: "hidden",
  });

  // === Update tab highlight and badge ===
  const updateTabHighlight = () => {
    document.querySelectorAll("#tab-container button").forEach(btn => {
      const active = btn.dataset.tab === tab;
      btn.classList.toggle("active-tab", active);

      const existingBadge = btn.querySelector(".task-badge");
      if (existingBadge) {
        existingBadge.style.opacity = "0";
        existingBadge.style.transform = "scale(0.8)";
        setTimeout(() => existingBadge.remove(), 200);
      }

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

  // === Static topbar and nav tabs ===
  renderTopBar();
  renderTabs(tab);
  setTimeout(updateTabHighlight, 50);

  // === GAME TAB ===
  if (tab === "game") {
    if (!document.getElementById("punch-bar")) renderPunchBar();
    if (!document.getElementById("punch-badge")) renderPunchBadge();
    showGameUI(scene);
    // Game UI manages its own page layer — no need for content container

  // === LEADERBOARD TAB ===
  } else if (tab === "leaderboard") {
    const iframe = document.createElement("iframe");
    iframe.src = `https://drumpleaderboard-production.up.railway.app/leaderboard-page?user_id=${window.userId}`;
    Object.assign(iframe.style, {
      width: "100%",
      height: "100%",
      border: "none",
      display: "block",
      background: "transparent"
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
