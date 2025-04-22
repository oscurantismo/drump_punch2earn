import { renderPunchBadge, renderPunchGapBadge } from "./punchbar.js";
import { COLORS, FONT, ZINDEX } from "./styles.js";

function updatePunchDisplay() {
  const count = window.punches || 0;
  const nextBlock = Math.ceil(count / 500) * 500;
  const progressText = document.getElementById("punch-progress");
  if (progressText) progressText.textContent = `${count.toLocaleString()} / ${nextBlock.toLocaleString()} punches`;

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

  if (typeof window.punchGap === "number") {
    renderPunchGapBadge();
  }

}

export { updatePunchDisplay };
