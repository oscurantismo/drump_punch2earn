import { COLORS, FONT, ZINDEX } from "./styles.js";

const API_BASE = "https://drumpleaderboard-production.up.railway.app";

function showNotificationPopup() {
  const existing = document.getElementById("notification-overlay");
  if (existing) return;

  const overlay = document.createElement("div");
  overlay.id = "notification-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0", left: "0", right: "0", bottom: "0",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: ZINDEX.modal,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: FONT.heading,
  });

  const popup = document.createElement("div");
  popup.id = "notification-popup";
  Object.assign(popup.style, {
    background: "#FFEDAC",
    border: "2px solid #000",
    borderRadius: "16px",
    paddingLeft: "20px",
    paddingRight: "20px",
    paddingBottom: "20px",
    width: "90vw",
    maxWidth: "360px",
    fontFamily: FONT.heading,
    fontSize: "18px",
    boxShadow: "2px 2px 0 #000",
    textAlign: "center",
    position: "relative"
  });

  const close = document.createElement("div");
  close.textContent = "✖";
  Object.assign(close.style, {
    position: "absolute",
    top: "10px",
    right: "14px",
    fontSize: "18px",
    cursor: "pointer"
  });
  close.onclick = () => overlay.remove();

  const title = document.createElement("h3");
  title.textContent = "Notifications";
  title.style.marginBottom = "12px";
  title.style.fontSize = "24px";

  const desc = document.createElement("div");
  Object.assign(desc.style, {
    fontSize: "18px",
    lineHeight: "1.5",
    textAlign: "left",
    fontFamily: FONT.heading,
    marginBottom: "10px"
  });
  desc.innerHTML = `
    <p style="margin-bottom: 6px;">Get notified about:</p>
    <ul style="padding-left: 18px; margin: 0;">
      <li>New reward drops</li>
      <li>Unfinished tasks</li>
      <li>If your leaderboard rank drops</li>
    </ul>
  `;


  const button = document.createElement("button");
  button.textContent = "Loading...";
  Object.assign(button.style, {
    marginTop: "18px",
    padding: "10px 18px",
    fontSize: "15px",
    fontWeight: "normal",
    borderRadius: "8px",
    border: "1px solid #000",
    background: COLORS.primary,
    color: COLORS.offWhite,
    cursor: "pointer",
    boxShadow: "1px 2px 0 #000",
    fontFamily: FONT.heading
  });

  const userId = window.userId;
  const username = window.username || "unknown";

  fetch(`${API_BASE}/notifications/status?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
      let subscribed = data.subscribed;
      button.textContent = subscribed ? "Stop Notifications" : "Enable Notifications";

      button.onclick = () => {
        const endpoint = `${API_BASE}${subscribed ? "/notifications/unsubscribe" : "/notifications/subscribe"}`;
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, username: window.username || "Anonymous" })
        })
          .then(res => res.json())
          .then(() => {
            const message = subscribed
              ? `We're sorry to see you go.<br><br>Let us know how we can improve by messaging us: <a href="https://t.me/drumpgame" target="_blank" style="color:${COLORS.primary}; text-decoration: underline; align-text: left;">Our Telegram group</a>`
              : "Thank you for subscribing!";

            showNotificationSuccess(message);

            subscribed = !subscribed;
            button.textContent = subscribed ? "Stop Notifications" : "Enable Notifications";
          })
          .catch(err => alert("Sorry, no information. Try again later: " + err));
      };
    })
    .catch(() => {
      button.textContent = "Sorry, no information. Try again later";
      button.disabled = true;
    });

  popup.append(close, title, desc, button);
  overlay.appendChild(popup);
  overlay.onclick = e => {
    if (e.target === overlay) overlay.remove();
  };

  document.body.appendChild(overlay);
}

function showNotificationSuccess(msg) {
  const existing = document.getElementById("notif-confirm-overlay");
  if (existing) return;

  const overlay = document.createElement("div");
  overlay.id = "notif-confirm-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0", left: "0", right: "0", bottom: "0",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: ZINDEX.modal + 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: FONT.body
  });

  const popup = document.createElement("div");
  popup.id = "notif-confirm-popup";
  Object.assign(popup.style, {
    background: "#FFEDAC",
    color: "#000000",
    padding: "18px 24px",
    borderRadius: "14px",
    border: "2px solid #000000",
    boxShadow: "2px 2px 0 #000",
    fontFamily: FONT.body,
    zIndex: ZINDEX.modal + 10,
    textAlign: "center",
    width: "80%",
    maxWidth: "340px"
  });

  const text = document.createElement("p");
  text.innerHTML = msg;

  const x = document.createElement("button");
  x.innerText = "Close";
  Object.assign(x.style, {
    marginTop: "10px",
    background: "#FFE99B",
    color: "#000000",
    border: "1px solid #000000",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: FONT.heading,
    boxShadow: "2px 2px 0 #000"
  });

  x.onclick = () => overlay.remove();

  popup.appendChild(text);
  popup.appendChild(x);
  overlay.appendChild(popup);

  // Close if clicked outside the popup
  overlay.onclick = e => {
    if (e.target === overlay) overlay.remove();
  };

  document.body.appendChild(overlay);
}


export { showNotificationPopup };
