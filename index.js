require("dotenv").config();
const { Telegraf } = require("telegraf");
const path = require("path");
const { loadCommands } = require("./utils/commandLoader");
const { loadEvents } = require("./utils/eventLoader");
const { readDb } = require("./utils/db");
const { isChatAdmin } = require("./utils/permissions");

const PREFIX = process.env.PREFIX || "/";
const bot = new Telegraf(process.env.BOT_TOKEN);
const commandsDir = path.join(__dirname, "commands");
const eventsDir = path.join(__dirname, "events");

let commands = loadCommands(commandsDir);
let events = loadEvents(eventsDir);

// Commande owner cachée pour recharger toutes les commandes sans redéployer
const OWNER_ID = process.env.OWNER_ID;

function dispatchEvents(ctx, type) {
  for (const evt of events) {
    if (evt.config.type === type || evt.config.type === "any") {
      Promise.resolve(evt.run(ctx)).catch((err) =>
        console.error(`[event:${evt.config.name}] Erreur :`, err)
      );
    }
  }
}

bot.on("new_chat_members", (ctx) => dispatchEvents(ctx, "new_chat_members"));
bot.on("left_chat_member", (ctx) => dispatchEvents(ctx, "left_chat_member"));

bot.on("text", async (ctx) => {
  dispatchEvents(ctx, "text");

  const text = ctx.message.text.trim();
  if (!text.startsWith(PREFIX)) return;

  const args = text.slice(PREFIX.length).split(/\s+/);
  const commandName = args.shift().toLowerCase();

  if (commandName === "install" && String(ctx.from.id) === OWNER_ID) {
    commands = loadCommands(commandsDir);
    events = loadEvents(eventsDir);
    return ctx.reply("🍓━━━━━━━━🍓\nCommandes et events rechargés avec succès.\n🍓━━━━━━━━🍓");
  }

  const cmd = commands.get(commandName);
  if (!cmd) return;

  if (cmd.config.ownerOnly && String(ctx.from.id) !== OWNER_ID) {
    return ctx.reply("⛔ Cette commande est réservée au propriétaire du bot.");
  }

  if (ctx.chat.type !== "private" && commandName !== "adminonly") {
    const db = readDb();
    if (db.adminOnly[String(ctx.chat.id)]) {
      const admin = await isChatAdmin(ctx);
      if (!admin) return; // silencieux pour éviter le spam en mode restreint
    }
  }

  try {
    await cmd.run(ctx, { args, commands });
  } catch (err) {
    console.error(`[${commandName}] Erreur :`, err);
    ctx.reply("❌ Une erreur est survenue pendant l'exécution de la commande.");
  }
});

bot.launch().then(() => console.log("Bot Telegram démarré."));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
