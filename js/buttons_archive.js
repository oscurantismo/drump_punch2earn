function renderShareButton() {
    const btn = document.createElement("button");
    btn.innerText = "🎁 Refer a Friend";
    btn.style.position = "fixed";
    btn.style.bottom = "100px"; // 👈 moves both buttons above bottom nav
    btn.style.right = "20px";
    btn.style.padding = "10px 14px";
    btn.style.fontSize = "14px";
    btn.style.background = "#0077cc";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.fontFamily = "'Arial Black', sans-serif";
    btn.style.zIndex = "1001";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";

    const badge = document.createElement("span");
    badge.innerText = "+1000";
    badge.style.background = "#fff";
    badge.style.color = "#0077cc";
    badge.style.fontSize = "10px";
    badge.style.fontWeight = "bold";
    badge.style.borderRadius = "8px";
    badge.style.padding = "2px 6px";
    badge.style.marginLeft = "6px";

    btn.appendChild(badge);

    btn.onclick = showReferralPopup;
    document.body.appendChild(btn);

    document.body.appendChild(btn); // this appends the refer button
    
    let rewardsState = "hidden";
    let hasPressed = false;
    let wiggleInterval;
    
    const rewardsBtn = document.createElement("button");
    rewardsBtn.id = "leaderboard-rewards-button";
    rewardsBtn.innerText = "🎁";
    rewardsBtn.style.position = "fixed";
    rewardsBtn.style.bottom = "60px";
    rewardsBtn.style.right = "20px";
    rewardsBtn.style.padding = "10px 12px";
    rewardsBtn.style.fontSize = "16px";
    rewardsBtn.style.background = "#0047ab";
    rewardsBtn.style.color = "#fff";
    rewardsBtn.style.border = "none";
    rewardsBtn.style.borderRadius = "8px";
    rewardsBtn.style.fontFamily = "'Arial Black', sans-serif";
    rewardsBtn.style.zIndex = "1001";
    rewardsBtn.style.cursor = "pointer";
    rewardsBtn.style.transition = "all 0.3s ease";

    rewardsBtn.onclick = () => {
        if (rewardsState === "hidden") {
            expandRewardsButton();
        } else if (rewardsState === "expanded") {
            openLeaderboardPopup();
        }
    };

    function expandRewardsButton() {
        rewardsBtn.innerText = "🎁 Leaderboard Rewards";
        rewardsState = "expanded";
        hasPressed = true;
        stopWiggle();
    }

    function resetToHidden() {
        rewardsBtn.innerText = "🎁";
        rewardsState = "hidden";
        startWiggle(); // start again after going hidden
    }

    function openLeaderboardPopup() {
        const popup = document.getElementById("leaderboard-reward-popup");
        if (popup) {
            popup.style.display = "flex";
            rewardsState = "popup";

            // When popup closes, go to expanded then auto-hide
            const closePopup = () => {
                popup.style.display = "none";
                rewardsState = "expanded";
                rewardsBtn.innerText = "🎁 Leaderboard Rewards";
                setTimeout(() => {
                    if (rewardsState === "expanded") resetToHidden();
                }, 5000); // 5s delay before hiding again
            };

            // Inject one-time close listener (handles both close button and outside)
            const closeBtn = popup.querySelector(".leaderboard-popup-close");
            if (closeBtn) {
                closeBtn.onclick = closePopup;
            }
        }
    }

    function startWiggle() {
        if (hasPressed) return;
        wiggleInterval = setInterval(() => {
            rewardsBtn.animate([
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(-10deg)' },
                { transform: 'rotate(10deg)' },
                { transform: 'rotate(0deg)' }
            ], {
                duration: 500,
                iterations: 1
            });
        }, 15000);
    }

    function stopWiggle() {
        clearInterval(wiggleInterval);
    }

    document.body.appendChild(rewardsBtn);
    startWiggle();
    createLeaderboardPopup(); // ensure popup exists
}
