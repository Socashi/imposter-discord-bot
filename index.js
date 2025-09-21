require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

// Discord Client initialisieren
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"], // wichtig, damit DMs funktionieren
});

// Wenn Bot gestartet ist
client.once("clientReady", () => {
  console.log(`✅ Eingeloggt als ${client.user.tag}`);
});

// --- Spiel-Setup ---
let players = [];
let gameStarted = false;

// Listener für Nachrichten
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  // --- Testkommando ---
  if (msg.content === "!ping") {
    msg.reply("Pong! ✅");
    return;
  }

  // --- Spieler tritt bei ---
  if (msg.content === "!join") {
    if (gameStarted) {
      msg.reply("❌ Das Spiel läuft schon!");
      return;
    }
    if (!players.includes(msg.author.id)) {
      players.push(msg.author.id);
      msg.reply(`Du bist dem Spiel beigetreten! 🎮 Aktuelle Spieler: ${players.length}`);
    } else {
      msg.reply("❌ Du bist schon dabei!");
    }
    return;
  }

  // --- Alle Spieler anzeigen ---
  if (msg.content === "!players") {
    if (players.length === 0) {
      msg.reply("Noch keine Spieler dabei.");
    } else {
      const mentions = players.map(id => `<@${id}>`).join(", ");
      msg.reply(`👥 Aktuelle Spieler: ${mentions}`);
    }
    return;
  }

  // --- Reset ---
  if (msg.content === "!reset") {
    players = [];
    gameStarted = false;
    msg.reply("🔄 Alle Spieler wurden entfernt.");
    return;
  }

  // --- Spiel starten ---
  if (msg.content === "!start") {
    if (players.length < 3) {
      msg.reply("❌ Mindestens 3 Spieler sind nötig, um zu starten!");
      return;
    }
    if (gameStarted) {
      msg.reply("❌ Das Spiel läuft bereits!");
      return;
    }

    gameStarted = true;

    // Geheimwort für diese Runde
    const secretWord = "Apfel"; // später: zufällig aus einer Liste
    // Zufällig einen Imposter auswählen
    const imposterIndex = Math.floor(Math.random() * players.length);
    const imposterId = players[imposterIndex];

    msg.channel.send("🎲 Das Spiel startet! Jeder bekommt eine DM...");

    // Allen Spielern Nachricht schicken
    for (let id of players) {
      try {
        const user = await client.users.fetch(id);
        if (id === imposterId) {
          await user.send("❓ Du bist der **Imposter**! Versuche unauffällig zu bleiben.");
        } else {
          await user.send(`🔑 Dein geheimes Wort ist: **${secretWord}**`);
        }
      } catch (err) {
        console.error(`❌ Konnte Spieler ${id} keine DM senden:`, err);
      }
    }
    return;
  }
});

// Token aus .env
const token = process.env.DISCORD_TOKEN;
client.login(token);
