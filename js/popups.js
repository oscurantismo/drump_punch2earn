// ✅ popups.js — updated with unified styles + popup state detection

// Global popup blocker
window.isPopupOpen = () => {
    return (
        document.getElementById("leaderboard-reward-popup")?.style.display === "flex" ||
        document.getElementById("referral-popup") ||
        document.getElementById("info-container")
    );
};

function createLeaderboardPopup() {
    if (document.getElementById("leaderboard-reward-popup")) return;

    const popup = document.createElement("div");
    popup.id = "leaderboard-reward-popup";
    Object.assign(popup.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "4000"
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
        background: "#fff",
        padding: "24px",
        borderRadius: "14px",
        maxWidth: "340px",
        width: "90%",
        fontFamily: "'Segoe UI', sans-serif",
        textAlign: "left",
        boxShadow: "0 0 16px rgba(0,0,0,0.3)",
        position: "relative"
    });

    card.innerHTML = `
        <h3 style="text-align:center; color:#0047ab;">🏆 Leaderboard Rewards</h3>
        <ul style="font-size:14px; line-height:1.6; padding-left:18px; margin-top: 12px;">
            <li><b>Top-25</b>: +250 punches (once)</li>
            <li><b>Top-10</b>: +550 punches (once)</li>
            <li><b>Top-3</b>: +1000 | <b>Top-2</b>: +2000 | <b>Top-1</b>: +4000</li>
            <li><b>Drops:</b></li>
            <li>Left Top-10: -200</li>
            <li>Left Top-3/2/1: -600</li>
            <li>Left Top-25: -100</li>
        </ul>
        <button class="leaderboard-popup-close"
            style="margin-top: 18px; display:block; margin-left:auto; margin-right:auto;
                   background:#0047ab; color:white; padding:10px 16px; font-weight:bold;
                   border:none; border-radius:10px; font-size:15px; cursor:pointer;">
            Close
        </button>
    `;

    popup.onclick = (e) => {
        if (e.target === popup) popup.style.display = "none";
    };

    card.querySelector(".leaderboard-popup-close").onclick = () => {
        popup.style.display = "none";
    };

    popup.appendChild(card);
    document.body.appendChild(popup);
}

function showReferralPopup() {
    const popup = document.createElement("div");
    popup.id = "referral-popup";
    Object.assign(popup.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "4000"
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
        background: "#fff",
        padding: "24px",
        borderRadius: "14px",
        maxWidth: "320px",
        width: "90%",
        position: "relative",
        fontFamily: "'Arial Black', sans-serif",
        textAlign: "center"
    });

    card.innerHTML = `
        <h3>🎁 Refer a Friend</h3>
        <p style="font-size: 14px; color: #333;">
            Invite a friend and you both get <b>+1000 punches</b>!
        </p>
        <p style="font-size: 13px; color: #555;">Your unique referral link:</p>
        <input id="referral-link" value="https://t.me/Drump_punch_bot?start=referral_${window.userId}" readonly
               style="width: 100%; font-size: 13px; padding: 8px; margin-bottom: 10px;
                      border: 1px solid #ccc; border-radius: 6px;" />
    `;

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "📋 Copy Link";
    Object.assign(copyBtn.style, {
        marginTop: "4px",
        marginRight: "6px",
        padding: "8px 12px",
        border: "none",
        borderRadius: "8px",
        background: "#0047ab",
        color: "#fff",
        cursor: "pointer"
    });
    copyBtn.onclick = () => {
        const linkInput = document.getElementById("referral-link");
        linkInput.select();
        document.execCommand("copy");
        copyBtn.innerText = "✅ Copied!";
        setTimeout(() => copyBtn.innerText = "📋 Copy Link", 2000);
    };

    const shareBtn = document.createElement("button");
    shareBtn.innerText = "📣 Share";
    Object.assign(shareBtn.style, {
        marginTop: "4px",
        padding: "8px 12px",
        border: "none",
        borderRadius: "8px",
        background: "#0077cc",
        color: "#fff",
        cursor: "pointer"
    });
    shareBtn.onclick = () => {
        const msg = `Punch to earn! Start here ➡️ https://t.me/Drump_punch_bot?start=referral_${window.userId}`;
        Telegram.WebApp.showPopup({
            title: "Share referral link",
            message: "Choose where to share your invite:",
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

    const btnGroup = document.createElement("div");
    btnGroup.style.display = "flex";
    btnGroup.style.justifyContent = "center";
    btnGroup.appendChild(copyBtn);
    btnGroup.appendChild(shareBtn);
    card.appendChild(btnGroup);

    const close = document.createElement("div");
    close.innerText = "❌";
    Object.assign(close.style, {
        position: "absolute",
        top: "10px",
        right: "14px",
        fontSize: "18px",
        cursor: "pointer",
        color: "#999"
    });
    close.onclick = () => popup.remove();
    card.appendChild(close);

    popup.onclick = (e) => {
        if (e.target === popup) popup.remove();
    };

    popup.appendChild(card);
    document.body.appendChild(popup);
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
        fontFamily: "Arial, sans-serif",
        zIndex: "4000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    });

    const info = document.createElement("div");
    Object.assign(info.style, {
        background: "#ffffff",
        padding: "24px",
        borderRadius: "14px",
        width: "90%",
        maxWidth: "360px",
        maxHeight: "90vh",
        overflowY: "auto",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 0 16px rgba(0,0,0,0.3)",
        position: "relative"
    });

    info.innerHTML = `
        <h2 style="color:#0047ab; font-size:22px; font-family:'Arial Black', sans-serif;">🥊 Drump | Punch2Earn</h2>
        <p style="font-size:14px; line-height:1.5;">
            Punch Drump. Score punches. Simple as that. From like-minded cryptonerds tired of unpredictability.
        </p>

        <h3 style="margin-top:24px; color:#002868;">🎮 How to Play</h3>
        <p style="font-size:14px;">
            Punch to earn. The more you punch, the higher the reward. Climb the leaderboard. Invite friends for extra bonuses.
        </p>

        <h3 style="margin-top:24px; color:#002868;">🎁 Referral Bonus</h3>
        <ul style="font-size:14px; padding-left:20px; line-height:1.6;">
            <li>Get +1000 punches when your referred friend scores 20+ punches.</li>
            <li>Both sides receive 1000 punches.</li>
            <li>Referral must be a new player to be valid.</li>
            <li>Check your referral history in the Profile tab.</li>
        </ul>

        <h3 style="margin-top:28px; color:#002868;">🧠 FAQ</h3>
        <div class="faq">
            ${faqItem("How do I earn punches?", "Punch Drump on the game screen. Each tap counts as 1 punch.")}
            ${faqItem("What happens when I reach 100 punches?", "You get a +25 punch bonus! Bonuses apply at every 100-punch milestone.")}
            ${faqItem("Can I invite friends?", "Yes! You both get +1000 punches when your friend scores 20+ punches.")}
            ${faqItem("Why isn't my referral bonus showing?", "Make sure your friend is new and has scored 20+ punches. The bonus is not instant.")}
            ${faqItem("Is this real? Can I win something?", "We’re building up toward leaderboard drops and rewards. Stay tuned.")}
        </div>

        <div style="text-align:center; margin-top: 30px;">
            <button id="close-info"
                style="background:#0047ab; color:white; padding:10px 16px; font-weight:bold;
                       border:none; border-radius:10px; font-size:16px; cursor:pointer;">
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
            font-weight: bold;
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

export { showInfoPage, createLeaderboardPopup, showReferralPopup };
