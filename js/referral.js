let hasReportedReferral = false;

function checkAndSendReferral(userId, punches) {
    if (hasReportedReferral || !userId || punches < 10) return;

    const startParam = Telegram.WebApp.initDataUnsafe?.start_param;
    if (startParam && startParam.startsWith("referral_")) {
        const referrerId = startParam.replace("referral_", "").trim();

        if (referrerId && referrerId !== userId) {
            console.log("🔗 Referral detected. Sending to backend...");

            fetch("https://drumpleaderboard-production.up.railway.app/referral", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    referrer_id: referrerId,
                    user_id: userId
                })
            })
            .then(res => {
                if (!res.ok) throw new Error(`Referral error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log("✅ Referral processed:", data);
                hasReportedReferral = true;
            })
            .catch(err => {
                console.error("❌ Error submitting referral:", err);
            });
        }
    }
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


function renderReferralHistory(data) {
    const container = document.createElement("div");
    container.style.marginTop = "20px";
    container.style.background = "#fff";
    container.style.padding = "16px";
    container.style.borderRadius = "12px";
    container.style.color = "#000";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.fontSize = "14px";
    container.style.textAlign = "left";

    const title = document.createElement("h3");
    title.innerText = "📋 Referral History";
    title.style.marginBottom = "10px";
    container.appendChild(title);

    if (data.history?.length === 0) {
        const none = document.createElement("p");
        none.innerText = "No referrals yet.";
        container.appendChild(none);
    } else {
        data.history.forEach(entry => {
            const p = document.createElement("p");
            p.style.marginBottom = "8px";
            p.innerHTML = `
                <strong>${entry.referred_username}</strong> submitted ${entry.referred_punches} punches<br>
                🕒 ${entry.timestamp}<br>
                🎁 Reward: +100 punches (from ${entry.previous_score} ➜ ${entry.new_score})
            `;
            container.appendChild(p);
        });
    }

    const profileCard = document.querySelector("#profile-container div");
    if (profileCard) profileCard.appendChild(container);
}

export { checkAndSendReferral, fetchReferralHistory, renderReferralHistory };

