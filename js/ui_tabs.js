import { renderProfilePage } from "./profile.js";
import { showGameUI } from "./game.js";
import { renderEarnTab, getIncompleteTaskCount } from "./earn_tab.js";
import { COLORS, ZINDEX, FONT } from "./styles.js";
import { renderTopBar } from "./topbar.js";
import { renderPunchBar, renderPunchBadge, fetchPunchGap } from "./punchbar.js";
import { createReferralButton } from "./buttons.js";

function showTab(tab, scene = null) {
  window.activeTab = tab;

  if (tab === "game" && !scene) {
    scene = window.game?.scene?.scenes?.[0];
  }

  document.getElementById("page-content")?.remove();
  document.getElementById("punch-bar")?.remove();
  document.getElementById("punch-badge")?.remove();
  document.getElementById("rank-badge-circle")?.remove();
  document.getElementById("punch-gap-badge")?.remove();
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

  if (tab !== "profile" && window.userId) {
    createReferralButton(window.userId);
  }

  // === GAME TAB ===
  if (tab === "game") {
    renderPunchBar();
    renderPunchBadge();

    const activeScene = scene || window.game?.scene?.scenes?.[0] || null;
    if (activeScene) showGameUI(activeScene);
    if (window.userId) fetchPunchGap(window.userId);

    document.body.appendChild(content);

  } else if (tab === "leaderboard") {
    fetch(`https://drumpleaderboard-production.up.railway.app/leaderboard-status`)
      .then(res => res.json())
      .then(data => {
        if (!data.enabled) {
          Object.assign(content.style, {
            background: "transparent"
          });

          const fallback = document.createElement("div");
          Object.assign(fallback.style, {
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
            boxSizing: "border-box"
          });

          fallback.innerHTML = `
            <div style="width:100%;max-width:420px;background:${COLORS.badgeBg};
                        border:2px solid ${COLORS.primary};
                        border-radius:${ZINDEX.radius || '14px'};
                        padding:24px;text-align:center;
                        font-family:${FONT.body};color:${COLORS.primary};
                        box-shadow: 2px 2px 0 #000;">
              <h2 style="margin:0 0 6px;font-family:${FONT.heading};font-size:20px;">
                🚧 Leaderboard Under Maintenance
              </h2>
              <p style="margin:0;font-size:15px;">
                We’re improving your experience.<br>Please check back soon!
              </p>
            </div>`;
          content.appendChild(fallback);
        } else {
          const iframe = document.createElement("iframe");
          iframe.src = `https://drumpleaderboard-production.up.railway.app/leaderboard-page?user_id=${window.userId}`;
          Object.assign(iframe.style, {
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
            background: "transparent"
          });
          content.appendChild(iframe);
        }
      })
      .catch(() => {
        const errorText = document.createElement("div");
        errorText.textContent = "❌ Unable to load leaderboard.";
        errorText.style.padding = "16px";
        content.appendChild(errorText);
      })
      .finally(() => {
        document.body.appendChild(content);
      });

  } else if (tab === "earn") {
    document.body.appendChild(content);
    renderEarnTab();

  } else if (tab === "profile") {
    document.body.appendChild(content);
    renderProfilePage();

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
