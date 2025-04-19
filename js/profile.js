import { fetchReferralHistory } from "./referral.js";
import { createLeaderboardPopup } from "./popups.js";
import { updatePunchDisplay } from "./ui.js";
import { renderTopBar } from "./topbar.js";
import { renderTabs } from "./ui.js";
import { COLORS, FONT } from "./styles.js";

function renderProfilePage() {
  const existing = document.getElementById("profile-container");
  if (existing) existing.remove();

  window.activeTab = "profile";
  updatePunchDisplay();
  renderTopBar();
  renderTabs();
  createLeaderboardPopup();

  const container = document.createElement("div");
  container.id = "profile-container";

  const section = document.createElement("div");
  section.className = "profile-section";

  const avatar = document.createElement("div");
  avatar.className = "profile-initials";
  const photoUrl = Telegram.WebApp?.initDataUnsafe?.user?.photo_url;
  if (photoUrl) {
    avatar.style.backgroundImage = `url(${photoUrl})`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
    avatar.style.border = "3px solid #000";
    avatar.textContent = "";
  } else {
    avatar.textContent = getUserInitials(window.storedUsername);
  }

  section.appendChild(avatar);

  const name = document.createElement("div");
  name.className = "profile-name";
  name.textContent = window.storedUsername || "Anonymous";
  section.appendChild(name);

  const punches = document.createElement("div");
  punches.className = "punch-score";
  punches.innerHTML = `Punches: <span id="punchProfileStat">0</span>`;
  section.appendChild(punches);

  const invite = document.createElement("button");
  invite.className = "invite-btn";
  invite.textContent = "INVITE & EARN";
  invite.onclick = () => window.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  section.appendChild(invite);

  container.appendChild(section);

  // === Referral Box ===
  const rewardBox = document.createElement("div");
  rewardBox.className = "referral-box";
  rewardBox.innerHTML = `
    <div><b>+1000 <img src="drump-images/punch.svg" alt="punch" style="height:14px;vertical-align:-2px;"></b> per successful referral<br><small>(FRIEND MUST PUNCH 20×)</small></div>
  `;

  const referralInput = document.createElement("input");
  referralInput.type = "text";
  referralInput.readOnly = true;
  referralInput.className = "referral-link";
  referralInput.value = `https://t.me/Drump_punch_bot?start=referral_${window.userId}`;
  rewardBox.appendChild(referralInput);

  const actionRow = document.createElement("div");
  actionRow.className = "referral-actions";

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "COPY";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(referralInput.value);
    alert("Referral link copied!");
  };

  const shareBtn = document.createElement("button");
  shareBtn.className = "share-btn";
  shareBtn.textContent = "SHARE";
  shareBtn.onclick = () => {
    const msg = `🥊 Join me on Drump | Punch2Earn!\n\nUse my referral: ${referralInput.value}`;
    Telegram.WebApp.showPopup({
      title: "Share your invite",
      message: "Choose where to share:",
      buttons: [
        { id: "telegram", type: "default", text: "Telegram" },
        { id: "x", type: "default", text: "X (Twitter)" },
        { id: "whatsapp", type: "default", text: "WhatsApp" }
      ]
    }, (id) => {
      const encoded = encodeURIComponent(msg);
      const url = {
        telegram: `https://t.me/share/url?url=${encoded}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encoded}`,
        x: `https://twitter.com/intent/tweet?text=${encoded}`
      }[id];
      if (url) window.open(url, "_blank");
    });
  };

  actionRow.appendChild(copyBtn);
  actionRow.appendChild(shareBtn);
  rewardBox.appendChild(actionRow);
  container.appendChild(rewardBox);

  // === Claimed Rewards Section ===
  const rewardsBox = document.createElement("div");
  rewardsBox.className = "referral-history";
  rewardsBox.innerHTML = `<b>CLAIMED REWARDS:</b><br><div id="claimed-rewards-list" style="margin-top: 8px;">Loading...</div>`;
  container.appendChild(rewardsBox);

  // === Close Profile Button ===
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "❌ Close Profile";
  Object.assign(closeBtn.style, {
    background: COLORS.deepRed,
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    fontFamily: FONT.body,
    fontSize: "14px",
    fontWeight: "normal",
    cursor: "pointer",
    margin: "30px auto 100px",
    display: "block",
    boxShadow: "1px 2px 0px 0px #000000"
  });
  closeBtn.onclick = async () => {
    const profileEl = document.getElementById("profile-container");
    if (profileEl) profileEl.remove();

    const returnTo = window.lastActiveTab || "game";
    window.activeTab = returnTo;
    const { showTab } = await import("./ui_tabs.js");
    showTab(returnTo);
  };

  container.appendChild(closeBtn);

  document.body.appendChild(container);

  fetchProfileData();
  fetchUserRank();
  if (window.userId) {
    fetchReferralHistory();
    fetchClaimedRewards();
  }
}

function getUserInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function fetchProfileData() {
  if (!window.userId) return;
  fetch(`https://drumpleaderboard-production.up.railway.app/profile?user_id=${window.userId}`)
    .then(res => res.json())
    .then(data => {
      if (typeof data.punches === "number") {
        window.punches = data.punches;
        const stat = document.getElementById("punchProfileStat");
        if (stat) stat.textContent = window.punches;
        updatePunchDisplay();
      }
    })
    .catch(err => console.error("Error fetching profile data:", err));
}

function fetchClaimedRewards() {
  fetch("https://drumpleaderboard-production.up.railway.app/rewards")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("claimed-rewards-list");
      if (!Array.isArray(data) || !list) return (list.innerText = "None yet.");
      const userRewards = data.filter(r => r.user_id === window.userId);
      if (userRewards.length === 0) {
        list.innerText = "None yet.";
      } else {
        list.innerHTML = userRewards.map(r =>
          `<div style="margin-bottom: 6px;">✅ <b>${r.reward_type}</b>: ${r.change} <img src="drump-images/punch.svg" alt="punch" style="height:14px; vertical-align:-2px;"> – <small>${r.timestamp.split("T")[0]}</small></div>`
        ).join("");
      }
    })
    .catch(err => {
      const list = document.getElementById("claimed-rewards-list");
      if (list) list.innerText = "Unable to load rewards.";
      console.error("Error fetching rewards:", err);
    });
}

export { renderProfilePage };
