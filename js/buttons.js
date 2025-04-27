import { COLORS, FONT } from "./styles.js";
import { showReferralPopup } from "./popups.js";

function createReferralButton() {
    // Clean up previous button if it exists
    document.getElementById("referral-button")?.remove();

    const btn = document.createElement("button");
    btn.id = "referral-button";
    btn.innerText = "Refer a Friend";
    Object.assign(btn.style, {
        position: "fixed",
        bottom: "80px",
        right: "20px",
        padding: "12px 20px",
        background: "#293391", // ✅ Deep blue background
        color: "#fff",
        fontFamily: FONT.heading,
        fontSize: "14px",
        textTransform: "uppercase",
        borderRadius: "10px",
        boxShadow: "1px 2px 0 0 #000",
        cursor: "pointer",
        zIndex: "1100",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "transform 0.15s ease"
    });

    btn.onclick = (e) => {
        e.stopPropagation();
        showReferralPopup();
    };

    btn.onmouseover = () => { btn.style.transform = "scale(1.04)"; };
    btn.onmouseout = () => { btn.style.transform = "scale(1)"; };
    btn.ontouchstart = () => { btn.style.transform = "scale(1.04)"; };
    btn.ontouchend = () => { btn.style.transform = "scale(1)"; };

    document.body.appendChild(btn);

    // === Badge
    const badge = document.createElement("div");
    badge.id = "referral-badge";
    badge.innerText = "+1000";
    Object.assign(badge.style, {
        position: "absolute",
        top: "-10px", // ✅ Moved higher
        right: "-8px",
        background: "#F6020F",
        color: "#fff",
        fontSize: "12px",
        padding: "2px 6px",
        borderRadius: "999px",
        boxShadow: "1px 2px 0 0 #000",
        fontFamily: FONT.body,
        fontWeight: "bold",
        zIndex: "1101",
        animation: "glossyPulse 2.5s linear infinite", // ✅ Apply glossyPulse animation
        backgroundSize: "200% 200%", // ✅ Needed for animation
        backgroundPosition: "0% 50%" // ✅ Start position
    });

    btn.appendChild(badge);
}

export { createReferralButton };
