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
        body: JSON.stringify({ referrer_id: referrerId, user_id: userId })
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
  if (!Array.isArray(data)) data = [];

  const container = document.createElement("div");
  container.className = "referral-history";
  container.style.marginTop = "20px";

  const header = document.createElement("b");
  header.textContent = "REFERRAL HISTORY:";
  container.appendChild(header);

  const listWrap = document.createElement("div");
  listWrap.style.marginTop = "8px";

  if (data.length === 0) {
    listWrap.innerHTML = `<div style="color:#777; font-style:italic;">Nothing yet. Invite friends to get started.</div>`;
  } else {
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "13px";

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th style="text-align: left; padding: 6px 4px; border-bottom: 1px solid #ccc;">User</th>
        <th style="text-align: left; padding: 6px 4px; border-bottom: 1px solid #ccc;">Reward</th>
        <th style="text-align: left; padding: 6px 4px; border-bottom: 1px solid #ccc;">Time</th>
      </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    data.forEach(ref => {
      const time = new Date(ref.timestamp).toLocaleDateString();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="padding: 6px 4px; border-bottom: 1px solid #eee;">${ref.ref_username}</td>
        <td style="padding: 6px 4px; border-bottom: 1px solid #eee;">+${ref.reward} 🥾</td>
        <td style="padding: 6px 4px; border-bottom: 1px solid #eee;">${time}</td>`;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    listWrap.appendChild(table);
  }

  container.appendChild(listWrap);

  // Append to profile container
  const profile = document.getElementById("profile-container");
  if (profile) {
    profile.appendChild(container);
  }
}

export { checkAndSendReferral, fetchReferralHistory, renderReferralHistory };
