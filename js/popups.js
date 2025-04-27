import { createReferralButton } from "./buttons.js"; // for floating button, NOT for inside popup
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

function showReferralPopup() {
    const popup = document.createElement("div");
    popup.id = "referral-popup";
    Object.assign(popup.style, {
        position: "fixed",
        top: "0", left: "0", right: "0", bottom: "0",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: ZINDEX.modal,
        fontFamily: FONT.body
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
        background: COLORS.badgeBg,
        border: BORDER.style,
        borderRadius: "16px",
        padding: "0 0 24px 0",
        width: "90%",
        maxWidth: "340px",
        fontFamily: FONT.body,
        textAlign: "center",
        boxShadow: "2px 2px 0 #000",
        position: "relative",
        overflow: "hidden"
    });

    // === Black Heading Bar ===
    const heading = document.createElement("div");
    heading.innerText = "INVITE & EARN";
    Object.assign(heading.style, {
        background: "#000",
        color: "#fff",
        fontSize: "20px",
        fontFamily: FONT.heading,
        padding: "14px",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        fontWeight: "normal",
        letterSpacing: "1px"
    });

    // === Close (X) Button ===
    const closeBtn = document.createElement("div");
    closeBtn.innerText = "✕";
    Object.assign(closeBtn.style, {
        position: "absolute",
        top: "8px",
        right: "12px",
        fontSize: "20px",
        color: "#888",
        cursor: "pointer",
        userSelect: "none"
    });
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        popup.remove();
    };

    // === Bonus description
    const description = document.createElement("div");
    description.innerHTML = `
      <div style="font-size:16px;margin:16px 12px 4px;line-height:1.5;color:#000;">
        +1000 <img src="drump-images/punch.svg" alt="punch" style="height:16px;vertical-align:-2px;"> per successful referral
      </div>
      <div style="font-size:15px;margin-bottom:16px;line-height:1.2;color:#000;">
        (FRIEND MUST PUNCH 20X)
      </div>
    `;

    // === Referral Link Field
    const linkField = document.createElement("input");
    linkField.type = "text";
    linkField.readOnly = true;
    linkField.value = `https://t.me/Drump_punch_bot?start=referral_${window.userId}`;
    Object.assign(linkField.style, {
        width: "80%",
        padding: "10px",
        fontSize: "13px",
        border: "2px solid #000",
        borderRadius: "10px",
        background: "#fff",
        marginBottom: "18px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textAlign: "center",
        boxSizing: "border-box",
        maxWidth: "260px"
    });

    // === Copy and Share buttons manually created
    const btnGroup = document.createElement("div");
    Object.assign(btnGroup.style, {
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        marginTop: "16px"
    });

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "COPY";
    copyBtn.className = "copy-btn";
    Object.assign(copyBtn.style, {
        background: "#2a3493",
        color: "#fff",
        border: "2px solid #000",
        borderRadius: "10px",
        padding: "10px",
        minWidth: "110px",
        fontSize: "14px",
        fontFamily: FONT.body,
        boxShadow: "2px 2px 0 #000",
        cursor: "pointer",
        textTransform: "uppercase"
    });

    copyBtn.onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(linkField.value);
        copyBtn.innerText = "COPIED";
        setTimeout(() => {
            copyBtn.innerText = "COPY";
        }, 2000);
    };

    const shareBtn = document.createElement("button");
    shareBtn.innerText = "SHARE";
    shareBtn.className = "share-btn";
    Object.assign(shareBtn.style, {
        background: "#d60000",
        color: "#fff",
        border: "2px solid #000",
        borderRadius: "10px",
        padding: "10px",
        minWidth: "110px",
        fontSize: "14px",
        fontFamily: FONT.body,
        boxShadow: "2px 2px 0 #000",
        cursor: "pointer",
        textTransform: "uppercase"
    });

    shareBtn.onclick = (e) => {
        e.stopPropagation();
        const msg = `🥊 Join me on Drump | Punch2Earn!\n\nUse my referral: ${linkField.value}`;
        Telegram.WebApp.showPopup({
            title: "Share referral link",
            message: "Choose where to share:",
            buttons: [
                { id: "telegram", type: "default", text: "Telegram" },
                { id: "x", type: "default", text: "X (Twitter)" },
                { id: "whatsapp", type: "default", text: "WhatsApp" }
            ]
        }, (id) => {
            const encoded = encodeURIComponent(msg);
            const url = ({
                telegram: `https://t.me/share/url?url=${encoded}`,
                whatsapp: `https://api.whatsapp.com/send?text=${encoded}`,
                x: `https://twitter.com/intent/tweet?text=${encoded}`
            })[id];
            if (url) window.open(url, "_blank");
        });
    };

    btnGroup.appendChild(copyBtn);
    btnGroup.appendChild(shareBtn);

    // === Assemble everything
    card.appendChild(heading);
    card.appendChild(closeBtn);
    card.appendChild(description);
    card.appendChild(linkField);
    card.appendChild(btnGroup);

    popup.onclick = (e) => {
        if (e.target === popup) popup.remove();
    };

    popup.appendChild(card);
    document.body.appendChild(popup);
}

export { showReferralPopup };
