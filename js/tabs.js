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

export { showTab };
