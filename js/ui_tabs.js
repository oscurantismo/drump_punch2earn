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
        `;

    document.body.appendChild(container);
}

export { showTab };
