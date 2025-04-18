import { COLORS, FONT, ZINDEX } from "./styles.js";
import { updatePunchDisplay } from "./ui.js";

let badgeTextEl;

function renderPunchBadge() {
  if (document.getElementById("punch-badge")) return;

  const badge = document.createElement("div");
  badge.id = "punch-badge";
  Object.assign(badge.style, {
    position: "fixed",
    top: "50px",
    left: "20px",
    width: "144px",
    height: "40px",
    background: "#2a3493",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "10px",
    border: "3px solid #000",
    fontFamily: "'Negrita Pro', sans-serif",
    fontSize: "15px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    boxShadow: "2px 2px 0 #000",
    zIndex: ZINDEX.punchBar + 1,
  });

  const icon = document.createElement("div");
  Object.assign(icon.style, {
    width: "32px",
    height: "32px",
    minWidth: "32px",
    borderRadius: "50%",
    background: "#ffedac",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "8px",
    boxShadow: "2px 2px 0 #000"
  });

  const img = document.createElement("img");
  img.src = "drump-images/punch.svg";
  Object.assign(img.style, {
    width: "20px",
    height: "20px",
  });
  icon.appendChild(img);

  badgeTextEl = document.createElement("div");
  badgeTextEl.innerHTML = `Punches<br><span style="font-size:17px; font-weight:900">${window.punches || 0}</span>`;

  badge.append(icon, badgeTextEl);
  document.body.appendChild(badge);
}


function renderPunchBar() {
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
        font-weight: bold;
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
    top: "118px",  // shifted lower to fit badge above
    left: "0.75rem",
    right: "0.75rem",
    background: "#FFF2C5",
    color: "#000",
    fontFamily: FONT.body,
    fontSize: "14px",
    padding: "6px 12px",
    borderRadius: "12px",
    border: "2px solid #000",
    zIndex: ZINDEX.punchBar,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    boxShadow: "2px 2px 0 #000",
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
    fontWeight: "bold",
    fontFamily: FONT.heading,
    fontSize: "15px",
    marginBottom: "2px",
  });

  const barWrap = document.createElement("div");
  Object.assign(barWrap.style, {
    position: "relative",
    width: "100%",
    height: "16px",
    borderRadius: "999px",
    background: "#eee",
    overflow: "hidden",
    border: "1px solid #999",
  });

  const fill = document.createElement("div");
  fill.id = "punch-fill";
  Object.assign(fill.style, {
    position: "absolute",
    top: "0",
    bottom: "0",
    left: "0",
    width: "0%",
    background: COLORS.primary,
    borderRadius: "999px",
    transition: "width 0.4s ease",
    zIndex: 1,
  });

  fill.appendChild(Object.assign(document.createElement("div"), { className: "stripe-overlay" }));
  barWrap.appendChild(fill);

  const punchText = document.createElement("div");
  punchText.id = "punch-progress";
  Object.assign(punchText.style, {
    fontSize: "13px",
    color: "#222",
    marginTop: "4px",
  });

  center.append(title, barWrap, punchText);

  const upgrade = document.createElement("img");
  upgrade.src = "drump-images/upgrade.svg";
  Object.assign(upgrade.style, {
    width: "24px",
    height: "24px",
    cursor: "pointer",
  });
  upgrade.title = "Upgrade (coming soon)";

  punchBar.append(icon, center, upgrade);
  document.body.appendChild(punchBar);

  const floatingContainer = document.createElement("div");
  floatingContainer.id = "punch-gain-container";
  Object.assign(floatingContainer.style, {
    position: "fixed",
    top: "118px",
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex: ZINDEX.punchBar + 1,
  });
  document.body.appendChild(floatingContainer);

  updatePunchDisplay();
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

export { renderPunchBar, showFloatingBonus, renderPunchBadge, badgeTextEl };
