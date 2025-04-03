function renderProfilePage() {
    const existingProfile = document.getElementById("profile-container");
    if (existingProfile) existingProfile.remove();

    window.activeTab = "profile"; // Disable punching while profile is open

    const container = document.createElement("div");
    container.id = "profile-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.right = "0";
    container.style.bottom = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.background = "#0047ab";
    container.style.zIndex = "2000";
    container.style.overflowY = "auto";
    container.style.fontFamily = "'Arial Black', sans-serif";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.padding = "24px";
    container.style.boxSizing = "border-box";

    // Card wrapper
    const card = document.createElement("div");
    card.style.background = "#ffffff";
    card.style.color = "#002868";
    card.style.borderRadius = "18px";
    card.style.width = "100%";
    card.style.maxWidth = "420px";
    card.style.padding = "24px";
    card.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25)";
    card.style.boxSizing = "border-box";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.alignItems = "center";

    // Title
    const title = document.createElement("h2");
    title.innerText = `${window.storedUsername}'s Profile`;
    title.style.marginBottom = "16px";
    title.style.color = "#002868";
    card.appendChild(title);

    // Punch count
    const punchDisplay = document.createElement("p");
    punchDisplay.innerHTML = `🥾 Punches: <span id="coin-count">0</span>`;
    punchDisplay.style.fontSize = "20px";
    punchDisplay.style.fontWeight = "bold";
    punchDisplay.style.marginBottom = "20px";
    card.appendChild(punchDisplay);

    // Referral reward description
    const rewardText = document.createElement("p");
    rewardText.innerHTML = `👥 Invite friends and earn <b style="color: #ff4500;">+100 punches</b> when they reach <b>10 punches</b>.`;
    rewardText.style.fontSize = "14px";
    rewardText.style.textAlign = "center";
    rewardText.style.color = "#444";
    rewardText.style.marginBottom = "18px";
    card.appendChild(rewardText);

    // Referral link field
    const referralLink = document.createElement("input");
    referralLink.type = "text";
    referralLink.value = `https://t.me/Drump_bot?start=referral_${window.userId}`;
    referralLink.readOnly = true;
    referralLink.style.width = "100%";
    referralLink.style.padding = "12px";
    referralLink.style.marginBottom = "12px";
    referralLink.style.border = "2px solid #0047ab";
    referralLink.style.borderRadius = "8px";
    referralLink.style.fontSize = "14px";
    referralLink.style.fontFamily = "Arial, sans-serif";
    referralLink.style.color = "#002868";
    card.appendChild(referralLink);

    // Copy & Share buttons
    const btnGroup = document.createElement("div");
    btnGroup.style.display = "flex";
    btnGroup.style.gap = "10px";
    btnGroup.style.width = "100%";
    btnGroup.style.marginBottom = "16px";

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "📋 Copy";
    copyBtn.style.flex = "1";
    styleProfileButton(copyBtn, "#0077cc", "#005fa3");
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(referralLink.value);
        alert("Referral link copied to clipboard!");
    };

    const shareBtn = document.createElement("button");
    shareBtn.innerText = "📤 Share";
    shareBtn.style.flex = "1";
    styleProfileButton(shareBtn, "#b22234", "#a21b2f");
    shareBtn.onclick = () => {
        const message = `Join me on Drump | Punch2Earn! 🥾 Earn points and compete. Use my referral link: ${referralLink.value}`;
        Telegram.WebApp.showPopup({
            title: "Share your referral link",
            message: "Choose where to share your referral link:",
            buttons: [
                { id: "telegram", type: "default", text: "Telegram" },
                { id: "x", type: "default", text: "X (Twitter)" },
                { id: "whatsapp", type: "default", text: "WhatsApp" }
            ]
        }, (btnId) => {
            const links = {
                telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink.value)}&text=${encodeURIComponent(message)}`,
                whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
                x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
            };
            if (btnId && links[btnId]) {
                window.open(links[btnId], "_blank");
            }
        });
    };

    btnGroup.appendChild(copyBtn);
    btnGroup.appendChild(shareBtn);
    card.appendChild(btnGroup);

    // Referral history section
    const historyTitle = document.createElement("h3");
    historyTitle.innerText = "📜 Referral History";
    historyTitle.style.marginTop = "16px";
    historyTitle.style.fontSize = "16px";
    historyTitle.style.color = "#002868";
    card.appendChild(historyTitle);

    const historyList = document.createElement("ul");
    historyList.id = "referral-history";
    historyList.style.listStyle = "none";
    historyList.style.padding = "0";
    historyList.style.width = "100%";
    historyList.style.fontSize = "13px";
    historyList.style.color = "#222";
    card.appendChild(historyList);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "❌ Close";
    styleProfileButton(closeBtn, "#ff6756", "#e05547");
    closeBtn.style.marginTop = "20px";
    closeBtn.style.width = "100%";
    closeBtn.onclick = () => {
        container.remove();
        window.activeTab = "game";
    };
    card.appendChild(closeBtn);

    container.appendChild(card);
    document.body.appendChild(container);

    fetchProfileData();
    fetchReferralHistory();
}

function styleProfileButton(button, bg, hoverBg) {
    button.style.background = bg;
    button.style.color = "#fff";
    button.style.padding = "10px 0";
    button.style.borderRadius = "10px";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.fontSize = "14px";
    button.style.fontFamily = "'Arial Black', sans-serif";
    button.style.transition = "background 0.3s";
    button.onmouseover = () => button.style.background = hoverBg;
    button.onmouseout = () => button.style.background = bg;
}


function fetchProfileData() {
    fetch(`https://drumpleaderboard-production.up.railway.app/profile?user_id=${window.userId}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            const coinDisplay = document.getElementById("coin-count");
            if (coinDisplay) coinDisplay.textContent = data.coins ?? "0";
        })
        .catch(err => console.error("Error fetching profile data:", err));
}

function fetchReferralHistory() {
    fetch(`https://drumpleaderboard-production.up.railway.app/referral-history?user_id=${window.userId}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            const list = document.getElementById("referral-history");
            if (!list) return;

            if (data.history.length === 0) {
                const li = document.createElement("li");
                li.innerText = "No referrals yet.";
                list.appendChild(li);
                return;
            }

            data.history.forEach(entry => {
                const li = document.createElement("li");
                li.innerText = `+100 from ${entry.referred_user} on ${entry.date} (Score: ${entry.old_score} → ${entry.new_score})`;
                li.style.marginBottom = "6px";
                list.appendChild(li);
            });
        })
        .catch(err => {
            console.error("Error fetching referral history:", err);
        });
}

export { renderProfilePage };
