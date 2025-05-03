import os
import logging
import requests
from telegram import (
    Update,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo
)
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    ContextTypes,
    CallbackQueryHandler
)

# === Config ===
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEB_APP_URL = "https://oscurantismo.github.io/drump_punch2earn/"

# === Logging ===
logging.basicConfig(format="%(asctime)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

# === /start ===
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    referral_id = None

    # Check for referral ID in the /start command
    if context.args and len(context.args) > 0 and context.args[0].startswith("referral_"):
        referral_id = context.args[0].replace("referral_", "")
        logger.info(f"🎁 {user.username} ({user.id}) joined via referral from {referral_id}")

    # Register the user with full name and referral ID if available
    try:
        requests.post("https://drumpleaderboard-production.up.railway.app/register", json={
            "user_id": str(user.id),
            "username": user.username or user.first_name or user.last_name or "Anonymous",
            "first_name": user.first_name or "",
            "last_name": user.last_name or "",
            "referrer_id": referral_id
        })
    except Exception as e:
        logger.error(f"❌ Failed to register user: {e}")

    logger.info(f"👋 /start triggered by {user.username} ({user.id})")

    # Show main options menu
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🕹 Play Drump | Punch2Earn", web_app=WebAppInfo(url=WEB_APP_URL))],
        [InlineKeyboardButton("📊 Check Leaderboard", callback_data="leaderboard")],
        [InlineKeyboardButton("📢 Join our official news channel", url="https://t.me/drumpofficial")],
        [InlineKeyboardButton("🤙 Join our Telegram group", url="https://t.me/drumpgame")],
        [InlineKeyboardButton("ℹ️ Learn more", callback_data="info")]
    ])

    await update.message.reply_text(
        text="Welcome to Drump | Punch2Earn! Choose an option below:",
        reply_markup=keyboard
    )

# === Live leaderboard ===
async def send_leaderboard(chat_id, context: ContextTypes.DEFAULT_TYPE, user_id: str):
    try:
        res = requests.get("https://drumpleaderboard-production.up.railway.app/leaderboard")
        scores = res.json()
    except Exception as e:
        await context.bot.send_message(chat_id, "❌ Failed to load leaderboard. Try again later.")
        return

    if not scores:
        await context.bot.send_message(chat_id, "No scores yet.")
        return

    medals = ["🥇", "🥈", "🥉"]
    msg = "🏆 <b>Drump | Punch2Earn Leaderboard</b>\n\n"

    top_10 = scores[:10]
    user_entry = None
    user_rank = None

    for i, entry in enumerate(scores):
        if str(entry.get("user_id")) == str(user_id):
            user_entry = entry
            user_rank = i + 1
            break

    for i, entry in enumerate(top_10):
        medal = medals[i] if i < 3 else f"{i+1}."
        name = entry['username']
        score = entry['score']
        msg += f"{medal} {name} — {score} punches\n"

    if user_entry and user_rank > 10:
        msg += "\n🔻 <b>Your Rank</b>\n"
        msg += f"👉 {user_rank}. <b>{user_entry['username']}</b> — {user_entry['score']} punches\n"

        top_10_score = top_10[-1]['score']
        if user_entry['score'] < top_10_score:
            diff = top_10_score - user_entry['score'] + 1
            msg += f"⚡️ <i>You need just {diff} more punch{'es' if diff != 1 else ''} to break into the top 10!</i>\n"

    msg += "\n🔍 <i>See more in Drump | Punch2Earn</i>"

    await context.bot.send_message(chat_id, msg, parse_mode="HTML")

# === Button callbacks ===
async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user = query.from_user

    if query.data == "leaderboard":
        await send_leaderboard(query.message.chat_id, context, str(user.id))

    elif query.data == "info":
        await query.message.reply_text(
            "ℹ️ Drump | Punch2Earn is a Telegram Mini App where you punch Drump to climb the leaderboard.\n\n"
            "🏗 Upcoming: Airdrops, upgrades, and seasonal events."
        )

# === Error Logger ===
async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE):
    logger.error("❌ Exception occurred:", exc_info=context.error)
    if update:
        logger.warning(f"⚠️ Update that caused error: {update}")

# === Entry Point ===
if __name__ == "__main__":
    if not BOT_TOKEN:
        print("❌ BOT_TOKEN not set. Set it as an environment variable.")
        exit()

    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_callback, pattern="^(leaderboard|info)$"))
    app.add_error_handler(error_handler)

    print("🚀 Drump | Punch2Earn Mini App bot is running...")
    app.run_polling()
