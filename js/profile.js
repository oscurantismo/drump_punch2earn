function renderProfilePage() {
    const existingProfile = document.getElementById("profile-container");
    if (existingProfile) existingProfile.remove();

    window.activeTab = "profile";

    const container = document.createElement("div");
    container.id = "profile-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.background = "#002868";
    container.style.zIndex = "2000";
    container.style.overflowY = "auto";
    container.style.fontFamily = "'Arial Black', sans-serif";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.padding = "20px";
    container.style.boxSizing = "border-box";

    const card = document.createElement("div");
    card.style.background = "#ffffff";
    card.style.borderRadius = "20px";
    card.style.padding = "24px 20px";
    card.style.width = "100%";
    card.style.maxWidth = "420px";
    card.style.textAlign = "center";
    card.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
    card.style.boxSizing = "border-box";

    const avatar = document.createElement("div");
    avatar.innerText = "🧑‍💻";
    avatar.style.fontSize = "56px";
    avatar.style.marginBottom = "12px";
    card.appendChild(avatar);

    const title = document.createElement("h2");
    title.innerText = `${window.storedUsername}'s Profile`;
    title.style.color = "#0047ab";
    title.style.marginBottom = "8px";
    card.appendChild(title);

    const punchDisplay = document.createElement("p");
    punchDisplay.innerHTML = `🥾 Punches: <span id="coin-count">0</span>`;
    punchDisplay.style.fontSize = "20px";
    punchDisplay.style.marginBottom = "20px";
    card.appendChild(punchDisplay);

    const referralMessage = document.createElement("p");
    referralMessage.innerHTML = `👥 Invite friends and earn <b>+100 punches</b><br>once they reach 10 punches.`;
    referralMessage.style.fontSize = "14px";
    referralMessage.style.color = "#222";
    referralMessage.style.marginBottom = "16px";
    referralMessage.style.lineHeight = "1.4";
    card.appendChild(referralMessage);

    const referralLink = document.createElement("input");
    referralLink.type = "text";
    referralLink.value = `https://t.me/Drump_bot?start=referral_${window.userId}`;
    referralLink.readOnly = true;
    referralLink.style.width = "100%";
    referralLink.style.padding = "10px";
    referralLink.style.borderRadius = "10px";
    referralLink.style.border = "1px solid #aaa";
    referralLink.style.marginBottom = "10px";
    referralLink.style.fontFamily = "Arial, sans-serif";
    card.appendChild(referralLink);

    const buttonGroup = document.createElement("div");
    buttonGroup.style.display = "flex";
    buttonGroup.style.justifyContent = "space-between";
    buttonGroup.style.marginBottom = "16px";

    const copyButton = document.createElement("button");
    copyButton.innerText = "📋 Copy";
    copyButton.style.flex = "1";
    copyButton.style.marginRight = "10px";
    styleActionButton(copyButton, "#0077cc", "#005fa3");
    copyButton.onclick = () => {
        navigator.clipboard.writeText(referralLink.value);
        alert("Referral link copied!");
    };

    const shareButton = document.createElement("button");
    shareButton.innerText = "📤 Share";
    shareButton.style.flex = "1";
    styleActionButton(shareButton, "#b22234", "#a21b2f");
    shareButton.onclick = () => {
        const message = `Join me on Drump | Punch2Earn! 🥾 Earn points and compete. Use my referral link: ${referralLink.value}`;
        Telegram.WebApp.showPopup({
            title: "Share your referral link",
            message: "Choose where to share your referral link:",
            buttons: [
                { id: "telegram", type: "default", text: "Telegram" },
                { id: "x", type: "default", text: "X (Twitter)" },
                { id: "whatsapp", type: "default", text: "WhatsApp" },
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

    buttonGroup.appendChild(copyButton);
    buttonGroup.appendChild(shareButton);
    card.appendChild(buttonGroup);

    const historyTitle = document.createElement("h3");
    historyTitle.innerText = "📜 Referral History";
    historyTitle.style.marginTop = "20px";
    historyTitle.style.fontSize = "16px";
    historyTitle.style.color = "#0047ab";
    card.appendChild(historyTitle);

    const historyContainer = document.createElement("ul");
    historyContainer.id = "referral-history";
    historyContainer.style.listStyle = "none";
    historyContainer.style.padding = "0";
    historyContainer.style.margin = "0";
    historyContainer.style.fontSize = "14px";
    historyContainer.style.textAlign = "left";
    historyContainer.style.marginTop = "10px";
    card.appendChild(historyContainer);

    const closeButton = document.createElement("button");
    closeButton.innerText = "❌ Close";
    closeButton.style.marginTop = "24px";
    styleActionButton(closeButton, "#ff6756", "#e05547");
    closeButton.onclick = () => {
        container.remove();
        window.activeTab = "game";
    };
    card.appendChild(closeButton);

    container.appendChild(card);
    document.body.appendChild(container);

    fetchProfileData();
    fetchReferralHistory();
}

function styleActionButton(button, color, hoverColor) {
    button.style.background = color;
    button.style.color = "#fff";
    button.style.padding = "10px 20px";
    button.style.borderRadius = "12px";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.fontWeight = "bold";
    button.style.transition = "background 0.3s";
    button.onmouseover = () => button.style.background = hoverColor;
    button.onmouseout = () => button.style.background = color;
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
