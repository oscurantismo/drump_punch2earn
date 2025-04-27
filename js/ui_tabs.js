import { renderProfilePage } from "./profile.js";
import { showGameUI } from "./game.js";
import { createLeaderboardPopup } from "./popups.js";
import { renderEarnTab, getIncompleteTaskCount } from "./earn_tab.js";
import { COLORS, ZINDEX } from "./styles.js";
import { renderTopBar } from "./topbar.js";
import { renderPunchBar, renderPunchBadge, fetchPunchGap } from "./punchbar.js";
import { createReferralAndRewardsButtons } from "./buttons.js";

function showTab(tab, scene = null) {
  window.activeTab = tab;

  if (tab === "game" && !scene) {
    scene = window.game?.scene?.scenes?.[0];
  }

  // ✅ REMOVE previous page content
  document.getElementById("page-content")?.remove();

  // ✅ Remove punch bar-related elements
  document.getElementById("punch-bar")?.remove();
  document.getElementById("punch-badge")?.remove();
  document.getElementById("rank-badge-circle")?.remove();
  document.getElementById("punch-gap-badge")?.remove();

  // ✅ Remove referral and rewards buttons
  document.getElementById("referral-button")?.remove();
  document.getElementById("rewards-button")?.remove();

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

  renderTopBar();
  renderTabs(tab);

  // === Update tab highlight and badge
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

  // === Show referral and rewards buttons (except profile)
  if (tab !== "profile" && window.userId) {
    createReferralAndRewardsButtons(window.userId);
  }

  // === GAME TAB ===
  if (tab === "game") {
    renderPunchBar();
    renderPunchBadge();

    const activeScene =
      scene || window.game?.scene?.scenes?.[0] || null;

    if (activeScene) {
      showGameUI(activeScene);
    }

    if (window.userId) {
      fetchPunchGap(window.userId);
    }

    document.body.appendChild(content);

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
    zIndex: ZINDEX.tabBar,
  });

  const tabs = [
    { id: "game", icon: "drump-images/punch.svg", label: "Punch" },
    { id: "leaderboard", icon: "drump-images/leaderboard.svg", label: "Leaderboard" },
    { id: "earn", icon: "drump-images/earn.svg", label: "Earn" },
  ];

  tabs.forEach((tab) => {
    const btn = document.createElement("button");
    btn.className = `tab-button ${tab.id === activeTab ? "active-tab" : ""}`;
    if (tab.id === "earn") btn.classList.add("jump-tab");
    btn.dataset.tab = tab.id;

    btn.innerHTML = `
      <img src="${tab.icon}" alt="${tab.label}" class="tab-icon" />
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

export { showTab, renderTabs };
