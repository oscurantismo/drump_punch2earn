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
  } catch (err) {
    console.error("Failed to fetch punch gap:", err);
    window.punchGap = 0;
  }

  renderPunchGapBadge(); // ✅ trigger UI refresh
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
  if (document.getElementById("profile-container")) return;
  if (document.getElementById("punch-badge")) return;

  // Outer wrapper
  const badge = document.createElement("div");
  badge.id = "punch-badge";
  Object.assign(badge.style, {
    position: "fixed",
    top: "90px", // centered between topbar and punch bar
    left: "0.75rem",
    display: "flex",
    alignItems: "center",
    height: "48px",
    background: "#2a3493", // deep blue
    color: "#fff",
    borderRadius: "24px",
    border: "2px solid #000",
    fontFamily: "'Negrita Pro', sans-serif",
    fontSize: "15px",
    boxShadow: "2px 2px 0 #000",
    zIndex: ZINDEX.punchBar + 1,
    padding: "6px 16px 6px 28px",
    marginLeft: "20px", // space for the icon overlap
  });

  // Icon circle on the left
  const iconWrap = document.createElement("div");
  Object.assign(iconWrap.style, {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#FFEDAC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "1px 1px 0 #000",
    position: "absolute",
    left: "0",
    top: "90px",
    zIndex: ZINDEX.punchBar + 2,
  });

  const img = document.createElement("img");
  img.src = "drump-images/punch.svg";
  Object.assign(img.style, {
    width: "22px",
    height: "22px",
  });
  iconWrap.appendChild(img);

  // Text block
  badgeTextEl = document.createElement("div");
  badgeTextEl.id = "punch-badge-text";
  Object.assign(badgeTextEl.style, {
    fontFamily: "'Negrita Pro', sans-serif",
    lineHeight: "1.1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  });

  const label = document.createElement("div");
  label.textContent = "Punches";
  Object.assign(label.style, {
    fontSize: "14px",
  });

  const count = document.createElement("div");
  count.textContent = (window.punches || 0).toLocaleString();
  Object.assign(count.style, {
    fontSize: "18px",
    fontWeight: "bold",
  });

  badgeTextEl.append(label, count);
  badge.append(badgeTextEl);
  document.body.append(iconWrap, badge);
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
    padding: "6px 12px 10px 12px",
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

  // === Tick Marks with Milestone Bonuses (excluding first and last) ===
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

  for (let i = 1; i <= 4; i++) { // 🔁 skip 0 and 500
    const bonus = getBonusAmount(i * 100);

    const tickWrap = document.createElement("div");
    Object.assign(tickWrap.style, {
      position: "relative",
      height: "100%",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "space-between",
      width: "1px",
    });

    const tick = document.createElement("div");
    Object.assign(tick.style, {
      height: "100%",
      width: "2px",
      background: "#fff",
    });

    const labelBottom = document.createElement("div");
    labelBottom.textContent = bonus ? `+${bonus}` : "";
    Object.assign(labelBottom.style, {
      position: "absolute",
      bottom: "-18px",
      left: "-14px",
      fontSize: "13px",
      fontFamily: "'Reem Kufi Fun', sans-serif",
      color: "#000",
    });

    tickWrap.append(tick, labelBottom);
    tickContainer.appendChild(tickWrap);
  }

  barWrap.appendChild(tickContainer);

  // === Punch count below the bar ===
  const punchText = document.createElement("div");
  punchText.id = "punch-progress";
  Object.assign(punchText.style, {
    fontSize: "13px",
    color: "#222",
    textAlign: "center",
    fontFamily: "'Reem Kufi Fun', sans-serif",
    marginTop: "4px",
  });

  center.append(title, barWrap);
  topRow.append(icon, center);

  punchBar.appendChild(topRow);
  punchBar.appendChild(punchText);

  const upgrade = document.createElement("img");
  upgrade.src = "drump-images/upgrade.svg";
  Object.assign(upgrade.style, {
    width: "24px",
    height: "24px",
    cursor: "pointer",
  });
  upgrade.title = "Upgrade (coming soon)";
  topRow.appendChild(upgrade);

  document.body.appendChild(punchBar);

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
    fetchPunchGap(window.userId); // ✅ always fetch on game tab open
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
