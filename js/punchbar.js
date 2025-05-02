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
    fontSize: "22px",
    fontWeight: "600",
    color: "#2a3493",
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
        border-radius: 999px;
        z-index: 1;
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
    padding: "6px 12px",
    zIndex: 1000,
    fontFamily: "'Reem Kufi Fun', sans-serif",
    boxShadow: "2px 2px 0 #000",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    justifyContent: "space-between"
  });

  const icon = document.createElement("img");
  icon.src = "drump-images/flamepunch.svg";
  Object.assign(icon.style, {
    width: "44px",
    height: "44px"
  });

  const upgradeWrap = document.createElement("div");
  Object.assign(upgradeWrap.style, {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  });

  const upgrade = document.createElement("img");
  upgrade.src = "drump-images/upgrade.svg";
  Object.assign(upgrade.style, {
    width: "32px",
    height: "32px",
    cursor: "pointer"
  });

  const upgradeText = document.createElement("div");
  upgradeText.textContent = "UPGRADE";
  Object.assign(upgradeText.style, {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#000",
    marginTop: "4px"
  });

  upgradeWrap.append(upgrade, upgradeText);

  const barColumn = document.createElement("div");
  Object.assign(barColumn.style, {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "center"
  });

  const title = document.createElement("div");
  title.textContent = "My Progress";
  Object.assign(title.style, {
    fontFamily: "'Negrita Pro', sans-serif",
    fontSize: "15px",
    marginBottom: "4px"
  });

  const barWrap = document.createElement("div");
  Object.assign(barWrap.style, {
    position: "relative",
    width: "100%",
    height: "16px",
    borderRadius: "999px",
    background: "#FFE99B",
    overflow: "hidden",
    border: "2px solid #000"
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
    zIndex: 0
  });

  const stripes = document.createElement("div");
  stripes.className = "stripe-overlay";
  fill.appendChild(stripes);
  barWrap.appendChild(fill);

  const milestoneData = [
    { label: "+25", pos: 0.2 },
    { label: "+30", pos: 0.4 },
    { label: "+35", pos: 0.6 },
    { label: "+40", pos: 0.8 },
    { label: "+50", pos: 1.0 } // 🔁 previously 0.95 — now correctly ends at full bar
  ];


  // Add dividers aligned with milestones
  milestoneData.forEach((item) => {
    const divider = document.createElement("div");
    Object.assign(divider.style, {
      position: "absolute",
      top: "0",
      bottom: "0",
      left: `${item.pos * 100}%`,
      width: "2px",
      background: "#fff",
      transform: "translateX(-1px)",
      zIndex: 2
    });
    barWrap.appendChild(divider);
  });

  // === New container for absolute-positioned labels ===
  const labelLayer = document.createElement("div");
  Object.assign(labelLayer.style, {
    position: "relative",
    height: "12px",
    marginTop: "3px",
    width: "100%"
  });

  milestoneData.forEach((item) => {
    const label = document.createElement("div");
    label.textContent = item.label;
  Object.assign(label.style, {
    position: "absolute",
    bottom: "0",
    left: `${item.pos * 100}%`,
    transform: "translateX(-50%)",
    fontSize: "10px",
    fontFamily: "'Reem Kufi Fun', sans-serif",
    color: "#000",
    whiteSpace: "nowrap",
    pointerEvents: "none"
  });

    labelLayer.appendChild(label);
  });

  barColumn.append(title, barWrap);
  barColumn.append(labelLayer);

  const separator = document.createElement("div");
  Object.assign(separator.style, {
    width: "1px",
    height: "36px",
    background: "#000",
    margin: "0 6px"
  });


  punchBar.append(icon, barColumn, separator, upgradeWrap);
  document.body.appendChild(punchBar);

  const floatingContainer = document.createElement("div");
  floatingContainer.id = "punch-gain-container";
  Object.assign(floatingContainer.style, {
    position: "fixed",
    top: "118px",
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex: 1001
  });
  document.body.appendChild(floatingContainer);

  updatePunchDisplay();

  if (window.userId) {
    fetchPunchGap(window.userId);
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
