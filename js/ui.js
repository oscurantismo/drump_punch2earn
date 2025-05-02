import { renderPunchBadge, renderPunchGapBadge } from "./punchbar.js";
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
    badgeTextEl.innerHTML = `Punches<br><span style="font-size:17px; font-weight:900">${count}</span>`;
  }

  // ✅ 500-cycle milestone logic (syncs with punch.js bonuses)
  const cycleProgress = count % 500;
  let milestone = 100;

  if (cycleProgress < 100) milestone = 100;
  else if (cycleProgress < 200) milestone = 200;
  else if (cycleProgress < 300) milestone = 300;
  else if (cycleProgress < 400) milestone = 400;
  else milestone = 500;

  const percent = (cycleProgress / milestone) * 100;
  const remaining = milestone - cycleProgress;

  if (fillEl) fillEl.style.width = `${percent}%`;
  if (countEl) countEl.textContent = `${cycleProgress} / ${milestone}`;
  if (hintEl) {
    hintEl.textContent = `${remaining} punches until bonus`;
    hintEl.style.transform = `translateX(-50%) scale(${percent < 5 ? 1.2 : 1})`;
    hintEl.style.opacity = percent < 5 ? "0.6" : "1";
  }

  if (typeof window.punchGap === "number") {
    renderPunchGapBadge();
  }
}

export { updatePunchDisplay };
