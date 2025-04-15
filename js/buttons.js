import { showReferralPopup } from "./popups.js"; // adjust path if needed

let rewardsBtn, referralBtn;
let rewardsState = "hidden";
let pulseTimeout;

function createReferralAndRewardsButtons(userId) {
    if (document.getElementById("referral-button")) return;

    // === Refer a Friend Button ===
    referralBtn = document.createElement("button");
    referralBtn.id = "referral-button";
    referralBtn.innerHTML = `👥 Refer a Friend <span style="background:${COLORS.primary}; color:#fff; font-size:10px; font-weight:bold; border-radius:8px; padding:2px 6px; margin-left:6px;">+1000</span>`;
    referralBtn.style.cssText = sharedStyle + "bottom: 120px; background: #f8f9fe; color: #2a3493;";
    referralBtn.onclick = () => showReferralPopup(userId);
    document.body.appendChild(referralBtn);

    // === Leaderboard Rewards Button ===
    rewardsBtn = document.createElement("button");
    rewardsBtn.id = "leaderboard-rewards-button";
    rewardsBtn.innerText = "🏆";
    rewardsBtn.style.cssText = sharedStyle + `
        bottom: 70px;
        min-width: 42px;
        white-space: nowrap;
        overflow: hidden;
        transition: all 0.3s ease, min-width 0.3s ease;
        background: #f8f9fe;
        color: #2a3493;
    `;
    rewardsBtn.onclick = onRewardsBtnClick;
    document.body.appendChild(rewardsBtn);

    createLeaderboardPopup();
    startPulse();
}

const sharedStyle = `
    position: fixed;
    right: 20px;
    padding: 10px 14px;
    font-size: 14px;
    border: none;
    border-radius: 8px;
    font-family: 'Arial Black', sans-serif;
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
`;

function onRewardsBtnClick() {
    if (rewardsState === "hidden") {
        expandRewardsButton();
    } else if (rewardsState === "expanded") {
        openLeaderboardPopup();
    }
}

function expandRewardsButton() {
    rewardsState = "expanded";
    rewardsBtn.style.minWidth = "190px";
    setTimeout(() => {
        if (rewardsState === "expanded") {
            rewardsBtn.innerText = "🏆 Leaderboard Rewards";
        }
    }, 200);
}

function resetRewardsToHidden() {
    rewardsBtn.innerText = "🏆";
    rewardsBtn.style.minWidth = "42px";
    rewardsState = "hidden";
}

function openLeaderboardPopup() {
    const popup = document.getElementById("leaderboard-reward-popup");
    if (popup) {
        popup.style.display = "flex";
        rewardsState = "popup";

        const closeBtn = popup.querySelector(".leaderboard-popup-close");
        if (closeBtn) {
            closeBtn.onclick = () => {
                popup.style.display = "none";
                rewardsState = "expanded";
                rewardsBtn.innerText = "🏆 Leaderboard Rewards";
                rewardsBtn.style.minWidth = "190px";
                setTimeout(() => {
                    if (rewardsState === "expanded") resetRewardsToHidden();
                }, 5000);
            };
        }
    }
}

function startPulse() {
    if (pulseTimeout) clearTimeout(pulseTimeout);

    const pulse = () => {
        if (!rewardsBtn || rewardsState === "popup") return;
        rewardsBtn.animate([
            { transform: 'scale(1)', boxShadow: '0 0 0 rgba(0,0,0,0)' },
            { transform: 'scale(1.05)', boxShadow: '0 0 10px rgba(255,255,255,0.5)' },
            { transform: 'scale(1)', boxShadow: '0 0 0 rgba(0,0,0,0)' }
        ], {
            duration: 600,
            iterations: 1
        });
        pulseTimeout = setTimeout(pulse, 25000); // every 25 seconds
    };

    pulseTimeout = setTimeout(pulse, 10000); // initial delay
}

function createLeaderboardPopup() {
    if (document.getElementById("leaderboard-reward-popup")) return;

    const popup = document.createElement("div");
    popup.id = "leaderboard-reward-popup";
    popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0,0,0,0.6);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 4000;
    `;

    popup.innerHTML = `
      <div style="
          background: #fff;
          padding: 24px;
          border-radius: 14px;
          max-width: 340px;
          width: 90%;
          font-family: 'Segoe UI', sans-serif;
          text-align: left;
          box-shadow: 0 0 16px rgba(0,0,0,0.3);
          position: relative;
      ">
        <h3 style="text-align:center; color:#0047ab;">🏆 Leaderboard Rewards</h3>
        <ul style="font-size:14px; line-height:1.6; padding-left:18px; margin-top: 12px;">
            <li>:🥇First place: <b>+4000</b> punches one-time</li>
            <li>:🥈Second place: <b>+2000</b> punches one-time</li>
            <li>:🥉Third place: <b>+1000</b> punches one-time</li>
            <li>Entering top-10: <b>+550</b> punches one-time</li>
            <li>Entering top-25: <b>+250</b> punches one-time</li>
        </ul>
        <div style="text-align:center; margin-top: 16px;">
          <button class="leaderboard-popup-close"
            style="background:#0047ab; color:white; border:none; padding:10px 16px; border-radius:8px; font-weight:bold;">
            Close
          </button>
        </div>
        <div class="leaderboard-popup-close" style="position:absolute; top:8px; right:12px; cursor:pointer; color:#888;">❌</div>
      </div>
    `;

    document.body.appendChild(popup);
}

export {
    createReferralAndRewardsButtons
};
