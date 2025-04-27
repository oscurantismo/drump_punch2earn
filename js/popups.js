import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

window.isPopupOpen = () => {
    return (
        document.getElementById("leaderboard-reward-popup")?.style.display === "flex" ||
        !!document.getElementById("referral-popup") ||
        !!document.getElementById("info-container")
    );
};

function createLeaderboardPopup() {
    if (document.getElementById("leaderboard-reward-popup")) return;

    const popup = document.createElement("div");
    popup.id = "leaderboard-reward-popup";
    Object.assign(popup.style, {
        position: "fixed",
        top: "0", left: "0", right: "0", bottom: "0",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: ZINDEX.modal
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
        background: COLORS.badgeBg,
        border: BORDER.style,
        borderRadius: BORDER.radius,
        padding: "24px",
        width: "90%",
        maxWidth: "340px",
        fontFamily: FONT.body,
        textAlign: "center",
        boxShadow: "2px 2px 0 #000"
    });

    card.innerHTML = `
        <h2 style="font-size:18px; margin:0 0 12px; color:${COLORS.primary}; font-family:${FONT.heading}; font-weight:normal;">
            🏆 Leaderboard Rewards
        </h2>
        <p style="font-size:14px; margin-bottom:18px;">
            Climb the ranks and win extra punches!
        </p>
        <button id="close-leaderboard-popup" style="
            margin-top:10px;
            padding:10px 20px;
            font-family:${FONT.body};
            font-size:15px;
            background:${COLORS.primary};
            color:${COLORS.offWhite};
            border:none;
            border-radius:10px;
            box-shadow:1px 2px 0px #000;
            cursor:pointer;
        ">Close</button>
    `;

    popup.appendChild(card);
    popup.onclick = (e) => {
        if (e.target === popup) popup.style.display = "none";
    };
    card.querySelector("#close-leaderboard-popup").onclick = () => popup.style.display = "none";

    document.body.appendChild(popup);
}

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
        borderRadius: BORDER.radius,
        padding: "24px",
        width: "90%",
        maxWidth: "340px",
        fontFamily: FONT.body,
        textAlign: "center",
        boxShadow: "2px 2px 0 #000"
    });

    card.innerHTML = `
        <h2 style="font-size:18px; margin:0 0 10px; font-family:${FONT.heading}; font-weight:normal; color:${COLORS.primary};">
            Invite Friends
        </h2>
        <p style="font-size:14px; margin-bottom:16px; color:${COLORS.primary};">
            Share your referral link and earn bonus punches!
        </p>
        <input id="referral-link" readonly value="https://t.me/Drump_punch_bot?start=referral_${window.userId}" 
            style="
                width:100%;
                padding:10px;
                font-size:13px;
                border:2px solid #000;
                border-radius:10px;
                background:#fff;
                margin-bottom:16px;
            " />
        <div style="display:flex; gap:10px; justify-content:center;">
            <button id="copy-link" style="
                flex:1;
                padding:10px;
                font-size:14px;
                background:${COLORS.primary};
                color:${COLORS.offWhite};
                border:none;
                border-radius:8px;
                font-family:${FONT.body};
                box-shadow:1px 2px 0 #000;
                cursor:pointer;
            ">
                Copy Link
            </button>
            <button id="share-link" style="
                flex:1;
                padding:10px;
                font-size:14px;
                background:${COLORS.primary};
                color:${COLORS.offWhite};
                border:none;
                border-radius:8px;
                font-family:${FONT.body};
                box-shadow:1px 2px 0 #000;
                cursor:pointer;
            ">
                Share
            </button>
        </div>
    `;

    popup.onclick = (e) => {
        if (e.target === popup) popup.remove();
    };

    card.querySelector("#copy-link").onclick = (e) => {
        e.stopPropagation();
        const input = document.getElementById("referral-link");
        navigator.clipboard.writeText(input.value);
        card.querySelector("#copy-link").innerText = "Copied";
        setTimeout(() => {
            card.querySelector("#copy-link").innerText = "Copy Link";
        }, 2000);
    };

    card.querySelector("#share-link").onclick = (e) => {
        e.stopPropagation();
        const msg = `Punch to earn! Start here ➡️ https://t.me/Drump_punch_bot?start=referral_${window.userId}`;
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
    // (✅ Your info page stays good – no change needed based on current version)
}

export { showInfoPage, createLeaderboardPopup, showReferralPopup, faqItem };
