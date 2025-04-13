import { showGameUI } from "./game.js";
import { createLeaderboardPopup } from "./ui.js";

function showTab(tab, scene = null) {
    // Remove all tab containers
    ["game-container", "leaderboard-container", "info-container", "profile-container"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });

    if (tab === "game" && scene) {
        showGameUI(scene);
    } else if (tab === "leaderboard") {
        const container = document.createElement("div");
        container.id = "leaderboard-container";
        container.style.position = "fixed";
        container.style.top = "100px";
        container.style.bottom = "0";
        container.style.marginBottom = "280px";// Add space for nav tabs
        container.style.paddingBottom = "180px";
        container.style.left = "0";
        container.style.right = "0";
        container.style.width = "100vw";
        container.style.height = "calc(100vh - 100px)";
        container.style.background = "#ffffff";
        container.style.zIndex = "999";
        container.style.overflowY = "auto";

        const iframe = document.createElement("iframe");
        iframe.src = `https://drumpleaderboard-production.up.railway.app/leaderboard-page?user_id=${window.userId}`;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";

        container.appendChild(iframe);
        document.body.appendChild(container);
        createLeaderboardPopup(); // ensures the popup exists
    } else if (tab === "info") {
        const info = document.createElement("div");
        info.id = "info-container";
        info.style.position = "fixed";
        info.style.top = "100px";
        info.style.bottom = "100px";
        info.style.left = "0";
        info.style.right = "0";
        info.style.width = "100vw";
        info.style.height = "calc(100vh - 100px)";
        info.style.padding = "20px";
        info.style.paddingBottom = "60px";
        info.style.background = "#ffffff";
        info.style.fontFamily = "Arial, sans-serif";
        info.style.overflowY = "auto";
        info.style.boxSizing = "border-box";
        info.style.zIndex = "999";
        info.innerHTML = `
            <h2>🥊 Drump | Punch2Earn</h2>
            <p>Punch Drump. Score punches. Simple as that. From like-minded cryptonerds tired of unpredictability.</p>
            <h3>How to Play</h3>
            <p>Punch to earn. The more you punch, the higher the reward. Climb the leaderboard. Invite friends for extra bonuses.</p>
            <h3>🎁 <b>Referral Bonus:</b></h3>
            <p> Get +1000 punches when your friend scores 20+ punches. Both sides get +1000 punches - it's a great way to start!</p>
            <p>🏗 <b>Upcoming:</b> Event drops, airdrops, collectibles. Stay tuned for more updates.</p>
            <h4>Referral Rules:</h3>
            <ul>A referral bonus is claimed after a referred user scores at least 20 punches in Drump.</ul>
            <ul>Both sides receive 1000 punches, added to their current punch score. </ul>
            <ul>The bonus is only issued if the referred user is new to Drump and has not been registered in the game yet.</ul>
            <ul>The bonus cannot be claimed by referring an existing user.</ul>
            <ul>Referral history can be viewed in the "Profile" tab, accessible by clicking on the username on the game screen.</ul>
            
        `;
        document.body.appendChild(info);
    }
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
        overflowY: "auto"
    });

    info.innerHTML = `
        <h2>🥊 Drump | Punch2Earn</h2>
        <p>Punch Drump. Score punches. Simple as that. From like-minded cryptonerds tired of unpredictability.</p>
        <h3>How to Play</h3>
        <p>Punch to earn. The more you punch, the higher the reward. Climb the leaderboard. Invite friends for extra bonuses.</p>

        <h3>🎁 Referral Bonus</h3>
        <ul>
            <li>Get +1000 punches when your referred friend scores 20+ punches.</li>
            <li>Both sides receive 1000 punches.</li>
            <li>Referral must be a new player to be valid.</li>
            <li>Check your referral history in the Profile tab.</li>
        </ul>

        <h3>🧠 FAQ</h3>
        <div class="faq">
            ${faqItem("How do I earn punches?", "Punch Drump on the game screen. Each tap counts as 1 punch.")}
            ${faqItem("What happens when I reach 100 punches?", "You get a +25 punch bonus! Bonuses apply at every 100-punch milestone.")}
            ${faqItem("Can I invite friends?", "Yes! You both get +1000 punches when your friend scores 20+ punches.")}
            ${faqItem("Why isn't my referral bonus showing?", "Make sure your friend is new and has scored 20+ punches. The bonus is not instant.")}
            ${faqItem("Is this real? Can I win something?", "We’re building up toward leaderboard drops and rewards. Stay tuned.")}
        </div>

        <div style="text-align:center; margin-top: 30px;">
            <button id="close-info" style="background:#0047ab; color:white; padding:10px 16px; font-weight:bold; border:none; border-radius:10px; font-size:16px;">Close</button>
        </div>
    `;

    const style = document.createElement("style");
    style.innerHTML = `
        .faq-item {
            margin-bottom: 12px;
        }
        .faq-question {
            background: #f0f4ff;
            padding: 10px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
        }
        .faq-answer {
            padding: 8px 10px;
            display: none;
            color: #333;
        }
        .faq-answer.open {
            display: block;
            animation: fadeIn 0.3s ease-in-out;
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


export { showTab, showInfoPage };
