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
            renderReferralHistory([]);
        });
}

function renderReferralHistory(data) {
    if (!Array.isArray(data)) {
        console.warn("Referral history data is not an array. Defaulting to empty.");
        data = [];
    }

    const container = document.createElement("div");
    Object.assign(container.style, {
        marginTop: "20px",
        background: "#ffffff",
        padding: "16px",
        borderRadius: "12px",
        color: "#000",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        textAlign: "left",
        width: "100%"
    });

    const title = document.createElement("h3");
    title.innerText = "📋 Referral History";
    Object.assign(title.style, {
        marginBottom: "10px",
        color: "#002868"
    });
    container.appendChild(title);

    if (data.length === 0) {
        const none = document.createElement("p");
        none.innerText = "Nothing here yet. Invite friends to update.";
        Object.assign(none.style, {
            color: "#777",
            fontStyle: "italic"
        });
        container.appendChild(none);
    } else {
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.fontSize = "13px";

        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ccc;">User</th>
                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ccc;">Reward</th>
                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ccc;">Time</th>
            </tr>`;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        data.forEach(ref => {
            const time = new Date(ref.timestamp).toLocaleString();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${ref.ref_username}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">+${ref.reward} punches</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${time}</td>`;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        container.appendChild(table);
    }

    const card = document.querySelector("#profile-container div");

    if (card) {
        const closeBtn = Array.from(card.querySelectorAll("button"))
            .find(btn => btn.innerText.trim() === "🚪 Exit Profile");

        if (closeBtn && card.contains(closeBtn)) {
            card.insertBefore(container, closeBtn);
        } else {
            card.appendChild(container);
        }
    }
}

export { checkAndSendReferral, fetchReferralHistory, renderReferralHistory };
