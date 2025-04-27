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

  const listWrap = document.createElement("div");
  listWrap.style.display = "flex";
  listWrap.style.flexDirection = "column";
  listWrap.style.gap = "12px";

  if (data.length === 0) {
    const empty = document.createElement("div");
    empty.innerText = "No Referral Rewards Yet.";
    Object.assign(empty.style, {
      color: "#777",
      fontStyle: "italic",
      fontSize: "14px",
      textAlign: "center"
    });
    listWrap.appendChild(empty);
  } else {
    data.forEach(ref => {
      const box = document.createElement("div");
      Object.assign(box.style, {
        background: COLORS.badgeBg,
        border: "2px solid #000",
        borderRadius: "12px",
        padding: "12px",
        fontFamily: FONT.body,
        fontSize: "14px",
        color: "#000",
        boxShadow: "1px 2px 0 0 #000",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        position: "relative"
      });

      const user = document.createElement("div");
      user.innerHTML = `<b>Friend:</b> ${ref.ref_username}`;

      const reward = document.createElement("div");
      reward.innerHTML = `<b>Reward:</b> +${ref.reward} <img src="drump-images/punch.svg" alt="punch" style="height:14px;vertical-align:-2px;">`;

      const time = document.createElement("div");
      time.innerHTML = `<b>Time:</b> ${new Date(ref.timestamp).toLocaleDateString()}`;

      // Claimed Button (non-clickable)
      const claimedBtn = document.createElement("div");
      claimedBtn.innerText = "CLAIMED";
      Object.assign(claimedBtn.style, {
        position: "absolute",
        top: "10px",
        right: "12px",
        background: "#2a3493",
        color: "#fff",
        fontSize: "12px",
        fontWeight: "bold",
        borderRadius: "999px",
        padding: "4px 10px",
        fontFamily: FONT.body,
        border: "2px solid #000",
        boxShadow: "1px 2px 0 0 #000",
        pointerEvents: "none", // ✅ Non-clickable
        userSelect: "none",
        textTransform: "uppercase"
      });

      box.appendChild(user);
      box.appendChild(reward);
      box.appendChild(time);
      box.appendChild(claimedBtn); // Add claimed badge

      listWrap.appendChild(box);
    });
  }

  container.appendChild(listWrap);

  const profile = document.getElementById("profile-container");
  if (profile) {
    profile.appendChild(container);
  }
}

export { checkAndSendReferral, fetchReferralHistory, renderReferralHistory };
