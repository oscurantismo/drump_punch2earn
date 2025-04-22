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
    height: "36px",
    width: "80px",
    background: "#2a3493",
    color: "#fff",
    borderRadius: "22px",
    border: "2px solid #000",
    fontFamily: "'Negrita Pro', sans-serif",
    fontSize: "14px",
    boxShadow: "2px 2px 0 #000",
    zIndex: 1001,
    paddingLeft: "60px", // extra left padding to leave space for the circle
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
  iconCircle.id = "rank-badge-circle";
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
  badge.textContent = `${window.punchGap} left until new rank`;
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
        position: absolute;
        inset: 0;
        background-image: linear-gradient(45deg,
          rgba(255,255,255,.2) 25%, transparent 25%,
          transparent 50%, rgba(255,255,255,.2) 50%,
          rgba(255,255,255,.2) 75%, transparent 75%);
        background-size: 30px 30px;
        animation: stripes 1.2s linear infinite;
        pointer-events: none;
        z-index: 1;
        border-radius: 999px;
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
      @keyframes floatGain {
        0%   { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-32px); opacity: 0; }
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

  const punchBar = document.createElement("div");
  punchBar.id = "punch-bar";
  Object.assign(punchBar.style, {
    position: "fixed",
    top: "130px",
    left: "0.75rem",
    right: "0.75rem",
    background: "#FFE99B",
    border: "2px solid #000",
    borderRadius: "12px",
    padding: "6px 12px 6px 12px",
    zIndex: 1000,
    fontFamily: "'Reem Kufi Fun', sans-serif",
    boxShadow: "2px 2px 0 #000",
  });

  const topRow = document.createElement("div");
  Object.assign(topRow.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "6px",
  });

  const icon = document.createElement("img");
  icon.src = "drump-images/flamepunch.svg";
  Object.assign(icon.style, {
    width: "44px",
    height: "44px",
  });

  const title = document.createElement("div");
  title.textContent = "My Progress";
  Object.assign(title.style, {
    fontFamily: "'Negrita Pro', sans-serif",
    fontSize: "15px",
    flex: 1,
    textAlign: "center"
  });

  const upgrade = document.createElement("img");
  upgrade.src = "drump-images/upgrade.svg";
  Object.assign(upgrade.style, {
    width: "36px",
    height: "36px",
    cursor: "pointer",
  });
  upgrade.title = "Upgrade (coming soon)";

  topRow.append(icon, title, upgrade);

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
    top: 0,
    bottom: 0,
    left: 0,
    width: "0%",
    background: "#2a3493",
    borderRadius: "999px",
    transition: "width 0.4s ease",
    zIndex: 0,
  });

  const stripes = document.createElement("div");
  stripes.className = "stripe-overlay";
  fill.appendChild(stripes);
  barWrap.appendChild(fill);

  const milestoneWrap = document.createElement("div");
  Object.assign(milestoneWrap.style, {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "6px",
    padding: "0 2px",
  });

  const milestoneData = [
    { label: "bonus", showTick: false },
    { label: "+25", showTick: true },
    { label: "+30", showTick: true },
    { label: "+35", showTick: true },
    { label: "+40", showTick: true },
    { label: "+50", showTick: false },
  ];

  milestoneData.forEach((item) => {
    const milestone = document.createElement("div");
    Object.assign(milestone.style, {
      flex: "1",
      textAlign: "center",
      position: "relative",
    });

    if (item.showTick) {
      const tick = document.createElement("div");
      Object.assign(tick.style, {
        width: "2px",
        height: "16px",
        background: "#fff",
        position: "absolute",
        top: "-18px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 3,
      });
      milestone.appendChild(tick);
    }

    const label = document.createElement("div");
    label.textContent = item.label;
    Object.assign(label.style, {
      fontSize: "13px",
      fontFamily: "'Reem Kufi Fun', sans-serif",
      color: "#000",
    });

    milestone.appendChild(label);
    milestoneWrap.appendChild(milestone);
  });

  punchBar.append(topRow, barWrap, milestoneWrap);
  document.body.appendChild(punchBar);

  // Floating gain label container
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
    fetchPunchGap(window.userId); // ✅ fetch on punchbar init
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

export { renderPunchBar, showFloatingBonus, renderPunchBadge, renderPunchGapBadge, badgeTextEl, fetchPunchGap };
