function renderProfilePage() {
    const existingProfile = document.getElementById("profile-container");
    if (existingProfile) existingProfile.remove();

    window.activeTab = "profile"; // Prevent punch logic while profile is open

    const container = document.createElement("div");
    container.id = "profile-container";
    container.style.position = "fixed";
    container.style.top = "100px";
    container.style.bottom = "0";
    container.style.left = "0";
    container.style.right = "0";
    container.style.width = "100vw";
    container.style.height = "calc(100vh - 100px)";
    container.style.background = "#ffffff";
    container.style.zIndex = "999";
    container.style.overflowY = "auto";
    container.style.fontFamily = "'Arial Black', sans-serif";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.padding = "20px";
    container.style.boxSizing = "border-box";

    const card = document.createElement("div");
    card.style.background = "#0047ab";
    card.style.color = "#fff";
    card.style.padding = "30px 20px";
    card.style.borderRadius = "20px";
    card.style.width = "100%";
    card.style.maxWidth = "400px";
    card.style.textAlign = "center";
    card.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
    card.style.border = "2px solid #002868";

    // Title
    const title = document.createElement("h2");
    title.innerText = `${window.storedUsername}'s Profile`;
    title.style.marginBottom = "20px";
    card.appendChild(title);

    // Punch count
    const punchDisplay = document.createElement("p");
    punchDisplay.innerHTML = `🥾 Punches: <span id="coin-count">0</span>`;
    punchDisplay.style.fontSize = "18px";
    punchDisplay.style.marginBottom = "20px";
    card.appendChild(punchDisplay);

    // Referral instructions
    const referralMessage = document.createElement("p");
    referralMessage.innerHTML = `👥 Invite friends and earn <b>+100 punches</b> when they hit 10 punches.`;
    referralMessage.style.fontSize = "14px";
    referralMessage.style.color = "#ffcc00";
    referralMessage.style.marginBottom = "16px";
    card.appendChild(referralMessage);

    // Referral link field
    const referralLink = document.createElement("input");
    referralLink.type = "text";
    referralLink.value = `https://t.me/Drump_bot?start=referral_${window.userId}`;
    referralLink.readOnly = true;
    referralLink.style.width = "100%";
    referralLink.style.padding = "10px";
    referralLink.style.borderRadius = "8px";
    referralLink.style.border = "1px solid #ccc";
    referralLink.style.fontFamily = "Arial, sans-serif";
    referralLink.style.marginBottom = "10px";
    card.appendChild(referralLink);

    // Copy and share buttons wrapper
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
        alert("Referral link copied to clipboard!");
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

    // Referral history header
    const historyTitle = document.createElement("h3");
    historyTitle.innerText = "📜 Referral History";
    historyTitle.style.marginTop = "20px";
    historyTitle.style.fontSize = "16px";
    card.appendChild(historyTitle);

    // History list container
    const historyContainer = document.createElement("ul");
    historyContainer.id = "referral-history";
    historyContainer.style.listStyle = "none";
    historyContainer.style.padding = "0";
    historyContainer.style.margin = "0";
    historyContainer.style.fontSize = "14px";
    historyContainer.style.textAlign = "left";
    card.appendChild(historyContainer);

    // Close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "❌ Close";
    styleActionButton(closeButton, "#ff6756", "#e05547");
    closeButton.style.marginTop = "24px";
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

function styleActionButton(button, bg, hover) {
    button.style.background = bg;
    button.style.color = "#fff";
    button.style.padding = "10px";
    button.style.borderRadius = "10px";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.transition = "background 0.3s";
    button.onmouseover = () => button.style.background = hover;
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
