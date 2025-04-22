import { COLORS, FONT, ZINDEX } from "./styles.js";
import { updatePunchDisplay } from "./ui.js";

let badgeTextEl;

async function fetchPunchGap(userId) {
  try {
    const res = await fetch(`https://drumpleaderboard-production.up.railway.app/leaderboard?user_id=${userId}`);
    const data = await res.json();

    if (data && typeof data.punches_to_next_rank === "number") {
      window.punchGap = data.punches_to_next_rank;
    } else {
      window.punchGap = 0;
    }

    if (data && typeof data.rank === "number") {
      window.userRank = data.rank; // ✅ assign rank here
    }

  } catch (err) {
    console.error("❌ Failed to fetch punch gap:", err);
    window.punchGap = 0;
    window.userRank = "-";
  }

  renderPunchGapBadge();
  renderPunchBadge(); // ✅ make sure badge updates visually too
}


function getBonusAmount(punchCount) {
  const withinCycle = punchCount % 500;
  switch (withinCycle) {
    case 100: return 25;
    case 200: return 30;
    case 300: return 35;
    case 400: return 40;
    case 0: return punchCount > 0 ? 50 : 0;
    default: return 0;
  }
}

function renderPunchBadge() {
  if (window.activeTab !== "game") return;
  if (document.getElementById("punch-badge")) return;

  const rank = typeof window.userRank === "number" ? window.userRank : "–";

  // === Outer Blue Badge Container ===
  const badge = document.createElement("div");
  badge.id = "punch-badge";
  Object.assign(badge.style, {
    position: "fixed",
    top: "70px",
    left: "0.75rem",
    display: "flex",
    alignItems: "center",
    height: "48px",
    width: "148px",
    background: "#2a3493",
    color: "#fff",
    borderRadius: "22px",
    border: "2px solid #000",
    fontFamily: "'Negrita Pro', sans-serif",
    fontSize: "14px",
    boxShadow: "2px 2px 0 #000",
    zIndex: 1001,
    paddingLeft: "80px", // extra left padding to leave space for the circle
    paddingRight: "18px",
    paddingTop: "4px",
    paddingBottom: "4px",
  });

  // === Text Content (Punches) ===
  badgeTextEl = document.createElement("div");
  badgeTextEl.id = "punch-badge-text";
  Object.assign(badgeTextEl.style, {
    display: "flex",
    flexDirection: "column",
    lineHeight: "1.1",
    fontFamily: "'Negrita Pro', sans-serif",
    fontWeight: "normal",
  });

  const label = document.createElement("div");
  label.textContent = "Punches";
  Object.assign(label.style, {
    fontSize: "14px",
    fontWeight: "normal",
  });

  const count = document.createElement("div");
  count.textContent = (window.punches || 0).toLocaleString();
  Object.assign(count.style, {
    fontSize: "18px",
    fontWeight: "normal",
  });

  badgeTextEl.append(label, count);
  badge.appendChild(badgeTextEl);
  document.body.appendChild(badge);

  // === Cream Circle with Rank ===
  const iconCircle = document.createElement("div");
  Object.assign(iconCircle.style, {
    position: "fixed",
    top: "68px", // align top visually with badge
    left: "0.75rem",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#FFEDAC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Reem Kufi Fun', sans-serif",
    fontSize: "18px",
    fontWeight: "600",
    color: "#2a3493",
    boxShadow: "2px 2px 0 #000",
    zIndex: 1002,
  });
  iconCircle.textContent = rank;

  document.body.appendChild(iconCircle);
}

function renderPunchGapBadge() {
  const existing = document.getElementById("punch-gap-badge");
  if (existing) existing.remove();

  if (window.activeTab !== "game") return;
  if (!window.punchGap || window.punchGap <= 0) return;

  const badge = document.createElement("div");
  badge.id = "punch-gap-badge";
  badge.textContent = `${window.punchGap} punches until new rank`;
  Object.assign(badge.style, {
    position: "fixed",
    top: "104px",
    right: "0.75rem",
    background: "#F21B1B",
    color: "#FFE99B",
    fontSize: "14px",
    fontFamily: "'Reem Kufi Fun', sans-serif",
    padding: "6px 14px",
    borderRadius: "10px",
    zIndex: ZINDEX.punchBar + 2,
    boxShadow: "2px 2px 0 #000",
  });

  document.body.appendChild(badge);
}

