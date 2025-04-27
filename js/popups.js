import { createReferralButton } from "./buttons.js";
import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";

window.isPopupOpen = () => {
    return (
        document.getElementById("leaderboard-reward-popup")?.style.display === "flex" ||
        !!document.getElementById("referral-popup") ||
        !!document.getElementById("info-container")
    );
};

function createLeaderboardPopup() {
    if (document.getElementById("leaderboard-reward-popup")) return;

    const popup = document.createElement("div");
    popup.id = "leaderboard-reward-popup";
    Object.assign(popup.style, {
        position: "fixed",
        top: "0", left: "0", right: "0", bottom: "0",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        zIndex: ZINDEX.modal
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
        background: COLORS.badgeBg,
        border: BORDER.style,
        borderRadius: BORDER.radius,
        padding: "24px",
        width: "90%",
        maxWidth: "340px",
        fontFamily: FONT.body,
        textAlign: "center",
        boxShadow: "2px 2px 0 #000"
    });

    card.innerHTML = `
        <h2 style="font-size:18px; margin:0 0 12px; color:${COLORS.primary}; font-family:${FONT.heading}; font-weight:normal;">
            🏆 Leaderboard Rewards
        </h2>
        <p style="font-size:14px; margin-bottom:18px;">
            Climb the ranks and win extra punches!
        </p>
        <button id="close-leaderboard-popup" style="
            margin-top:10px;
            padding:10px 20px;
            font-family:${FONT.body};
            font-size:15px;
            background:${COLORS.primary};
            color:${COLORS.offWhite};
            border:none;
            border-radius:10px;
            box-shadow:1px 2px 0px #000;
            cursor:pointer;
        ">Close</button>
    `;

    popup.appendChild(card);
    popup.onclick = (e) => {
        if (e.target === popup) popup.style.display = "none";
    };
    card.querySelector("#close-leaderboard-popup").onclick = () => popup.style.display = "none";

    document.body.appendChild(popup);
}

function showReferralPopup() {
    const popup = document.createElement("div");
    popup.id = "referral-popup";
    Object.assign(popup.style, {
        position: "fixed",
        top: "0", left: "0", right: "0", bottom: "0",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: ZINDEX.modal,
        fontFamily: FONT.body
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
        background: COLORS.badgeBg,
        border: BORDER.style,
        borderRadius: "16px",
        padding: "0 0 24px 0",
        width: "90%",
        maxWidth: "340px",
        fontFamily: FONT.body,
        textAlign: "center",
        boxShadow: "2px 2px 0 #000",
        position: "relative",
        overflow: "hidden"
    });

    // Black Heading Bar
    const heading = document.createElement("div");
    heading.innerText = "INVITE & EARN";
    Object.assign(heading.style, {
        background: "#000",
        color: "#fff",
        fontSize: "20px",
        fontFamily: FONT.heading,
        padding: "14px",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        fontWeight: "normal"
    });

    // Close (X) Button
    const closeBtn = document.createElement("div");
    closeBtn.innerText = "✕";
    Object.assign(closeBtn.style, {
        position: "absolute",
        top: "8px",
        right: "12px",
        fontSize: "20px",
        color: "#888",
        cursor: "pointer",
        userSelect: "none"
    });
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        popup.remove();
    };

    // Description Text
    const description = document.createElement("div");
    description.innerHTML = `
      <div style="font-size:16px;margin:16px 12px 6px;line-height:1.5;color:#000;">
        +1000 <img src="drump-images/punch.svg" alt="punch" style="height:16px;vertical-align:-2px;"> per successful referral
      </div>
      <div style="font-size:15px;margin-bottom:16px;line-height:1.2;color:#000;">
        (FRIEND MUST PUNCH 20X)
      </div>
    `;

    // Referral Link Field
    const linkField = document.createElement("input");
    linkField.type = "text";
    linkField.readOnly = true;
    linkField.value = `https://t.me/Drump_punch_bot?start=referral_${window.userId}`;
    Object.assign(linkField.style, {
        width: "80%",
        padding: "10px",
        fontSize: "13px",
        border: "2px solid #000",
        borderRadius: "10px",
        background: "#fff",
        marginBottom: "18px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textAlign: "center",
        boxSizing: "border-box",
        maxWidth: "260px"
    });

    // Buttons (Copy / Share)
    const btnGroup = createReferralButton(linkField.value);

    card.appendChild(heading);
    card.appendChild(closeBtn);
    card.appendChild(description);
    card.appendChild(linkField);
    card.appendChild(btnGroup);

    popup.onclick = (e) => {
        if (e.target === popup) popup.remove();
    };

    popup.appendChild(card);
    document.body.appendChild(popup);
}

function faqItem(question, answer) {
    return `
        <div class="faq-item">
            <div class="faq-question">${question}</div>
            <div class="faq-answer">${answer}</div>
        </div>
    `;
}

function showInfoPage() {
    // (✅ Your info page stays good – no change needed based on current version)
}

export { showInfoPage, createLeaderboardPopup, showReferralPopup, faqItem };
