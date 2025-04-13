// popups.js

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

    const info = document.createElement("div");
    info.id = "info-container";
    Object.assign(info.style, {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
        zIndex: "4000",
        padding: "24px",
        overflowY: "auto",
        boxSizing: "border-box"
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
    document.body.appendChild(info);

    // Close button
    document.getElementById("close-info").onclick = () => info.remove();

    // FAQ toggle logic
    const questions = info.querySelectorAll(".faq-question");
    questions.forEach(q => {
        q.onclick = () => {
            const answer = q.nextElementSibling;
            answer.classList.toggle("open");
        };
    });
}

export { showInfoPage };
