import { showGameUI } from "./game.js";
import { createLeaderboardPopup } from "./ui.js";

function showTab(tab, scene = null) {
    // Remove all tab containers
    ["game-container", "leaderboard-container", "tasks-container", "profile-container"].forEach(id => {
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
    } else if (tab === "tasks") {
        const container = document.createElement("div");
        container.id = "tasks-container";
        container.style.position = "fixed";
        container.style.top = "100px";
        container.style.bottom = "100px";
        container.style.left = "0";
        container.style.right = "0";
        container.style.width = "100vw";
        container.style.height = "calc(100vh - 100px)";
        container.style.padding = "20px";
        container.style.background = "#ffffff";
        container.style.fontFamily = "'Arial', sans-serif";
        container.style.overflowY = "auto";
        container.style.zIndex = "999";
        container.style.boxSizing = "border-box";

        container.innerHTML = `
            <h2 style="color:#0047ab; font-size:24px; font-family:'Arial Black', sans-serif;">🎯 Tasks & Leaderboard Rewards</h2>
            <p style="margin-top:6px; font-size:14px;">Welcome to your task tracker! New leaderboard tasks launch every <b>15 days</b>. This page will help you follow your progress and check what rewards are available.</p>
        
            <div style="margin-top:20px; background:#f0f4ff; border-left:5px solid #0047ab; padding:14px; border-radius:10px;">
                <h3 style="margin-top:0;">🎁 Current Rewards</h3>
                <ul style="line-height:1.6; font-size:14px; padding-left:20px;">
                    <li><b>Top-25:</b> +250 punches</li>
                    <li><b>Top-10:</b> +550 punches</li>
                    <li><b>Top-3:</b> +1000 🥉</li>
                    <li><b>Top-2:</b> +2000 🥈</li>
                    <li><b>Top-1:</b> +4000 🥇</li>
               </ul>
                <h4 style="margin:12px 0 4px 0;">🚨 Penalties</h4>
                <ul style="line-height:1.6; font-size:14px; padding-left:20px; color:#a33;">
                    <li>Leaving Top-25: -100</li>
                   <li>Leaving Top-10: -200</li>
                    <li>Leaving Top-3 / Top-2 / Top-1: -600</li>
                </ul>
            </div>

            <div style="margin-top:30px; background:#fff8e1; border-left:5px solid #ffcc00; padding:14px; border-radius:10px;">
                <h3 style="margin-top:0;">📆 What’s Coming</h3>
                <ul style="line-height:1.6; font-size:14px; padding-left:20px;">
                    <li>New tasks launch every 15 days — stay active!</li>
                    <li>Expect exciting new ways to earn punches 🥊</li>
                    <li>Special challenges, badges, and airdrops are on the roadmap 🚀</li>
                </ul>
            </div>

            <div style="margin-top:30px;">
                <h3 style="color:#0047ab;">📊 Your Progress</h3>
                <p style="font-size:14px;">Check your referral and punch progress in the <b>Profile</b> tab. Task-specific progress tracking will appear here in future updates!</p>
            </div>

            <div style="margin-top:20px; text-align:center;">
                <span style="font-size:12px; color:#999;">Last updated: April 2025</span>
            </div>
        `;

    document.body.appendChild(container);
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
