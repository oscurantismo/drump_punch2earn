function renderProfilePage() {
    const existingProfile = document.getElementById("profile-container");
    if (existingProfile) existingProfile.remove();

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
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.fontFamily = "'Arial Black', sans-serif";
    container.style.boxSizing = "border-box";

    const card = document.createElement("div");
    card.style.background = "#0047ab";
    card.style.color = "#fff";
    card.style.padding = "30px";
    card.style.borderRadius = "20px";
    card.style.width = "90%";
    card.style.maxWidth = "400px";
    card.style.textAlign = "center";
    card.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
    card.style.border = "2px solid #002868";

    const title = document.createElement("h2");
    title.innerText = `${window.storedUsername}'s Profile`;
    title.style.color = "#ffffff";
    title.style.marginBottom = "20px";
    card.appendChild(title);

    const punchDisplay = document.createElement("p");
    punchDisplay.innerHTML = `🥾 Punches: <span id="coin-count">0</span>`;
    punchDisplay.style.fontSize = "18px";
    punchDisplay.style.marginBottom = "20px";
    card.appendChild(punchDisplay);

    const referralMessage = document.createElement("p");
    referralMessage.innerHTML = `👥 Invite friends and earn <b>+100 punches</b> when they reach 10 punches.`;
    referralMessage.style.fontSize = "14px";
    referralMessage.style.color = "#ffcc00";
    referralMessage.style.marginBottom = "14px";
    card.appendChild(referralMessage);

    const referralLink = document.createElement("input");
    referralLink.type = "text";
    referralLink.value = `https://t.me/Drump_bot?start=referral_${window.userId}`;
    referralLink.readOnly = true;
    referralLink.style.width = "80%";
    referralLink.style.padding = "10px";
    referralLink.style.borderRadius = "8px";
    referralLink.style.border = "1px solid #ccc";
    referralLink.style.marginBottom = "10px";
    referralLink.style.fontFamily = "Arial, sans-serif";
    card.appendChild(referralLink);

    const copyButton = document.createElement("button");
    copyButton.innerText = "📋 Copy Link";
    copyButton.style.background = "#0077cc";
    copyButton.style.color = "#fff";
    copyButton.style.padding = "10px 20px";
    copyButton.style.borderRadius = "12px";
    copyButton.style.border = "none";
    copyButton.style.cursor = "pointer";
    copyButton.style.marginLeft = "10px";
    copyButton.style.transition = "background 0.3s";
    copyButton.onmouseover = () => copyButton.style.background = "#005fa3";
    copyButton.onmouseout = () => copyButton.style.background = "#0077cc";
    copyButton.onclick = () => {
        navigator.clipboard.writeText(referralLink.value);
        alert("Referral link copied to clipboard!");
    };
    card.appendChild(copyButton);

    const shareButton = document.createElement("button");
    shareButton.innerText = "📤 Share Link";
    shareButton.style.background = "#b22234";
    shareButton.style.color = "#fff";
    shareButton.style.padding = "10px 20px";
    shareButton.style.borderRadius = "12px";
    shareButton.style.border = "none";
    shareButton.style.cursor = "pointer";
    shareButton.style.marginTop = "12px";
    shareButton.style.transition = "background 0.3s";
    shareButton.onmouseover = () => shareButton.style.background = "#a21b2f";
    shareButton.onmouseout = () => shareButton.style.background = "#b22234";
    shareButton.onclick = () => {
        const message = `Join me on Drump | Punch2Earn! 🥾 Earn points and compete. Use my referral link: ${referralLink.value}`;
        Telegram.WebApp.showPopup({
            title: "Share your referral link",
            message: `Choose where to share your referral link:`,
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
    card.appendChild(shareButton);

    const closeButton = document.createElement("button");
    closeButton.innerText = "❌ Close";
    closeButton.style.background = "#ff6756";
    closeButton.style.color = "#fff";
    closeButton.style.padding = "10px 20px";
    closeButton.style.borderRadius = "12px";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.marginTop = "20px";
    closeButton.style.transition = "background 0.3s";
    closeButton.onmouseover = () => closeButton.style.background = "#e05547";
    closeButton.onmouseout = () => closeButton.style.background = "#ff6756";
    closeButton.onclick = () => {
        container.remove();
        window.activeTab = "game"; // restore punch ability
    };
    card.appendChild(closeButton);

    container.appendChild(card);
    document.body.appendChild(container);

    fetchProfileData();
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
        .catch(err => {
            console.error("Error fetching profile data:", err);
        });
}

export { renderProfilePage };
