import { fetchReferralHistory, renderReferralHistory } from "./referral.js";
import { updatePunchDisplay } from "./ui.js";

function renderProfilePage() {
    const existingProfile = document.getElementById("profile-container");
    if (existingProfile) existingProfile.remove();

    window.activeTab = "profile";

    const container = document.createElement("div");
    container.id = "profile-container";
    Object.assign(container.style, {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        width: "100vw",
        height: "100vh",
        background: "#f0f4ff",
        zIndex: "2000",
        overflowY: "auto",
        fontFamily: "'Arial Black', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "24px",
        paddingTop: "40px",
        boxSizing: "border-box"
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
        background: "#ffffff",
        color: "#000",
        padding: "24px",
        borderRadius: "18px",
        width: "90%",
        maxWidth: "420px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative"
    });

    const topCloseBtn = document.createElement("button");
    topCloseBtn.innerHTML = "✖";
    Object.assign(topCloseBtn.style, {
        position: "absolute",
        top: "12px",
        right: "12px",
        background: "transparent",
        border: "none",
        fontSize: "20px",
        fontWeight: "bold",
        color: "#aaa",
        cursor: "pointer",
        transition: "color 0.3s ease"
    });
    topCloseBtn.onmouseover = () => topCloseBtn.style.color = "#e74c3c";
    topCloseBtn.onmouseout = () => topCloseBtn.style.color = "#aaa";
    topCloseBtn.onclick = closeProfile;
    card.appendChild(topCloseBtn);

    const username = document.createElement("h2");
    username.innerText = `${window.storedUsername}'s Profile`;
    Object.assign(username.style, {
        marginBottom: "16px",
        fontSize: "22px",
        color: "#002868",
        margin: "0 0 8px"
    });
    card.appendChild(username);

    const avatar = document.createElement("div");
    avatar.innerText = "👤";
    Object.assign(avatar.style, {
        fontSize: "48px",
        marginBottom: "12px"
    });
    card.appendChild(avatar);

    const punchesStat = document.createElement("div");
    punchesStat.innerHTML = `🥊 Punches: <span id="punch-count">0</span>`;
    Object.assign(punchesStat.style, {
        fontSize: "18px",
        marginBottom: "20px",
        color: "#0047ab"
    });
    card.appendChild(punchesStat);

    const divider = document.createElement("hr");
    Object.assign(divider.style, {
        border: "none",
        borderTop: "2px solid #000000",
        margin: "20px 0"
    });
    card.appendChild(divider);

    const referralTitle = document.createElement("h3");
    referralTitle.innerText = "Invite & Earn";
    Object.assign(referralTitle.style, {
        fontSize: "18px",
        marginBottom: "8px",
        color: "#222"
    });
    card.appendChild(referralTitle);

    const referralMsg = document.createElement("p");
    referralMsg.innerText = "Invite friends and earn +1000 🥊 punches!";
    Object.assign(referralMsg.style, {
        fontSize: "14px",
        color: "#666",
        marginBottom: "6px"
    });
    card.appendChild(referralMsg);

    const referralCondition = document.createElement("p");
    referralCondition.innerText = "Your friend must punch at least 10 times for you to both earn the reward.";
    Object.assign(referralCondition.style, {
        fontSize: "12px",
        color: "#999",
        marginBottom: "14px",
        lineHeight: "1.3"
    });
    card.appendChild(referralCondition);

    const referralInput = document.createElement("input");
    referralInput.type = "text";
    referralInput.readOnly = true;
    referralInput.value = `https://t.me/Drump_punch_bot?start=referral_${window.userId}`;
    Object.assign(referralInput.style, {
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontFamily: "Arial",
        fontSize: "13px",
        marginBottom: "10px"
    });
    card.appendChild(referralInput);

    const btnGroup = document.createElement("div");
    Object.assign(btnGroup.style, {
        display: "flex",
        gap: "10px",
        width: "100%",
        marginBottom: "16px"
    });

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

    const closeButton = document.createElement("button");
    closeButton.innerHTML = "🚪 Exit Profile";
    Object.assign(closeButton.style, {
        background: "#e74c3c",
        color: "#fff",
        padding: "12px 24px",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        marginTop: "28px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        transition: "background 0.3s"
    });
    closeButton.onmouseover = () => closeButton.style.background = "#c0392b";
    closeButton.onmouseout = () => closeButton.style.background = "#e74c3c";
    closeButton.onclick = closeProfile;
    card.appendChild(closeButton);

    container.appendChild(card);
    document.body.appendChild(container);

    fetchProfileData();
    if (window.userId) {
        fetchReferralHistory();
    } else {
        console.warn("User ID not available yet. Skipping referral history fetch.");
    }
}

function fetchProfileData() {
    if (!window.userId) {
        console.warn("❌ userId not available. Cannot fetch profile data.");
        return;
    }

    fetch(`https://drumpleaderboard-production.up.railway.app/profile?user_id=${window.userId}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            const punchesStat = document.getElementById("punch-count");

            if (typeof data.punches === "number") {
                window.punches = data.punches;
            }

            if (punchesStat) {
                punchesStat.textContent = data.punches ?? "0";
            } else {
                console.warn("❌ Could not find #punch-count to update.");
            }

            const punchesCount = document.getElementById("punch-count");
            if (punchesCount) {
                punchesCount.innerHTML = `🥊 Punches: <span id="punch-count">${window.punches}</span>`;
            }
        })
        .catch(err => console.error("Error fetching profile data:", err));
}

function closeProfile() {
    const profile = document.getElementById("profile-container");
    if (profile) profile.remove();
    window.activeTab = "game";
    updatePunchDisplay(); // Ensure punch bar refreshes visually
}

function styleGameButton(button, bg, hoverBg) {
    Object.assign(button.style, {
        background: bg,
        color: "#fff",
        padding: "10px 0",
        borderRadius: "10px",
        border: "none",
        cursor: "pointer",
        fontSize: "14px",
        fontFamily: "'Arial Black', sans-serif",
        transition: "background 0.3s"
    });
    button.onmouseover = () => button.style.background = hoverBg;
    button.onmouseout = () => button.style.background = bg;
}

export { renderProfilePage };
