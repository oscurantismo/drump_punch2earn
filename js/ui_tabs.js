import { showGameUI } from "./game.js";
import { createLeaderboardPopup } from "./popups.js";

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
        container.style.marginBottom = "280px"; // Add space for nav tabs
        container.style.paddingBottom = "180px";
        container.style.left = "0";
        container.style.right = "0";
        container.style.width = "100vw";
        container.style.height = "calc(100vh - 100px)";
        container.style.background = COLORS.deepRed;
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
        Object.assign(container.style, {
            position: "fixed",
            top: "100px",
            bottom: "100px",
            left: "0",
            right: "0",
            width: "100vw",
            height: "calc(100vh - 100px)",
            padding: "24px",
            background: COLORS.deepRed,
            fontFamily: FONT.body,
            overflowY: "auto",
            zIndex: "999",
            boxSizing: "border-box"
        });

        container.innerHTML = `
            <h2 style="color:${COLORS.offWhite}; font-size:24px; font-family:${FONT.body}">🎯 Tasks & Rewards</h2>
            <p style="font-size:14px; color:${COLORS.badgeBg}; line-height:1.5; margin-top:6px;">
                Welcome to your task center! Here you can track your leaderboard progress, understand the reward structure, and discover upcoming challenges.
            </p>

            <div style="margin-top:24px; background:${COLORS.primary}; border-left:5px solid ${COLORS.badgeBg}; padding:16px; border-radius:10px;">
                <h3 style="margin-top:0; color:${COLORS.offWhite};">🎁 Leaderboard Rewards</h3>
                <ul style="font-size:14px; line-height:1.6; padding-left:20px;">
                    <li><b>Top-25:</b> +250 punches</li>
                    <li><b>Top-10:</b> +550 punches</li>
                    <li><b>Top-3:</b> +1000 🥉</li>
                    <li><b>Top-2:</b> +2000 🥈</li>
                    <li><b>Top-1:</b> +4000 🥇</li>
                </ul>
            </div>

            <div style="margin-top:30px; background:#fff8e1; border-left:5px solid #ffcc00; padding:16px; border-radius:10px;">
                <h3 style="margin-top:0;">📆 Upcoming Challenges</h3>
                <ul style="font-size:14px; line-height:1.6; padding-left:20px;">
                    <li>Leaderboard tasks refresh every <b>15 days</b>.</li>
                    <li>Expect special daily/weekly punch challenges in upcoming updates.</li>
                    <li>Collect badges 🏅 and earn access to limited airdrops 🚀</li>
                </ul>
            </div>

            <div style="margin-top:30px;">
                <h3 style="color:#0047ab;">📊 Your Progress</h3>
                <p style="font-size:14px; color:#333;">
                    Visit your <b>Profile</b> to check how many punches you've collected and how many referrals you've invited. Soon, this page will track your live task completions!
                </p>
            </div>

            <div style="margin-top:30px; text-align:center;">
                <span style="font-size:12px; color:#999;">Last updated: April 2025</span>
            </div>
        `;

        document.body.appendChild(container);
    }
}

export { showTab };
