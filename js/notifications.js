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
    fontFamily: FONT.body
  });

  const popup = document.createElement("div");
  popup.id = "notification-popup";
  Object.assign(popup.style, {
    background: "#FFF2C5",
    border: "2px solid #000",
    borderRadius: "16px",
    padding: "20px",
    width: "90%",
    maxWidth: "360px",
    fontFamily: FONT.heading,
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
  title.textContent = "🔔 Notifications";
  title.style.marginBottom = "12px";

  const desc = document.createElement("p");
  desc.style.fontSize = "14px";
  desc.style.lineHeight = "1.5";
  desc.innerHTML = `
    Get notified about:<br>
    🪹 New reward drops<br>
    ⏳ Unfinished tasks<br>
    📉 If your leaderboard rank drops
  `;

  const button = document.createElement("button");
  button.textContent = "Loading...";
  Object.assign(button.style, {
    marginTop: "18px",
    padding: "10px 18px",
    fontSize: "15px",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "2px solid #000",
    background: COLORS.primary,
    color: COLORS.offWhite,
    cursor: "pointer",
    boxShadow: "1.5px 1.5px 0 #000"
  });

  const userId = window.userId;
  const username = window.username || "unknown";

  fetch(`${API_BASE}/notifications/status?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
      let subscribed = data.subscribed;
      button.textContent = subscribed ? "🛑 Stop Notifications" : "✅ Enable Notifications";

      button.onclick = () => {
        const endpoint = `${API_BASE}${subscribed ? "/notifications/unsubscribe" : "/notifications/subscribe"}`;
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, username })
        })
          .then(res => res.json())
          .then(() => {
            showNotificationSuccess(
              subscribed
                ? "🔕 You have unsubscribed from notifications."
                : "✅ You’re now subscribed to notifications!"
            );

            subscribed = !subscribed;
            button.textContent = subscribed ? "🛑 Stop Notifications" : "✅ Enable Notifications";
          })
          .catch(err => alert("❌ Failed to update notification status: " + err));
      };
    })
    .catch(() => {
      button.textContent = "❌ Failed to load status";
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
  const existing = document.getElementById("notif-confirm-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "notif-confirm-popup";
  Object.assign(popup.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: COLORS.offWhite,
    color: COLORS.primary,
    padding: "18px 24px",
    borderRadius: "14px",
    border: `2px solid ${COLORS.primary}`,
    boxShadow: "1px 2px 0 #000",
    fontFamily: FONT.body,
    zIndex: ZINDEX.modal + 10,
    textAlign: "center"
  });

  const text = document.createElement("p");
  text.innerText = msg;

  const x = document.createElement("button");
  x.innerText = "Close";
  Object.assign(x.style, {
    marginTop: "10px",
    background: COLORS.primary,
    color: COLORS.offWhite,
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer"
  });

  x.onclick = () => popup.remove();
  popup.appendChild(text);
  popup.appendChild(x);
  document.body.appendChild(popup);
}

export { showNotificationPopup };
