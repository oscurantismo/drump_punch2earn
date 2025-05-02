import { renderPunchBadge, renderPunchGapBadge } from "./punchbar.js";
import { COLORS, FONT, ZINDEX } from "./styles.js";

let gapTimeout;

function requestPunchGapUpdate() {
  clearTimeout(gapTimeout);
  gapTimeout = setTimeout(() => {
    if (typeof window.userId === "string") {
      fetchPunchGap(window.userId);
    }
  }, 300); // Slight delay to avoid over-requesting
}


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

  const cycle = 500;
  const cyclePunches = count % cycle || cycle; // ✅ Treat 500 as full bar, not 0
  let milestone = 0;
  let nextBonus = "";

  if (cyclePunches <= 100) {
    milestone = 100;
    nextBonus = "+25";
  } else if (cyclePunches <= 200) {
    milestone = 200;
    nextBonus = "+30";
  } else if (cyclePunches <= 300) {
    milestone = 300;
    nextBonus = "+35";
  } else if (cyclePunches <= 400) {
    milestone = 400;
    nextBonus = "+40";
  } else {
    milestone = 500;
    nextBonus = "+50";
  }

  const previousMilestone = milestone - 100;
  const localProgress = cyclePunches - previousMilestone;
  const percent = (localProgress / 100) * 20 + (previousMilestone / cycle) * 100;

  if (fillEl) fillEl.style.width = `${percent}%`;
  if (countEl) countEl.textContent = `${cyclePunches} / ${milestone}`;
  if (hintEl) {
    hintEl.textContent = `${milestone - cyclePunches} punches until ${nextBonus} bonus`;
    hintEl.style.transform = `translateX(-50%) scale(${percent < 5 ? 1.2 : 1})`;
    hintEl.style.opacity = percent < 5 ? "0.6" : "1";
  }

  if (typeof window.punchGap === "number") {
    renderPunchGapBadge();
  }

  requestPunchGapUpdate();

  if (typeof window.userId === "string") {
    fetchPunchGap(window.userId); // ✅ Live refresh after punch
  }

}

export { updatePunchDisplay };
