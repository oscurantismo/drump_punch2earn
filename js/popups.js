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

function faqItem(question, answer) {
    return `
        <div class="faq-item">
            <div class="faq-question">${question}</div>
            <div class="faq-answer">${answer}</div>
        </div>
    `;
}

function showInfoPage() {
    const existing = document.getElementById("info-container");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "info-container";
    Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        backgroundColor: "rgba(0,0,0,0.6)",
        fontFamily: FONT.body,
        zIndex: "4000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    });

    const info = document.createElement("div");
    Object.assign(info.style, {
        background: COLORS.offWhite,
        padding: "24px",
        borderRadius: BORDER.radius,
        width: "90%",
        maxWidth: "360px",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 0 16px rgba(0,0,0,0.3)",
        position: "relative",
        fontFamily: FONT.body,
        color: COLORS.primary
    });

    info.innerHTML = `
        <h2 style="color:${COLORS.primary}; font-size:22px; font-family:${FONT.heading};">🥊 Drump | Punch2Earn</h2>
        <p style="font-size:14px; line-height:1.5;">
            Punch Drump. Score punches. Simple as that. From like-minded cryptonerds tired of unpredictability.
        </p>

        <h3 style="margin-top:24px; color:${COLORS.primary}; font-family:${FONT.heading};">🎮 How to Play</h3>
        <p style="font-size:14px;">
            Punch to earn. The more you punch, the higher the reward. Climb the leaderboard. Invite friends for extra bonuses.
        </p>

        <h3 style="margin-top:24px; color:${COLORS.primary}; font-family:${FONT.heading};">🎁 Referral Bonus</h3>
        <ul style="font-size:14px; padding-left:20px; line-height:1.6;">
            <li>Get +1000 punches when your referred friend scores 20+ punches.</li>
            <li>Both sides receive 1000 punches.</li>
            <li>Referral must be a new player to be valid.</li>
            <li>Check your referral history in the Profile tab.</li>
        </ul>

        <h3 style="margin-top:28px; color:${COLORS.primary}; font-family:${FONT.heading};">🧠 FAQ</h3>
        <div class="faq">
            ${faqItem("How do I earn punches?", "Punch Drump on the game screen. Each tap counts as 1 punch.")}
            ${faqItem("What happens when I reach 100 punches?", "You get a +25 punch bonus! Bonuses apply at every 100-punch milestone.")}
            ${faqItem("Can I invite friends?", "Yes! You both get +1000 punches when your friend scores 20+ punches.")}
            ${faqItem("Why isn't my referral bonus showing?", "Make sure your friend is new and has scored 20+ punches. The bonus is not instant.")}
            ${faqItem("Is this real? Can I win something?", "We’re building up toward leaderboard drops and rewards. Stay tuned.")}
        </div>

        <div style="text-align:center; margin-top: 30px;">
            <button id="close-info"
                style="background:${COLORS.primary}; color:${COLORS.offWhite}; padding:10px 16px;
                       border:none; border-radius:${BORDER.radius}; font-size:16px; cursor:pointer;">
                Close
            </button>
        </div>
    `;

    const style = document.createElement("style");
    style.innerHTML = `
        .faq-item {
            margin-bottom: 14px;
            border: 1px solid #dde5ff;
            border-radius: 8px;
            overflow: hidden;
        }
        .faq-question {
            background: #f0f4ff;
            padding: 12px;
            cursor: pointer;
            font-size: 14px;
        }
        .faq-answer {
            padding: 10px 14px;
            display: none;
            color: #444;
            background: #fdfdfd;
            font-size: 13px;
            border-top: 1px solid #dde5ff;
        }
        .faq-answer.open {
            display: block;
            animation: fadeIn 0.25s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    overlay.appendChild(info);
    document.body.appendChild(overlay);

    // Close on background click
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };

    // Close button
    document.getElementById("close-info").onclick = () => overlay.remove();

    // FAQ toggle logic
    const questions = info.querySelectorAll(".faq-question");
    questions.forEach(q => {
        q.onclick = () => {
            const answer = q.nextElementSibling;
            answer.classList.toggle("open");
        };
    });
}

export { showInfoPage, showReferralPopup, faqItem };
