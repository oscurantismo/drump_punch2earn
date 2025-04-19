import { updatePunchDisplay } from "./ui.js";

const LS_PREFIX = "earn_task_done_";
const CONFIRM_KEY = "confirm_task_id";

const DAILY_TASKS = [
  { id: "visit_3x", title: "Visit the game 3 times", reward: 20, url: "" },
  { id: "interact_x", title: "Like, retweet, or comment on X", reward: 25, url: "https://twitter.com/DrumpGame" },
  { id: "send_telegram", title: "Send a message or sticker in our Telegram group", reward: 30, url: "https://t.me/drumpgame" }
];

const SOCIAL_TASKS = [
  { id: "follow_x", title: "Follow us on X", reward: 40, url: "https://x.com/DrumpGame" },
  { id: "like_pinned", title: "Like our pinned tweet", reward: 25, url: "https://twitter.com/DrumpGame/status/1910371569005736401" },
  { id: "retweet_pinned", title: "Re‑post pinned tweet", reward: 35, url: "https://twitter.com/DrumpGame/status/1910371569005736401" },
  { id: "quote_tweet", title: "Quote‑tweet with #Punch2Earn", reward: 60, url: "https://twitter.com/intent/tweet?text=%23Punch2Earn%20I%20just%20joined%20DrumpGame!" },
  { id: "join_channel", title: "Join our Telegram channel", reward: 25, url: "https://t.me/drumpgame" },
  { id: "join_group", title: "Join the community chat", reward: 30, url: "https://t.me/drumpgame" },
  { id: "share_game_tg", title: "Share the game with a friend", reward: 50, url: "https://t.me/share/url?url=https://t.me/Drump_punch_bot&text=Come%20punch%20Drump%20with%20me!" },
  { id: "invite_friend_tg", title: "Invite a friend to the chat", reward: 100, url: "https://t.me/drumpgame" },
  { id: "twitter_space", title: "Join our next X Space", reward: 130, url: "https://x.com/DrumpGame" }
];

export function getIncompleteTaskCount() {
  const allTasks = [...DAILY_TASKS, ...SOCIAL_TASKS];
  return allTasks.filter(t => !localStorage.getItem(`${LS_PREFIX}${t.id}`)).length;
}

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

export function renderEarnTab() {
  document.getElementById("earn-container")?.remove();

  const wrap = document.createElement("div");
  wrap.id = "earn-container";
  wrap.className = "earn-container";

  const content = document.createElement("div");
  content.id = "earn-content";
  wrap.appendChild(content);

  const taskToConfirm = localStorage.getItem(CONFIRM_KEY);

  function renderSection(titleText, taskList) {
    const section = document.createElement("div");

    const sectionTitle = document.createElement("div");
    sectionTitle.textContent = titleText;
    sectionTitle.className = "task-section-heading";
    section.appendChild(sectionTitle);

    taskList.forEach((t) => {
      const card = document.createElement("div");
      card.className = "task-card";

      const title = document.createElement("span");
      title.textContent = t.title;
      title.style.maxWidth = "55%";
      card.appendChild(title);

      const rewardWrap = document.createElement("div");
      rewardWrap.className = "punch-reward";

      const punchIcon = document.createElement("img");
      punchIcon.src = "drump-images/punch.svg";
      punchIcon.alt = "punch";
      rewardWrap.appendChild(punchIcon);

      const punchCount = document.createElement("span");
      punchCount.textContent = t.reward;
      rewardWrap.appendChild(punchCount);

      const btn = document.createElement("button");
      btn.className = "task-btn";

      const done = isDone(t.id);

      const showClaimButton = () => {
        btn.textContent = "CLAIM";
        btn.disabled = false;
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

          btn.textContent = "DONE";
          btn.disabled = true;
          localStorage.removeItem(CONFIRM_KEY);
        };
      };

      const startConfirmationDelay = () => {
        btn.innerHTML = `<span class="loader"></span> Confirming...`;
        btn.disabled = true;
        setTimeout(showClaimButton, 15000);
      };

      if (done) {
        btn.textContent = "DONE";
        btn.disabled = true;
      } else if (taskToConfirm === t.id) {
        startConfirmationDelay();
      } else {
        btn.textContent = "GET";
        btn.onclick = () => {
          if (t.url?.startsWith("https://t.me/")) {
            Telegram.WebApp.openTelegramLink(t.url);
          } else if (t.url) {
            Telegram.WebApp.openLink(t.url);
          }
          localStorage.setItem(CONFIRM_KEY, t.id);
          location.reload();
        };
      }

      rewardWrap.appendChild(btn);
      card.appendChild(rewardWrap);
      section.appendChild(card);
    });

    content.appendChild(section);
  }

  renderSection("🗓 Daily Quests", DAILY_TASKS);
  renderSection("🌐 Social Tasks", SOCIAL_TASKS);

  document.body.appendChild(wrap);
}
