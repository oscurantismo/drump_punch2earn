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
    container.style.background = "#f0f4ff";
    container.style.zIndex = "2000";
    container.style.overflowY = "auto";
    container.style.fontFamily = "'Arial Black', sans-serif";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "flex-start";
    container.style.fontFamily = "'Arial Black', sans-serif";
    container.style.padding = "24px";
    container.style.paddingTop = "40px";
    container.style.boxSizing = "border-box";

    // Card wrapper
    const card = document.createElement("div");
    card.style.background = "#ffffff";
    card.style.color = "#000";
    card.style.padding = "24px";
    card.style.borderRadius = "18px";
    card.style.width = "90%";
    card.style.maxWidth = "420px";
    card.style.padding = "24px";
    card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    card.style.boxSizing = "border-box";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.alignItems = "center";

    // username
    const username = document.createElement("h2");
    username.innerText = `${window.storedUsername}'s Profile`;
    username.style.marginBottom = "16px";
    username.style.fontSize = "22px";
    username.style.color = "#002868";
    username.style.margin = "0 0 8px";
    card.appendChild(username);

    //Avatar

    const avatar = document.createElement("div");
    avatar.innerText = "👤";
    avatar.style.fontSize = "48px";
    avatar.style.marginBottom = "12px";
    card.appendChild(avatar);

    // Punch count    
    const punchesStat = document.createElement("div");
    punchesStat.innerHTML = `🥊 Punches: <span id="coin-count">0</span>`;
    punchesStat.style.fontSize = "18px";
    punchesStat.style.marginBottom = "20px";
    punchesStat.style.color = "#0047ab";
    card.appendChild(punchesStat);

    //divider
    const divider = document.createElement("hr");
    divider.style.border = "none";
    divider.style.borderTop = "2px solid #000000";
    divider.style.margin = "20px 0";
    card.appendChild(divider);

    // Referral reward description
    const referralTitle = document.createElement("h3");
    referralTitle.innerText = "Invite & Earn";
    referralTitle.style.fontSize = "18px";
    referralTitle.style.marginBottom = "8px";
    referralTitle.style.color = "#222";
    card.appendChild(referralTitle);

    const referralMsg = document.createElement("p");
    referralMsg.innerText = "Invite friends and earn +100 🥊 punches!";
    referralMsg.style.fontSize = "14px";
    referralMsg.style.color = "#666";
    referralMsg.style.marginBottom = "6px";
    card.appendChild(referralMsg);

    const referralCondition = document.createElement("p");
    referralCondition.innerText = "Your friend must punch at least 10 times for you to earn the reward.";
    referralCondition.style.fontSize = "12px";
    referralCondition.style.color = "#999";
    referralCondition.style.marginBottom = "14px";
    referralCondition.style.lineHeight = "1.3";
    card.appendChild(referralCondition);

    // Referral link field
    const referralInput = document.createElement("input");
    referralInput.type = "text";
    referralInput.readOnly = true;
    referralInput.value = `https://t.me/Drump_bot?start=referral_${userId}`;
    referralInput.style.width = "100%";
    referralInput.style.padding = "10px";
    referralInput.style.borderRadius = "8px";
    referralInput.style.border = "1px solid #ccc";
    referralInput.style.fontFamily = "Arial";
    referralInput.style.fontSize = "13px";
    referralInput.style.marginBottom = "10px";
    card.appendChild(referralInput);

    // Copy & Share buttons
    const btnGroup = document.createElement("div");
    btnGroup.style.display = "flex";
    btnGroup.style.gap = "10px";
    btnGroup.style.width = "100%";
    btnGroup.style.marginBottom = "16px";

    const buttonRow = document.createElement("div");
    buttonRow.style.display = "flex";
    buttonRow.style.justifyContent = "space-between";
    buttonRow.style.gap = "10px";
    buttonRow.style.marginBottom = "12px";

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "📋 Copy";
    copyBtn.style.flex = "1";
    styleGameButton(copyBtn, "#0077cc", "#005fa3");
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(referralInput.value);
        alert("Link copied!");
    };

    const shareBtn = document.createElement("button");
    shareBtn.innerText = "📤 Share";
    shareBtn.style.flex = "1";
    styleGameButton(shareBtn, "#b22234", "#9e1e2c");
    shareBtn.onclick = () => {
        const message = `Join me in Drump | Punch2Earn! Punch Trump and earn rewards 💥 Use my link: ${referralInput.value}`;
        Telegram.WebApp.showPopup({
            title: "Share your referral link",
            message: "Choose where to share your invite:",
            buttons: [
                { id: "telegram", type: "default", text: "Telegram" },
                { id: "x", type: "default", text: "X (Twitter)" },
                { id: "whatsapp", type: "default", text: "WhatsApp" },
            ]
        }, (btnId) => {
            const links = {
                telegram: `https://t.me/share/url?url=${encodeURIComponent(referralInput.value)}&text=${encodeURIComponent(message)}`,
                whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
                x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
            };
            if (btnId && links[btnId]) window.open(links[btnId], "_blank");
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
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "🚪 Exit Profile";
    closeButton.style.background = "#e74c3c";
    closeButton.style.color = "#fff";
    closeButton.style.padding = "12px 24px";
    closeButton.style.fontSize = "16px";
    closeButton.style.fontWeight = "bold";
    closeButton.style.borderRadius = "12px";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.marginTop = "28px";
    closeButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    closeButton.style.transition = "background 0.3s";
    closeButton.onmouseover = () => closeButton.style.background = "#c0392b";
    closeButton.onmouseout = () => closeButton.style.background = "#e74c3c";
    closeButton.onclick = closeProfile;
    card.appendChild(closeButton);


    container.appendChild(card);
    document.body.appendChild(container);

    fetchProfileData();
    fetchReferralHistory();
}

function styleGameButton(button, bg, hoverBg) {
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
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                console.warn("Referral history data is not an array:", data);
                renderReferralHistory([]);
            } else {
                renderReferralHistory(data);
            }
        })
        .catch(err => {
            console.error("Error fetching referral history:", err);
            renderReferralHistory([]); // Fallback to empty
        });
}

function closeProfile() {
    const profile = document.getElementById("profile-container");
    if (profile) profile.remove();
    window.activeTab = "game"; // re-enable punching
}

export { renderProfilePage };
