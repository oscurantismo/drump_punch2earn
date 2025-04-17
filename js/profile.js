import { fetchReferralHistory, renderReferralHistory } from "./referral.js";
import { createLeaderboardPopup } from "./popups.js";
import { updatePunchDisplay } from "./ui.js";
import { COLORS, FONT } from "./styles.js";

function renderProfilePage() {
    const existingProfile = document.getElementById("profile-container");
    if (existingProfile) existingProfile.remove();

    window.activeTab = "profile";
    updatePunchDisplay();
    createLeaderboardPopup();

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
        background: COLORS.badgeBg,
        zIndex: "2000",
        overflowY: "auto",
        fontFamily: FONT.body,
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
        background: COLORS.offWhite,
        color: COLORS.primary,
        padding: "24px",
        borderRadius: "18px",
        width: "90%",
        maxWidth: "420px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative"
    });

    // Dynamic leaderboard rank circle
    const leaderboardCircle = document.createElement("div");
    leaderboardCircle.id = "leaderboard-rank-circle";
    leaderboardCircle.innerText = "#?";
    Object.assign(leaderboardCircle.style, {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        background: COLORS.primary,
        color: COLORS.offWhite,
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        marginBottom: "12px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)"
    });
    card.appendChild(leaderboardCircle);

    const username = document.createElement("h2");
    username.innerText = `${window.storedUsername}'s Profile`;
    Object.assign(username.style, {
        marginBottom: "8px",
        fontSize: "22px",
        color: COLORS.deepRed,
        fontFamily: FONT.heading
    });
    card.appendChild(username);

    const punchesStat = document.createElement("div");
    punchesStat.innerHTML = `🥊 Punches: <span id="punchProfileStat">0</span>`;
    Object.assign(punchesStat.style, {
        fontSize: "18px",
        marginBottom: "20px",
        color: COLORS.primary,
        fontWeight: "bold"
    });
    card.appendChild(punchesStat);

    const divider = document.createElement("hr");
    Object.assign(divider.style, {
        border: "none",
        borderTop: `2px solid ${COLORS.primary}`,
        margin: "20px 0",
        width: "100%"
    });
    card.appendChild(divider);

    const referralTitle = document.createElement("h3");
    referralTitle.innerText = "Invite & Earn";
    Object.assign(referralTitle.style, {
        fontSize: "18px",
        marginBottom: "8px",
        color: COLORS.primary
    });
    card.appendChild(referralTitle);

    const referralMsg = document.createElement("p");
    referralMsg.innerText = "Earn +1000 🥊 punches for every valid invite!";
    Object.assign(referralMsg.style, {
        fontSize: "14px",
        color: "#333",
        marginBottom: "4px",
        textAlign: "center"
    });
    card.appendChild(referralMsg);

    const referralCondition = document.createElement("p");
    referralCondition.innerText = "Your friend must punch 20+ times.";
    Object.assign(referralCondition.style, {
        fontSize: "12px",
        color: "#888",
        marginBottom: "14px",
        lineHeight: "1.4",
        textAlign: "center"
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
        fontFamily: FONT.body,
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
    styleGameButton(copyBtn, "#0047ab", "#00337a");
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(referralInput.value);
        alert("Link copied!");
    };

    const shareBtn = document.createElement("button");
    shareBtn.innerText = "📣 Share";
    shareBtn.style.flex = "1";
    styleGameButton(shareBtn, "#8e0004", "#6c0003");
    shareBtn.onclick = () => {
        const cleanLink = `https://t.me/Drump_punch_bot?start=referral_${window.userId}`;
        const message = `🥊 Ready to blow off some steam?\nJoin me in Drump | Punch2Earn — the only game where you punch Drump for glory, leaderboard fame, and real rewards. 💥\n\nUse my link to get started: ${cleanLink}`;

        Telegram.WebApp.showPopup({
            title: "Share your referral link",
            message: "Choose where to share your invite:",
            buttons: [
                { id: "telegram", type: "default", text: "Telegram" },
                { id: "x", type: "default", text: "X (Twitter)" },
                { id: "whatsapp", type: "default", text: "WhatsApp" }
            ]
        }, (btnId) => {
            const links = {
                telegram: `https://t.me/share/url?url=${encodeURIComponent(cleanLink)}&text=${encodeURIComponent(message)}`,
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
        background: COLORS.deepRed,
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
    closeButton.onmouseover = () => closeButton.style.background = "#6c0003";
    closeButton.onmouseout = () => closeButton.style.background = COLORS.deepRed;
    closeButton.onclick = closeProfile;
    card.appendChild(closeButton);

    container.appendChild(card);
    document.body.appendChild(container);

    fetchProfileData();
    if (window.userId) fetchReferralHistory();
    fetchUserRank(); // ✅ Get rank from backend
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
            if (typeof data.punches === "number") {
                window.punches = data.punches;
                const punchProfileStat = document.getElementById("punchProfileStat");
                if (punchProfileStat) punchProfileStat.textContent = window.punches;
                updatePunchDisplay();
            }
        })
        .catch(err => console.error("Error fetching profile data:", err));
}

function fetchUserRank() {
    fetch("https://drumpleaderboard-production.up.railway.app/leaderboard")
        .then(res => res.json())
        .then(data => {
            const index = data.findIndex(entry => entry.user_id === window.userId);
            const rank = index >= 0 ? `#${index + 1}` : ">100";
            const circle = document.getElementById("leaderboard-rank-circle");
            if (circle) circle.innerText = rank;
        })
        .catch(err => console.error("Error fetching rank:", err));
}

function closeProfile() {
    const profile = document.getElementById("profile-container");
    if (profile) profile.remove();
    window.activeTab = "game";
    updatePunchDisplay();
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
        fontFamily: FONT.body,
        transition: "background 0.3s"
    });
    button.onmouseover = () => button.style.background = hoverBg;
    button.onmouseout = () => button.style.background = bg;
}

export { renderProfilePage };
