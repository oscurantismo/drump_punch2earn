import { COLORS, FONT, ZINDEX } from "./styles.js";
import { updatePunchDisplay } from "./ui.js";

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
        pointer-events: none; z-index: 2;
      }
      @keyframes floatStars {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-40px) scale(1.3); opacity: 0; }
      }
      .floating-star {
        position: absolute; bottom: 4px;
        width: 12px; height: 12px; border-radius: 50%;
        background: #fff9a0;
        animation: floatStars 2s ease-out infinite;
        pointer-events: none; z-index: 3;
      }
    `;
    document.head.appendChild(style);
  }

  const punchBar = document.createElement("div");
  punchBar.id = "punch-bar";
  Object.assign(punchBar.style, {
    position: "fixed",
    top: "52px",
    left: "1rem", right: "1rem",
    background: "#000", color: "#fff",
    textAlign: "center", fontFamily: FONT.body,
    fontSize: "18px", padding: "6px 0",
    borderRadius: "8px", zIndex: ZINDEX.punchBar,
    overflow: "hidden",
  });

  const punchText = document.createElement("div");
  punchText.id = "punch-text";
  punchText.innerHTML = `🥊 Punches: ${window.punches || 0}`;
  Object.assign(punchText.style, {
    position: "relative", zIndex: "4", pointerEvents: "none",
    padding: "4px 10px", fontWeight: "bold",
  });
  punchBar.appendChild(punchText);

  const progressFill = document.createElement("div");
  progressFill.id = "punch-fill";
  Object.assign(progressFill.style, {
    position: "absolute", inset: "0 auto 0 0",
    borderRadius: "8px 0 0 8px", width: "0%",
    background: COLORS.primary, transition: "width 0.4s ease", zIndex: 1,
  });
  progressFill.appendChild(Object.assign(document.createElement("div"), { className: "stripe-overlay" }));
  punchBar.appendChild(progressFill);

  for (let i = 0; i < 5; i++) {
    const star = document.createElement("div");
    star.className = "floating-star";
    star.style.left = `${10 + i * 20}%`;
    star.style.animationDelay = `${i * 0.4}s`;
    punchBar.appendChild(star);
  }

  document.body.appendChild(punchBar);

  const punchProgress = document.createElement("div");
  punchProgress.id = "punch-progress";
  Object.assign(punchProgress.style, {
    position: "fixed", top: "105px", left: "50%",
    transform: "translateX(-50%)",
    fontFamily: FONT.body, fontSize: "16px", color: "#222",
    zIndex: ZINDEX.punchBar,
  });
  document.body.appendChild(punchProgress);

  const bonusHint = document.createElement("div");
  bonusHint.id = "bonus-hint";
  Object.assign(bonusHint.style, {
    position: "fixed", top: "126px", left: "50%",
    transform: "translateX(-50%)",
    fontSize: "13px", color: "#222",
    fontFamily: FONT.body, zIndex: ZINDEX.punchBar,
    transition: "opacity 0.3s ease, transform 0.3s ease",
  });
  document.body.appendChild(bonusHint);

  updatePunchDisplay();
}

export { renderPunchBar };
