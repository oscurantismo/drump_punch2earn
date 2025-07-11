import { fetchReferralHistory } from "./referral.js";
import { renderTopBar } from "./topbar.js";
import { renderTabs } from "./ui_tabs.js";
import { COLORS, FONT, ZINDEX } from "./styles.js";

function renderProfilePage() {
    const existing = document.getElementById("profile-container");
    if (existing) existing.remove();

    document.getElementById("page-content")?.remove();
    document.getElementById("punch-bar")?.remove();
    document.getElementById("punch-gap-badge")?.remove();

    window.activeTab = "profile";

    renderTopBar();
    renderTabs();

    const container = document.createElement("div");
    container.id = "profile-container";
    Object.assign(container.style, {
        position: "fixed",
        top: "0", left: "0", right: "0", bottom: "0",
        background: "url('./drump-images/background.png') center center / cover no-repeat",
        overflowY: "auto",
        padding: "90px 16px 140px",
        boxSizing: "border-box",
        fontFamily: FONT.heading,
        fontWeight: "normal",
        zIndex: 900
    });

    const section = document.createElement("div");
    section.className = "profile-section";

    // === Avatar + Name ===
    const avatar = document.createElement("div");
    avatar.className = "profile-initials";
    const photoUrl = Telegram.WebApp?.initDataUnsafe?.user?.photo_url;
    if (photoUrl) {
        avatar.style.backgroundImage = `url(${photoUrl})`;
        Object.assign(avatar.style, {
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: "2px solid #293391",
        });
    } else {
        avatar.textContent = getUserInitials(window.storedUsername);
    }
    section.appendChild(avatar);

    const name = document.createElement("div");
    name.className = "profile-name";
    name.textContent = window.storedUsername || "Anonymous";
    section.appendChild(name);

    container.appendChild(section);

    /*

    // === Referral Box with Black Heading ===
    const rewardBox = document.createElement("div");
    rewardBox.className = "referral-box";
    Object.assign(rewardBox.style, { position: "relative", paddingTop: "50px" });

    const heading = document.createElement("div");
    heading.innerText = "INVITE & EARN";
    Object.assign(heading.style, {
        position: "absolute",
        top: "-24px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#000",
        color: "#fff",
        padding: "10px 24px",
        fontSize: "18px",
        fontFamily: FONT.heading,
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "2px 2px 0 #000",
        textTransform: "uppercase",
        fontWeight: "normal"
    });
    rewardBox.appendChild(heading);

    const bonusLine = document.createElement("div");
    bonusLine.innerHTML = `+10000 <img src="drump-images/punch.svg" alt="punch" style="height:16px;vertical-align:-2px;"> per successful referral`;
    Object.assign(bonusLine.style, {
        fontSize: "16px",
        marginBottom: "4px",
        color: "#000",
        fontFamily: FONT.heading,
    });
    rewardBox.appendChild(bonusLine);

    const note = document.createElement("small");
    note.textContent = "(FRIEND MUST PUNCH 20X)";
    Object.assign(note.style, {
        fontSize: "15px",
        color: "#000",
        display: "block",
        marginBottom: "16px",
        fontFamily: FONT.heading,
    });
    rewardBox.appendChild(note);

    const referralInput = document.createElement("input");
    referralInput.type = "text";
    referralInput.readOnly = true;
    referralInput.className = "referral-link";
    referralInput.value = `https://t.me/Drump_punch_bot?start=referral_${window.userId}`;
    rewardBox.appendChild(referralInput);

    container.appendChild(rewardBox);

    // === Copy + Share Buttons ===
    const actionRow = document.createElement("div");
    actionRow.className = "referral-actions";

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.innerText = "COPY";
    copyBtn.onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(referralInput.value);
        copyBtn.innerText = "✅ Copied";
        setTimeout(() => {
            copyBtn.innerText = "COPY";
        }, 3000);
    };

    const shareBtn = document.createElement("button");
    shareBtn.className = "share-btn";
    shareBtn.innerText = "SHARE";
    shareBtn.onclick = (e) => {
        e.stopPropagation();
        const msg = `🥊 Join me on Drump | Tap2Earn!\n\nUse my referral: ${referralInput.value}`;
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
    container.appendChild(actionRow);

    */

    const claimedRewardsSection = document.createElement("div");
    claimedRewardsSection.className = "referral-history"; // ✅ styled white box
    claimedRewardsSection.style.marginTop = "24px";

    const header = document.createElement("b");
    header.textContent = "CLAIMED REWARDS:";
    Object.assign(header.style, {
      display: "block",
      fontFamily: FONT.heading,
      fontSize: "18px",
      marginBottom: "12px",
      color: COLORS.primary
    });
    claimedRewardsSection.appendChild(header);

    const tableWrap = document.createElement("div");
    tableWrap.className = "table-container";
    tableWrap.style.overflowX = "auto";

    const table = document.createElement("table");
    Object.assign(table.style, {
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: FONT.heading,
      fontSize: "14px",
      boxShadow: "1px 2px 0 0 #000"
    });

    table.innerHTML = `
      <thead>
        <tr style="background:${COLORS.badgeBg};">
          <th style="text-align:left; padding:8px; border-bottom:2px solid #000;">Task</th>
          <th style="text-align:left; padding:8px; border-bottom:2px solid #000;">Reward</th>
          <th style="text-align:left; padding:8px; border-bottom:2px solid #000;">Status</th>
        </tr>
      </thead>
      <tbody id="claimed-rewards-list">
        <tr>
          <td colspan="3" style="padding:12px; text-align:center; color:#777;">No Claimed Rewards Yet.</td>
        </tr>
      </tbody>
    `;

    tableWrap.appendChild(table);
    claimedRewardsSection.appendChild(tableWrap);
    container.appendChild(claimedRewardsSection);


    // === Referral History (will be appended dynamically)
    fetchReferralHistory();

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
      }
    })
    .catch(err => console.error("Error fetching profile data:", err));
}


export { renderProfilePage };
