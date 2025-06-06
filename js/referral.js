import { COLORS, FONT, ZINDEX } from "./styles.js";

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
  container.style.marginTop = "24px";

  const header = document.createElement("b");
  header.textContent = "REFERRAL HISTORY:";
  Object.assign(header.style, {
    display: "block",
    fontFamily: FONT.heading,
    fontSize: "18px",
    marginBottom: "12px",
    color: COLORS.primary
  });
  container.appendChild(header);

  const tableWrap = document.createElement("div");
  tableWrap.className = "table-container";
  tableWrap.style.overflowX = "auto";

  const table = document.createElement("table");
  Object.assign(table.style, {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: FONT.body,
    fontSize: "14px",
    boxShadow: "1px 2px 0 0 #000"
  });

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr style="background:${COLORS.badgeBg};">
      <th style="text-align:left; padding:8px; border-bottom:2px solid #000;">User</th>
      <th style="text-align:left; padding:8px; border-bottom:2px solid #000;">Reward</th>
      <th style="text-align:left; padding:8px; border-bottom:2px solid #000;">Status</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  if (data.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="3" style="padding:12px; text-align:center; color:#777;">No Referral Rewards Yet.</td>
    `;
    tbody.appendChild(emptyRow);
  } else {
    data.forEach(ref => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td style="padding:8px; border-bottom:1px solid #eee;">${ref.ref_username}</td>
        <td style="padding:8px; border-bottom:1px solid #eee;">+${ref.reward} <img src="drump-images/punch.svg" style="height:14px;vertical-align:-2px;"></td>
        <td style="padding:8px; border-bottom:1px solid #eee;">
          <div style="
            background: #2a3493;
            color: #fff;
            border: 2px solid #000;
            border-radius: 999px;
            padding: 4px 10px;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 1px 2px 0 0 #000;
            text-align: center;
            width: fit-content;
            user-select: none;
          ">
            CLAIMED
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  table.appendChild(tbody);
  tableWrap.appendChild(table);
  container.appendChild(tableWrap);

  const profile = document.getElementById("profile-container");
  if (profile) {
    profile.appendChild(container);

    // === Close Profile Button ===
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "Close Profile";
    Object.assign(closeBtn.style, {
        background: "#d60000",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "10px",
        border: "2px solid #000",
        fontFamily: FONT.body,
        fontSize: "15px",
        cursor: "pointer",
        margin: "30px auto 40px",
        display: "block",
        boxShadow: "1px 2px 0 0 #000",
        width: "100%",
        maxWidth: "280px",
        textTransform: "uppercase"
    });

    closeBtn.onclick = async () => {
        const profileEl = document.getElementById("profile-container");
        if (profileEl) profileEl.remove();
        const returnTo = window.lastActiveTab || "game";
        window.activeTab = returnTo;
        const { showTab } = await import("./ui_tabs.js");
        showTab(returnTo);
    };

    profile.appendChild(closeBtn);
  }

}

export { checkAndSendReferral, fetchReferralHistory, renderReferralHistory };
