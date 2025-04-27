import { COLORS, FONT, BORDER } from "./styles.js";
import { createLeaderboardPopup } from "./popups.js";

function createReferralAndRewardsButtons(userId) {
    // Clean up previous buttons if they exist
    document.getElementById("referral-button")?.remove();
    document.getElementById("rewards-button")?.remove();

    // === REFERRAL BUTTON ===
    const referral = document.createElement("button");
    referral.id = "referral-button";
    referral.innerText = "INVITE & EARN";
    Object.assign(referral.style, {
        position: "fixed",
        bottom: "80px",
        left: "20px",
        padding: "10px 16px",
        background: "#fff9d6",
        color: "#2a3493",
        fontFamily: FONT.body,
        fontSize: "14px",
        textTransform: "uppercase",
        border: "2px solid #000",
        borderRadius: "10px",
        boxShadow: "2px 2px 0 #000",
        cursor: "pointer",
        zIndex: "1100"
    });

    referral.onclick = (e) => {
        e.stopPropagation();
        import("./profile.js").then(module => {
            module.renderProfilePage();
        });
    };

    document.body.appendChild(referral);

    // === LEADERBOARD REWARDS BUTTON ===
    const rewards = document.createElement("button");
    rewards.id = "rewards-button";
    rewards.innerText = "🏆 REWARDS";
    Object.assign(rewards.style, {
        position: "fixed",
        bottom: "80px",
        right: "20px",
        padding: "10px 16px",
        background: COLORS.primary,
        color: COLORS.offWhite,
        fontFamily: FONT.body,
        fontSize: "14px",
        textTransform: "uppercase",
        border: "2px solid #000",
        borderRadius: "10px",
        boxShadow: "2px 2px 0 #000",
        cursor: "pointer",
        zIndex: "1100"
    });

    rewards.onclick = (e) => {
        e.stopPropagation();
        const popup = document.getElementById("leaderboard-reward-popup");
        if (popup) {
            popup.style.display = "flex";
        } else {
            createLeaderboardPopup();
            setTimeout(() => {
                document.getElementById("leaderboard-reward-popup")?.style.display = "flex";
            }, 200);
        }
    };

    document.body.appendChild(rewards);
}

export { createReferralAndRewardsButtons };
