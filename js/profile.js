import { fetchReferralHistory } from "./referral.js";
import { createLeaderboardPopup } from "./popups.js";
import { renderTopBar } from "./topbar.js";
import { renderTabs } from "./ui_tabs.js";
import { COLORS, FONT, ZINDEX } from "./styles.js";

function renderProfilePage() {
  const existing = document.getElementById("profile-container");
  if (existing) existing.remove();

  document.getElementById("page-content")?.remove();
  document.getElementById("punch-bar")?.remove();
  document.getElementById("punch-badge")?.remove();

  window.activeTab = "profile";

  renderTopBar();
  renderTabs();
  createLeaderboardPopup();

  const container = document.createElement("div");
  container.id = "profile-container";
  Object.assign(container.style, {
    position: "fixed",
    top: "0", left: "0", right: "0", bottom: "0",
    background: "url('./drump-images/background.png') no-repeat center center",
    backgroundSize: "cover",
    overflowY: "auto",
    padding: "90px 16px 140px",
    boxSizing: "border-box",
    fontFamily: FONT.body,
    fontWeight: "normal",
    zIndex: 900
  });

  const section = document.createElement("div");
  section.className = "profile-section";

  const avatar = document.createElement("div");
  avatar.className = "profile-initials";
  const photoUrl = Telegram.WebApp?.initDataUnsafe?.user?.photo_url;
  if (photoUrl) {
    avatar.style.backgroundImage = `url(${photoUrl})`;
    Object.assign(avatar.style, {
      backgroundSize: "cover",
      backgroundPosition: "center",
      border: "2px solid #000",
    });
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

  // --- Referral Box ---
  const rewardBox = document.createElement("div");
  rewardBox.className = "referral-box";

  const bonusLine = document.createElement("div");
  bonusLine.innerHTML = `+1000 <img src="drump-images/punch.svg" alt="punch" style="height:16px;vertical-align:-2px;"> per successful referral`;
  rewardBox.appendChild(bonusLine);

  const note = document.createElement("small");
  note.textContent = "(FRIEND MUST PUNCH 20X)";
  rewardBox.appendChild(note);

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
  copyBtn.onclick = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(referralInput.value);
    copyBtn.innerText = "COPIED";
    setTimeout(() => {
      copyBtn.innerText = "COPY";
    }, 2000);
  };

  const shareBtn = document.createElement("button");
  shareBtn.className = "share-btn";
  shareBtn.textContent = "SHARE";
  shareBtn.onclick = (e) => {
    e.stopPropagation();
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

  const rewardsBox = document.createElement("div");
  rewardsBox.className = "referral-history";
  rewardsBox.innerHTML = `<b>CLAIMED REWARDS:</b><div id="claimed-rewards-list" style="margin-top: 8px;"></div>`;
  container.appendChild(rewardsBox);

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "Close Profile";
  Object.assign(closeBtn.style, {
    background: COLORS.deepRed,
    color: "#fff",
    padding: "14px 24px",
    borderRadius: "10px",
    border: "none",
    fontFamily: FONT.body,
    fontSize: "15px",
    fontWeight: "normal",
    cursor: "pointer",
    margin: "30px auto 40px",
    display: "block",
    boxShadow: "2px 2px 0px 0px #000",
    width: "100%",
    maxWidth: "280px"
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

  const wrap = document.createElement("div");
  wrap.id = "page-content";
  Object.assign(wrap.style, {
    position: "fixed",
    top: "60px",
    bottom: "64px",
    left: "0",
    right: "0",
    overflow: "hidden",
    zIndex: ZINDEX.punchBar,
  });

  wrap.appendChild(container);
  document.body.appendChild(wrap);

  fetchProfileData();
  fetchUserRank();
  if (window.userId) {
    fetchReferralHistory();
    fetchClaimedRewards();
  }
}

export { renderProfilePage };
