import { showGameUI } from "./game.js";

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
        container.style.marginBottom = "80px"; // Add space for nav tabs
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
    } else if (tab === "info") {
        const info = document.createElement("div");
        info.id = "info-container";
        info.style.position = "fixed";
        info.style.top = "100px";
        info.style.bottom = "0";
        info.style.left = "0";
        info.style.right = "0";
        info.style.width = "100vw";
        info.style.height = "calc(100vh - 100px)";
        info.style.padding = "20px";
        info.style.background = "#ffffff";
        info.style.fontFamily = "Arial, sans-serif";
        info.style.overflowY = "auto";
        info.style.boxSizing = "border-box";
        info.style.zIndex = "999";
        info.innerHTML = `
            <h2>👟 Drump | Punch2Earn</h2>
            <p>Punch Drump with a shoe. Simple as that. From like-minded cryptonerds tired of unpredictability.</p>
            <h3>How to Play</h3>
            <p>Punch to earn. Collect punches. Compete on the leaderboard. Invite friends for rewards.</p>
            <p>🎁 <b>Referral Bonus:</b> +100 punches when your referral scores 10+.</p>
            <p>🏗 <b>Upcoming:</b> Event drops, airdrops, collectibles. Stay tuned for more updates.</p>
            <p>🤖 Powered by frustration.py</p>
        `;
        document.body.appendChild(info);
    }
}

export { showTab };
