import { COLORS, FONT } from "./styles.js";

const API_BASE = "https://drumpleaderboard-production.up.railway.app";

function showNotificationPopup() {
  if (document.getElementById("notification-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "notification-overlay";
  overlay.classList.add("modal-active");
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3000,
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
    position: "relative",
  });

  const close = document.createElement("div");
  close.textContent = "✖";
  Object.assign(close.style, {
    position: "absolute",
    top: "10px",
    right: "14px",
    fontSize: "18px",
    cursor: "pointer",
  });
  close.onclick = () => overlay.remove();

  const title = document.createElement("h3");
  title.textContent = "🔔 Notifications";
  Object.assign(title.style, {
    marginBottom: "12px",
    fontSize: "20px",
  });

  const desc = document.createElement("p");
  Object.assign(desc.style, {
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "16px",
  });
  desc.innerHTML = `
    Get notified about:<br>
    🪹 New reward drops<br>
    ⏳ Unfinished tasks<br>
    📉 If your leaderboard rank drops
  `;

  const button = document.createElement("button");
  button.textContent = "Loading...";
  Object.assign(button.style, {
    marginTop: "12px",
    padding: "10px 18px",
    fontSize: "15px",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "2px solid #000",
    background: COLORS.primary,
    color: COLORS.offWhite,
    cursor: "pointer",
    boxShadow: "1.5px 1.5px 0 #000",
  });

  const userId = window.userId;
  fetch(`${API_BASE}/notifications/status?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
      let subscribed = data.subscribed;
      updateButtonText();

      button.onclick = () => {
        const endpoint = `${API_BASE}${subscribed ? "/notifications/unsubscribe" : "/notifications/subscribe"}`;
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        })
          .then(res => res.json())
          .then(() => {
            subscribed = !subscribed;
            updateButtonText();
            showNotificationSuccess(
              subscribed
                ? "✅ You’re now subscribed to notifications!"
                : "🔕 You have unsubscribed from notifications."
            );
          })
          .catch(err => alert("❌ Failed to update notification status: " + err));
      };

      function updateButtonText() {
        button.textContent = subscribed ? "🛑 Stop Notifications" : "✅ Enable Notifications";
      }
    })
    .catch(() => {
      button.textContent = "❌ Failed to load status";
      button.disabled = true;
    });

  popup.append(close, title, desc, button);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
}

function showNotificationSuccess(msg) {
  const existing = document.getElementById("notif-confirm-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "notif-confirm-popup";
  Object.assign(popup.style, {
    position: "fixed",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    background: COLORS.offWhite,
    color: COLORS.primary,
    padding: "18px 24px",
    borderRadius: "14px",
    border: `2px solid ${COLORS.primary}`,
    boxShadow: "1px 2px 0 0 #000",
    fontFamily: FONT.body,
    zIndex: 9999,
    textAlign: "center",
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
    cursor: "pointer",
    fontFamily: FONT.body,
  });

  x.onclick = () => {
    popup.remove();
  };

  popup.appendChild(text);
  popup.appendChild(x);
  document.body.appendChild(popup);
}

export { showNotificationPopup };
