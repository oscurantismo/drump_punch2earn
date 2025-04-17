/* earn_tab.js
 * “Earn” tasks screen for Drump | Punch2Earn
 * --------------------------------------------------
 * Renders a list of social‑media actions (X/Twitter & Telegram)
 * that grant 20 – 130 🥾 punches when completed.
 * --------------------------------------------------
 */
import { COLORS, FONT, BORDER } from "./styles.js";
import { updatePunchDisplay } from "./ui.js";

/** --- CONFIG ------------------------------------------------------------- **/
const TASKS = [
  // --- Twitter ------------------------------------------------------------
  {
    id: "follow_x",
    title: "Follow us on X",
    reward: 40,
    url: "https://twitter.com/DrumpPunch2Earn",   // ← your handle
  },
  {
    id: "like_pinned",
    title: "Like our pinned tweet",
    reward: 25,
    url: "https://twitter.com/DrumpPunch2Earn/status/0000000000000000000",
  },
  {
    id: "retweet_pinned",
    title: "Re‑post (retweet) pinned tweet",
    reward: 35,
    url: "https://twitter.com/DrumpPunch2Earn/status/0000000000000000000",
  },
  {
    id: "quote_tweet",
    title: "Quote‑tweet with #Punch2Earn",
    reward: 60,
    url: "https://twitter.com/intent/tweet?text=%23Punch2Earn%20I%20just%20joined%20Drump%20%7C%20Punch2Earn!",
  },
  // --- Telegram -----------------------------------------------------------
  {
    id: "join_channel",
    title: "Join our Telegram channel",
    reward: 25,
    url: "https://t.me/DrumpPunch2Earn",
  },
  {
    id: "join_group",
    title: "Join the community chat",
    reward: 30,
    url: "https://t.me/DrumpPunch2Earn_Chat",
  },
  {
    id: "share_game_tg",
    title: "Share the game with a Telegram friend",
    reward: 50,
    url: `https://t.me/share/url?url=https://t.me/Drump_punch_bot&text=Come%20punch%20Drump%20with%20me!`,
  },
  // --- Advanced / high value ---------------------------------------------
  {
    id: "invite_friend_tg",
    title: "Invite a friend to the chat",
    reward: 100,
    url: "https://t.me/DrumpPunch2Earn_Chat",
  },
  {
    id: "twitter_space",
    title: "Join our next Twitter Space",
    reward: 130,
    url: "https://twitter.com/DrumpPunch2Earn",   // announce link
  },
];

/** --- HELPERS ----------------------------------------------------------- **/
const LS_PREFIX = "earn_task_done_";

function taskDone(id) {
  return localStorage.getItem(`${LS_PREFIX}${id}`) === "1";
}

function markTaskDone(id) {
  localStorage.setItem(`${LS_PREFIX}${id}`, "1");
}

/** Add punches, sync with backend, refresh UI */
function grantReward(reward) {
  if (typeof window.punches !== "number") window.punches = 0;
  window.punches += reward;
  updatePunchDisplay();

  // Persist locally
  if (window.userId) {
    localStorage.setItem(`score_${window.userId}`, window.punches);
  }

  // Fire‑and‑forget update to backend
  if (window.userId && window.storedUsername) {
    fetch("https://drumpleaderboard-production.up.railway.app/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: window.storedUsername,
        user_id: window.userId,
        score: window.punches,
      }),
    }).catch(() => {});
  }
}

/** --- UI ---------------------------------------------------------------- **/
export function renderEarnTab() {
  // Remove previous instance
  const old = document.getElementById("earn-container");
  if (old) old.remove();

  // Main wrapper
  const container = document.createElement("div");
  container.id = "earn-container";
  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    width: "100vw",
    height: "100vh",
    overflowY: "auto",
    background: "#041227",                      // dark naval backdrop
    fontFamily: FONT.body,
    color: COLORS.textLight,
    zIndex: 2000,
    display: "flex",
    flexDirection: "column",
  });

  /* --- Header --- */
  const header = document.createElement("h1");
  header.innerText = "Tasks & Rewards";
  Object.assign(header.style, {
    margin: "24px auto 8px",
    fontFamily: FONT.heading,
    fontSize: "28px",
    color: COLORS.offWhite,
  });
  container.appendChild(header);

  const sub = document.createElement("p");
  sub.innerText = "Complete actions – earn 🥾 punches";
  Object.assign(sub.style, {
    margin: "0 auto 24px",
    fontSize: "15px",
    opacity: 0.8,
  });
  container.appendChild(sub);

  /* --- Task cards --- */
  TASKS.forEach((task) => {
    const card = document.createElement("div");
    Object.assign(card.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      margin: "8px 16px",
      padding: "14px 18px",
      borderRadius: BORDER.radius,
      border: BORDER.style,
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(3px)",
    });

    // Title
    const title = document.createElement("span");
    title.innerText = task.title;
    Object.assign(title.style, {
      fontSize: "15px",
      lineHeight: "1.2",
      maxWidth: "60%",
    });
    card.appendChild(title);

    // Action / status button
    const btn = document.createElement("button");
    const done = taskDone(task.id);
    btn.innerText = done ? "✅  Done" : `+${task.reward} 🥾`;
    Object.assign(btn.style, {
      fontFamily: FONT.body,
      fontWeight: 600,
      fontSize: "14px",
      padding: "8px 12px",
      borderRadius: BORDER.radius,
      border: "none",
      cursor: done ? "default" : "pointer",
      background: done ? COLORS.badgeBg : COLORS.primary,
      color: done ? COLORS.deepRed : COLORS.textLight,
      minWidth: "90px",
      textAlign: "center",
    });

    if (!done) {
      btn.onclick = () => {
        // Open external link (Telegram / X)
        if (task.url) {
          if (task.url.startsWith("https://t.me/")) {
            Telegram.WebApp.openTelegramLink(task.url);
          } else {
            window.open(task.url, "_blank");
          }
        }

        // Confirmation popup
        Telegram.WebApp.showPopup(
          {
            title: "Reward collected",
            message: `+${task.reward} punches added!`,
            buttons: [{ id: "ok", text: "OK", type: "close" }],
          },
          () => {}
        );

        // Mark & reward
        markTaskDone(task.id);
        grantReward(task.reward);

        // Visually switch to done state
        btn.innerText = "✅  Done";
        btn.style.background = COLORS.badgeBg;
        btn.style.color = COLORS.deepRed;
        btn.style.cursor = "default";
      };
    }

    card.appendChild(btn);
    container.appendChild(card);
  });

  document.body.appendChild(container);
}

export { renderEarnTab };
