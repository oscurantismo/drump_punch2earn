import { COLORS, FONT, BORDER, ZINDEX } from "./styles.js";
import { updatePunchDisplay } from "./ui.js";

/* ─── TASK CONFIG ─────────────────────────────────────────────────────── */
const TASKS = [
  { id: "follow_x",        title: "Follow us on X",                 reward: 40,  url: "https://x.com/DrumpGame" },
  { id: "like_pinned",     title: "Like our pinned tweet",          reward: 25,  url: "https://twitter.com/DrumpGame/status/1910371569005736401" },
  { id: "retweet_pinned",  title: "Re‑post pinned tweet",           reward: 35,  url: "https://twitter.com/DrumpGame/status/1910371569005736401" },
  { id: "quote_tweet",     title: "Quote‑tweet with #Punch2Earn",   reward: 60,  url: "https://twitter.com/intent/tweet?text=%23Punch2Earn%20I%20just%20joined%20DrumpGame!" },
  { id: "join_channel",    title: "Join our Telegram channel",      reward: 25,  url: "https://t.me/drumpgame" },
  { id: "join_group",      title: "Join the community chat",        reward: 30,  url: "https://t.me/drumpgame" },
  { id: "share_game_tg",   title: "Share the game with a friend",   reward: 50,  url: "https://t.me/share/url?url=https://t.me/Drump_punch_bot&text=Come%20punch%20Drump%20with%20me!" },
  { id: "invite_friend_tg",title: "Invite a friend to the chat",    reward: 100, url: "https://t.me/drumpgame" },
  { id: "twitter_space",   title: "Join our next X Space",          reward: 130, url: "https://x.com/DrumpGame" },
];

/* ─── HELPERS ─────────────────────────────────────────────────────────── */
const LS_PREFIX = "earn_task_done_";
const isDone = (id) => localStorage.getItem(`${LS_PREFIX}${id}`) === "1";
const markDone = (id) => localStorage.setItem(`${LS_PREFIX}${id}`, "1");

function grantReward(pts) {
  if (typeof window.punches !== "number") window.punches = 0;
  window.punches += pts;
  updatePunchDisplay();

  if (window.userId) {
    localStorage.setItem(`score_${window.userId}`, window.punches);
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

/* ─── UI ──────────────────────────────────────────────────────────────── */
export function renderEarnTab() {
  document.getElementById("earn-container")?.remove();

  const wrap = document.createElement("div");
  wrap.id = "earn-container";
  Object.assign(wrap.style, {
    position: "fixed",
    top: "100px",
    left: 0,
    right: 0,
    bottom: 0,
    height: "calc(100vh - 100px)",
    overflowY: "auto",
    padding: "24px 16px 140px",
    boxSizing: "border-box",
    background: COLORS.offWhite,
    fontFamily: FONT.body,
    color: COLORS.primary,
    zIndex: ZINDEX.punchBar,
  });

  const h = document.createElement("h2");
  h.textContent = "🎯 Tasks & Rewards";
  Object.assign(h.style, {
    margin: "0 0 6px",
    fontFamily: FONT.heading,
    color: COLORS.primary,
  });
  wrap.appendChild(h);

  const sub = document.createElement("p");
  sub.textContent = "Complete social actions to earn extra 🥾 punches.";
  Object.assign(sub.style, { margin: "0 0 20px", fontSize: "14px", color: COLORS.deepRed });
  wrap.appendChild(sub);

  const style = document.createElement("style");
  style.textContent = `
    .loader {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid ${COLORS.primary};
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
      vertical-align: middle;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  TASKS.forEach((t) => {
    const card = document.createElement("div");
    Object.assign(card.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 18px",
      marginBottom: "12px",
      borderRadius: BORDER.radius,
      border: BORDER.style,
      background: COLORS.badgeBg,
      color: COLORS.primary,
    });

    const title = document.createElement("span");
    title.textContent = t.title;
    title.style.maxWidth = "60%";
    card.appendChild(title);

    const btn = document.createElement("button");
    const done = isDone(t.id);
    Object.assign(btn.style, {
      fontFamily: FONT.body,
      fontSize: "14px",
      fontWeight: 600,
      padding: "8px 12px",
      border: "none",
      borderRadius: BORDER.radius,
      minWidth: "90px",
    });

    if (done) {
      btn.textContent = "✅ Done";
      btn.disabled = true;
      btn.style.background = COLORS.offWhite;
      btn.style.color = COLORS.deepRed;
      btn.style.cursor = "default";
    } else {
      let resumeListener;

      const showClaimButton = () => {
        btn.textContent = `🎁 Claim +${t.reward} 🥾`;
        btn.disabled = false;
        btn.style.background = COLORS.primary;
        btn.style.color = COLORS.textLight;
        btn.style.cursor = "pointer";

        btn.onclick = () => {
          markDone(t.id);
          grantReward(t.reward);

          if (window.userId) {
            fetch("https://drumpleaderboard-production.up.railway.app/tasks/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: window.userId,
                task_id: t.id,
              }),
            }).catch(() => {});
          }

          btn.textContent = "✅ Done";
          btn.disabled = true;
          btn.style.background = COLORS.offWhite;
          btn.style.color = COLORS.deepRed;
          btn.style.cursor = "default";
          Telegram.WebApp.offEvent('resume', resumeListener);
        };
      };

      const startConfirmationDelay = () => {
        btn.disabled = true;
        btn.innerHTML = `<span class="loader"></span> Confirming...`;
        btn.style.background = COLORS.badgeBg;
        btn.style.color = COLORS.primary;
        btn.style.cursor = "wait";

        setTimeout(showClaimButton, 15000);
      };

      btn.textContent = `+${t.reward} 🥾`;
      btn.style.background = COLORS.primary;
      btn.style.color = COLORS.textLight;
      btn.style.cursor = "pointer";

      btn.onclick = () => {
        if (t.url.startsWith("https://t.me/")) {
          Telegram.WebApp.openTelegramLink(t.url);
        } else {
          window.open(t.url, "_blank");
        }

        btn.textContent = "Waiting to return...";
        btn.disabled = true;
        btn.style.cursor = "wait";

        resumeListener = () => startConfirmationDelay();
        Telegram.WebApp.onEvent('resume', resumeListener);
      };
    }

    card.appendChild(btn);
    wrap.appendChild(card);
  });

  document.body.appendChild(wrap);
}
