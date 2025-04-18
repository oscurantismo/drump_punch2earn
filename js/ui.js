import { showTab } from "./ui_tabs.js";
import { renderPunchBadge } from "./punchbar.js";
import { COLORS, FONT, ZINDEX } from "./styles.js";

function updatePunchDisplay() {
  const count = window.punches || 0;
  const punchTextEl = document.getElementById("punch-text");
  const fillEl = document.getElementById("punch-fill");
  const countEl = document.getElementById("punch-progress");
  const hintEl = document.getElementById("bonus-hint");
  const badgeTextEl = document.getElementById("punch-badge-text");

  if (punchTextEl) punchTextEl.innerHTML = `🥊 Punches: ${count}`;
  if (badgeTextEl) {
    badgeTextEl.innerHTML = `Punches<br><span style="font-size:17px; font-weight:900">${window.punches}</span>`;
  }


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

export { renderTabs, updatePunchDisplay };
