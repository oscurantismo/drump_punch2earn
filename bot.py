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

    # Register the user with the referral ID if available
    try:
        requests.post("https://drumpleaderboard-production.up.railway.app/register", json={
            "user_id": str(user.id),
            "username": user.username or "Anonymous",
            "referrer_id": referral_id
        })
    except Exception as e:
        logger.error(f"❌ Failed to register user: {e}")

    logger.info(f"👋 /start triggered by {user.username} ({user.id})")

    # Show main options menu
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🕹 Play Drump | Punch2Earn", web_app=WebAppInfo(url=WEB_APP_URL))],
        [InlineKeyboardButton("📊 Check Leaderboard", callback_data="leaderboard")],
        [InlineKeyboardButton("ℹ️ Info", callback_data="info")]
    ])

    await update.message.reply_text(
        text="Welcome to Drump | Punch2Earn! Choose an option below:",
        reply_markup=keyboard
    )

# === Live leaderboard ===
async def send_custom_leaderboard(chat_id, context: ContextTypes.DEFAULT_TYPE, user_id: str):
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
    msg = "🏆 <b>Top 10 Punchers</b>\n\n"
    for i, entry in enumerate(scores[:10]):
        medal = medals[i] if i < 3 else f"{i+1}."
        name = entry['username']
        score = entry['score']
        msg += f"{medal} {name} — {score} punches\n"

    msg += "\n🔍 <i>See more in Drump | Punch2Earn</i>"

    await context.bot.send_message(chat_id, msg, parse_mode="HTML")

# === Button callbacks ===
async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user = query.from_user

    if query.data == "leaderboard":
        await send_custom_leaderboard(query.message.chat_id, context, str(user.id))

            if not scores:
                await query.message.reply_text("No high scores yet.")
                return

            msg = "🏆 <b>Telegram Leaderboard</b>\n\n"
            for entry in scores:
                rank = entry.position + 1
                username = entry.user.full_name or "Anonymous"
                score = entry.score
                marker = "👉 " if entry.user.id == user.id else ""
                msg += f"{marker}{rank}. {username} — {score} punches\n"

            await query.message.reply_text(msg, parse_mode="HTML")
        except Exception as e:
            logger.error(f"❌ Failed to load Telegram leaderboard: {e}")
            await query.message.reply_text("❌ Failed to load Telegram leaderboard.")
    
    elif query.data == "info":
        await query.message.reply_text(
            "ℹ️ Drump | Punch2Earn is a Telegram Mini App where you throw shoes at Drump and climb the leaderboard.\n\n" +
            "🏗 Upcoming: Airdrops, upgrades, and seasonal events."
        )
    elif query.data == "profile":
        await profile(update, context)

async def profile(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    logger.info(f"📄 /profile requested by {user.username} ({user.id})")
    
    try:
        res = requests.get(f"https://drumpleaderboard-production.up.railway.app/profile?user_id={user.id}")
        if res.status_code != 200:
            raise Exception(res.json().get("error", "Unknown error"))
        data = res.json()

        msg = (
            f"📄 <b>{data.get('username', 'Anonymous')}'s Profile</b>\n\n"
            f"🥇 <b>Punches:</b> {data.get('punches', 0)}\n"
            f"🔗 <b>Referral Link:</b> <a href='https://t.me/Drump_punch_bot?start=referral_{user.id}'>Invite Friends</a>"
        )
        await update.message.reply_text(msg, parse_mode="HTML", disable_web_page_preview=True)

    except Exception as e:
        logger.error(f"❌ Failed to fetch profile: {e}")
        await update.message.reply_text("❌ Failed to load your profile. Please try again later.")


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
    app.add_handler(CommandHandler("profile", profile))
    app.add_handler(CallbackQueryHandler(button_callback, pattern="^(leaderboard|info|profile)$"))
    app.add_error_handler(error_handler)
    app.add_handler(CommandHandler("start", start))


    print("🚀 Drump | Punch2Earn Mini App bot is running...")
    app.run_polling()
