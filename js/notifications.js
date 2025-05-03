import { COLORS, FONT } from "./styles.js";

const API_BASE = "https://drumpleaderboard-production.up.railway.app";

function showNotificationPopup() {
  const existing = document.getElementById("notification-popup");
  if (existing) return;

  const popup = document.createElement("div");
  popup.id = "notification-popup";
  Object.assign(popup.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#FFF2C5",
    border: "2px solid #000",
    borderRadius: "16px",
    padding: "20px",
    width: "90%",
    maxWidth: "360px",
    fontFamily: "'Negrita Pro', sans-serif",
    zIndex: 3000,
    boxShadow: "2px 2px 0 #000",
    textAlign: "center",
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
  close.onclick = () => popup.remove();

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
    background: "#2a3493",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "1.5px 1.5px 0 #000",
  });

  const userId = window.userId;
  fetch(`${API_BASE}/status?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
      const subscribed = data.subscribed;
      button.textContent = subscribed ? "🔝 Stop Notifications" : "✅ Enable Notifications";

      button.onclick = () => {
        const endpoint = subscribed ? "/unsubscribe" : "/subscribe";
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        })
          .then(res => res.json())
          .then(() => {
            popup.remove();
            showNotificationSuccess(
              subscribed
                ? "🔕 You have unsubscribed from notifications."
                : "✅ You’re now subscribed to notifications!"
            );
          })
          .catch(err => alert("❌ Failed to update notification status: " + err));
      };
    })
    .catch(() => {
      button.textContent = "❌ Failed to load status";
      button.disabled = true;
    });

  popup.append(close, title, desc, button);
  document.body.appendChild(popup);
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
    boxShadow: "0 0 8px rgba(0,0,0,0.3)",
    fontFamily: FONT.body,
    zIndex: "10000",
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

  x.onclick = () => {
    popup.remove();
    document.getElementById("notification-popup")?.remove();
  };

  popup.appendChild(text);
  popup.appendChild(x);
  document.body.appendChild(popup);
}

export { showNotificationPopup };
