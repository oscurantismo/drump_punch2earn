import { COLORS, FONT } from "./styles.js";
import { showReferralPopup } from "./popups.js";

function createReferralButton() {
    // ✅ Remove existing referral button if it exists
    document.getElementById("referral-button")?.remove();

    // ✅ Create the main button
    const btn = document.createElement("button");
    btn.id = "referral-button";
    btn.innerText = "REFER A FRIEND";
    Object.assign(btn.style, {
        position: "fixed",
        bottom: "80px", // ✅ Above bottom nav bar
        left: "20px",
        padding: "12px 20px",
        background: "#fff9d6",
        color: "#2a3493",
        fontFamily: FONT.body,
        fontSize: "14px",
        fontWeight: "normal",
        textTransform: "uppercase",
        border: "2px solid #000",
        borderRadius: "10px",
        boxShadow: "2px 2px 0 #000",
        cursor: "pointer",
        zIndex: "1100",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "transform 0.15s ease"
    });

    // ✅ Stop propagation to avoid accidental punch submission
    btn.onclick = (e) => {
        e.stopPropagation();
        showReferralPopup();
    };

    // ✅ Hover/tap slight animation
    btn.onmouseover = () => { btn.style.transform = "scale(1.04)"; };
    btn.onmouseout = () => { btn.style.transform = "scale(1)"; };
    btn.ontouchstart = () => { btn.style.transform = "scale(1.04)"; };
    btn.ontouchend = () => { btn.style.transform = "scale(1)"; };

    document.body.appendChild(btn);

    // ✅ Create +1000 badge
    const badge = document.createElement("div");
    badge.id = "referral-badge";
    badge.innerText = "+1000";
    Object.assign(badge.style, {
        position: "absolute",
        top: "-8px",
        right: "-8px",
        background: "#FFCC68",
        color: "#000",
        fontSize: "12px",
        padding: "2px 6px",
        borderRadius: "999px",
        border: "2px solid #000",
        boxShadow: "1px 2px 0 #000",
        fontFamily: FONT.body,
        zIndex: "1101",
    });

    btn.appendChild(badge);
}

export { createReferralButton };
