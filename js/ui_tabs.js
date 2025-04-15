import { renderProfilePage } from "./profile.js";
import { showGameUI } from "./game.js";
import { createLeaderboardPopup } from "./popups.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

if (!document.getElementById("badge-anim-style")) {
    const style = document.createElement("style");
    style.id = "badge-anim-style";
    style.innerHTML = `
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes borderRunner {
        0% {
          border-image-source: linear-gradient(90deg, #FFCC68, #f8f9fe, #FFCC68);
        }
        50% {
          border-image-source: linear-gradient(180deg, #f8f9fe, #FFCC68, #f8f9fe);
        }
        100% {
          border-image-source: linear-gradient(270deg, #FFCC68, #f8f9fe, #FFCC68);
        }
      }
    `;

    document.head.appendChild(style);
}

function showTab(tab, scene = null) {
    ["game-container", "leaderboard-container", "tasks-container", "profile-container"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });

    if (tab === "game" && scene) {
        showGameUI(scene);
    } else if (tab === "leaderboard") {
        const container = document.createElement("div");
        container.id = "leaderboard-container";
        Object.assign(container.style, {
            position: "fixed",
            top: "100px",
            bottom: "0",
            marginBottom: "280px",
            paddingBottom: "180px",
            left: "0",
            right: "0",
            width: "100vw",
            height: "calc(100vh - 100px)",
            background: COLORS.deepRed,
            zIndex: "999",
            overflowY: "auto",
            animation: "fadeSlideIn 0.4s ease-out"
        });

        const iframe = document.createElement("iframe");
        iframe.src = `https://drumpleaderboard-production.up.railway.app/leaderboard-page?user_id=${window.userId}`;
        Object.assign(iframe.style, {
            width: "100%",
            height: "100%",
            border: "none"
        });

        container.appendChild(iframe);
        document.body.appendChild(container);
        createLeaderboardPopup();
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
            boxSizing: "border-box",
            color: COLORS.textLight,
            animation: "fadeSlideIn 0.4s ease-out"
        });

        container.innerHTML = `
            <h2 style="color:${COLORS.offWhite}; font-size:24px; font-family:${FONT.body}">🎯 Tasks & Rewards</h2>
            <p style="font-size:14px; color:${COLORS.badgeBg}; line-height:1.5; margin-top:6px;">
                Welcome to your task center! Here you can track your leaderboard progress, understand the reward structure, and discover upcoming challenges.
            </p>

            <div style="
                margin-top:24px;
                background:${COLORS.primary};
                border-width: 3px;
                border-style: solid;
                border-image-slice: 1;
                border-image-source: linear-gradient(90deg, #FFCC68, #f8f9fe, #FFCC68);
                border-radius: 10px;
                padding: 16px;
                animation: borderRunner 3s linear infinite;
            ">
                <h3 style="margin-top:0; color:${COLORS.textLight}; font-family:${FONT.body}">🎁 Leaderboard Rewards</h3>
                <ul style="font-size:14px; line-height:1.6; padding-left:20px;">
                    <li><b>Top-25:</b> +250 punches</li>
                    <li><b>Top-10:</b> +550 punches</li>
                    <li><b>Top-3:</b> +1000 🥉</li>
                    <li><b>Top-2:</b> +2000 🥈</li>
                    <li><b>Top-1:</b> +4000 🥇</li>
                </ul>
            </div>


            <div style="
                border-width: 3px;
                border-style: solid;
                border-image-slice: 1;
                border-image-source: linear-gradient(90deg, #FFCC68, #f8f9fe, #FFCC68);
                border-radius: 10px;
                padding: 16px;
                animation: borderRunner 3s linear infinite;
                background:${COLORS.offWhite};
                color:${COLORS.primary};
            ">
                <h3 style="margin-top:0; font-family:${FONT.body}">📆 Upcoming Challenges</h3>
                <ul style="font-size:14px; line-height:1.6; padding-left:20px;">
                    <li>Leaderboard tasks refresh every <b>15 days</b>.</li>
                    <li>Expect special daily/weekly punch challenges in upcoming updates.</li>
                    <li>Collect badges 🏅 and earn access to limited airdrops 🚀</li>
                </ul>
            </div>

            <div style="margin-top:30px; animation: fadeSlideIn 0.5s ease-out;">
                <h3 style="color:${COLORS.badgeBg}; font-family:${FONT.body}">📊 Your Progress</h3>
                <p style="font-size:14px; color:${COLORS.textLight}; font-family:${FONT.body}">
                    Visit your <b>Profile</b> to check how many punches you've collected and how many referrals you've invited. Soon, this page will track your live task completions!
                </p>
            </div>

            <div style="margin-top:30px; text-align:center; animation: fadeSlideIn 0.8s ease-out;">
                <span style="font-size:12px; color:#ccc;">Last updated: April 2025</span>
            </div>
        `;

        document.body.appendChild(container);
    }
}

export { showTab };