function renderPunchBar() {
  if (window.activeTab !== "game") return;

  if (!document.getElementById("punchbar-stripe-style")) {
    const style = document.createElement("style");
    style.id = "punchbar-stripe-style";
    style.innerHTML = `
      @keyframes stripes {
        from { background-position: 0 0; }
        to   { background-position: 30px 0; }
      }
      .stripe-overlay {
        position: absolute; inset: 0;
        background-image: linear-gradient(45deg,
          rgba(255,255,255,.2) 25%, transparent 25%,
          transparent 50%, rgba(255,255,255,.2) 50%,
          rgba(255,255,255,.2) 75%, transparent 75%);
        background-size: 30px 30px;
        animation: stripes 1.2s linear infinite;
        pointer-events: none;
        z-index: 2;
        border-radius: 999px;
      }
      @keyframes floatGain {
        0%   { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-32px); opacity: 0; }
      }
      .gain-label {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-family: 'Commissioner', sans-serif;
        color: #fff;
        font-size: 14px;
        animation: floatGain 0.9s ease-out forwards;
        z-index: 10;
      }
      .gain-label.bonus {
        background: #FFCC68;
        color: #000;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 16px;
      }
    `;
    document.head.appendChild(style);
  }

  // === Container for the whole punch bar ===
  const punchBar = document.createElement("div");
  punchBar.id = "punch-bar";
  Object.assign(punchBar.style, {
    position: "fixed",
    top: "130px",
    left: "0.75rem",
    right: "0.75rem",
    background: "#FFE99B",
    color: "#000",
    fontFamily: "'Reem Kufi Fun', sans-serif",
    fontSize: "14px",
    padding: "6px 12px 20px 12px",
    borderRadius: "12px",
    border: "2px solid #000",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    boxShadow: "2px 2px 0 #000",
    gap: "4px"
  });

  const topRow = document.createElement("div");
  Object.assign(topRow.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px"
  });

  const icon = document.createElement("img");
  icon.src = "drump-images/flamepunch.svg";
  Object.assign(icon.style, {
    width: "32px",
    height: "32px",
  });

  const center = document.createElement("div");
  Object.assign(center.style, {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  });

  const title = document.createElement("div");
  title.textContent = "My Progress";
  Object.assign(title.style, {
    fontFamily: "'Negrita Pro', sans-serif",
    fontSize: "15px",
    marginBottom: "2px",
  });

  const barWrap = document.createElement("div");
  Object.assign(barWrap.style, {
    position: "relative",
    width: "100%",
    height: "16px",
    borderRadius: "999px",
    background: "#FFE99B",
    overflow: "hidden",
    border: "2px solid #000",
  });

  const fill = document.createElement("div");
  fill.id = "punch-fill";
  Object.assign(fill.style, {
    position: "absolute",
    top: "0",
    bottom: "0",
    left: "0",
    width: "0%",
    background: "#2a3493",
    borderRadius: "999px",
    transition: "width 0.4s ease",
    zIndex: 1,
  });

  fill.appendChild(Object.assign(document.createElement("div"), { className: "stripe-overlay" }));
  barWrap.appendChild(fill);

  // === Tick Marks with Milestone Bonuses ===
  const tickContainer = document.createElement("div");
  Object.assign(tickContainer.style, {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "space-between",
    zIndex: 3,
    pointerEvents: "none",
  });

  // Add 4 tick marks between 5 sections: 0–100–200–300–400–500
  const milestones = [
    { offset: 100, label: "+25" },
    { offset: 200, label: "+30" },
    { offset: 300, label: "+35" },
    { offset: 400, label: "+40" }
  ];

  milestones.forEach((milestone, i) => {
    const tickWrap = document.createElement("div");
    Object.assign(tickWrap.style, {
      position: "absolute",
      top: "0",
      height: "100%",
      left: `${(milestone.offset / 500) * 100}%`, // evenly spaced between 0–500
      transform: "translateX(-1px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
    });

    const tick = document.createElement("div");
    Object.assign(tick.style, {
      height: "100%",
      width: "2px",
      background: "#fff",
    });

    const labelBottom = document.createElement("div");
    labelBottom.textContent = milestone.label;
    Object.assign(labelBottom.style, {
      marginTop: "2px",
      fontSize: "13px",
      fontFamily: "'Reem Kufi Fun', sans-serif",
      color: "#000",
      position: "absolute",
      bottom: "-18px",
      left: "50%",
      transform: "translateX(-50%)",
      whiteSpace: "nowrap",
    });

    tickWrap.append(tick, labelBottom);
    tickContainer.appendChild(tickWrap);
  });

  barWrap.appendChild(tickContainer);

  // === Add the elements ===
  center.append(title, barWrap);
  topRow.append(icon, center);

  const upgrade = document.createElement("img");
  upgrade.src = "drump-images/upgrade.svg";
  Object.assign(upgrade.style, {
    width: "24px",
    height: "24px",
    cursor: "pointer",
  });
  upgrade.title = "Upgrade (coming soon)";
  topRow.appendChild(upgrade);

  punchBar.appendChild(topRow);
  document.body.appendChild(punchBar);

  // === Punch count BELOW the bar block ===
  const punchText = document.createElement("div");
  punchText.id = "punch-progress";
  Object.assign(punchText.style, {
    position: "fixed",
    top: "200px", // just below the bar
    left: "0.75rem",
    fontSize: "13px",
    color: "#000",
    fontFamily: "'Reem Kufi Fun', sans-serif",
  });
  document.body.appendChild(punchText);

  // === Floating Bonus Animations ===
  const floatingContainer = document.createElement("div");
  floatingContainer.id = "punch-gain-container";
  Object.assign(floatingContainer.style, {
    position: "fixed",
    top: "118px",
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex: 1001,
  });
  document.body.appendChild(floatingContainer);

  updatePunchDisplay();

  if (window.userId) {
    fetchPunchGap(window.userId); // Always fetch punch gap on game tab open
  }
}


function showFloatingBonus(text, isBonus = false) {
  const gain = document.createElement("div");
  gain.className = "gain-label";
  if (isBonus) gain.classList.add("bonus");
  gain.textContent = text;

  const container = document.getElementById("punch-gain-container");
  container.appendChild(gain);

  setTimeout(() => gain.remove(), isBonus ? 1800 : 900);
}

export { renderPunchBar, showFloatingBonus, renderPunchBadge, renderPunchGapBadge, badgeTextEl };
