import { COLORS, FONT, BORDER } from "./styles.js";

function createReferralButtons(link) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
        display: "flex",
        gap: "12px",
        marginTop: "16px",
        justifyContent: "center"
    });

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "COPY";
    Object.assign(copyBtn.style, {
        flex: "1",
        minWidth: "120px",
        padding: "12px",
        fontSize: "16px",
        background: "#2a3493",
        color: "#fff",
        border: "2px solid #000",
        borderRadius: "10px",
        fontFamily: FONT.body,
        fontWeight: "normal",
        textTransform: "uppercase",
        boxShadow: "2px 2px 0 #000",
        cursor: "pointer",
        transition: "transform 0.15s ease"
    });

    const shareBtn = document.createElement("button");
    shareBtn.innerText = "SHARE";
    Object.assign(shareBtn.style, {
        flex: "1",
        minWidth: "120px",
        padding: "12px",
        fontSize: "16px",
        background: "#d11b1b",
        color: "#fff",
        border: "2px solid #000",
        borderRadius: "10px",
        fontFamily: FONT.body,
        fontWeight: "normal",
        textTransform: "uppercase",
        boxShadow: "2px 2px 0 #000",
        cursor: "pointer",
        transition: "transform 0.15s ease"
    });

    // Hover/Tap Animation
    [copyBtn, shareBtn].forEach(btn => {
        btn.onmouseover = () => { btn.style.transform = "scale(1.04)"; };
        btn.onmouseout = () => { btn.style.transform = "scale(1)"; };
        btn.ontouchstart = () => { btn.style.transform = "scale(1.04)"; };
        btn.ontouchend = () => { btn.style.transform = "scale(1)"; };
    });

    // Copy Logic
    copyBtn.onclick = (e) => {
        e.stopPropagation();
        if (!link) return;
        navigator.clipboard.writeText(link);
        copyBtn.innerText = "COPIED";
        setTimeout(() => {
            copyBtn.innerText = "COPY";
        }, 2000);
    };

    // Share Logic
    shareBtn.onclick = (e) => {
        e.stopPropagation();
        if (!link) return;
        const msg = `Punch to earn! Start here ➡️ ${link}`;
        Telegram.WebApp.showPopup({
            title: "Share referral link",
            message: "Choose where to share:",
            buttons: [
                { id: "telegram", type: "default", text: "Telegram" },
                { id: "x", type: "default", text: "X (Twitter)" },
                { id: "whatsapp", type: "default", text: "WhatsApp" }
            ]
        }, (btnId) => {
            const links = {
                telegram: `https://t.me/share/url?url=${encodeURIComponent(msg)}`,
                whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`,
                x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`
            };
            if (btnId && links[btnId]) window.open(links[btnId], "_blank");
        });
    };

    wrapper.appendChild(copyBtn);
    wrapper.appendChild(shareBtn);

    return wrapper;
}

// Optional full card wrapper
function createReferralCard(link) {
    const card = document.createElement("div");
    Object.assign(card.style, {
        background: COLORS.badgeBg,
        border: BORDER.style,
        borderRadius: BORDER.radius,
        padding: "20px",
        boxShadow: "2px 2px 0 #000",
        fontFamily: FONT.body,
        textAlign: "center",
        fontSize: "14px"
    });

    const title = document.createElement("div");
    title.innerText = "Invite Friends";
    Object.assign(title.style, {
        fontSize: "16px",
        marginBottom: "10px",
        fontFamily: FONT.heading,
        color: COLORS.primary,
        fontWeight: "normal"
    });

    const input = document.createElement("input");
    input.type = "text";
    input.readOnly = true;
    input.value = link;
    Object.assign(input.style, {
        width: "80%",
        padding: "10px",
        fontSize: "13px",
        border: "2px solid #000",
        borderRadius: "10px",
        marginBottom: "16px",
        background: "#fff",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textAlign: "center",
        boxSizing: "border-box",
        maxWidth: "260px"
    });

    const buttons = createReferralButtons(link);

    card.appendChild(title);
    card.appendChild(input);
    card.appendChild(buttons);

    return card;
}

export { createReferralButtons, createReferralCard };
