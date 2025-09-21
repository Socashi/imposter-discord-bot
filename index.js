const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const token = process.env.DISCORD_TOKEN;
if (!token || typeof token !== 'string') {
  console.error('❌ DISCORD_TOKEN fehlt oder ist ungültig!');
  process.exit(1);
}

client.once('ready', () => {
  console.log(`✅ Eingeloggt als ${client.user.tag}`);
});

// Datei laden (nur 1x beim Start)
let woerterListe = [];
try {
  const data = fs.readFileSync('woerter.json', 'utf8');
  woerterListe = JSON.parse(data);
  console.log(`📦 ${woerterListe.length} Wörter geladen.`);
} catch (err) {
  console.error('❌ Fehler beim Laden der woerter.json:', err.message);
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content === '!start') {
    if (woerterListe.length === 0) {
      message.reply('❌ Es sind keine Wörter vorhanden!');
      return;
    }

    const zufallsWort = woerterListe[Math.floor(Math.random() * woerterListe.length)];
    message.reply(`🎲 Dein Wort ist: **${zufallsWort}**`);
  }

  if (content === '!ping') {
    message.reply('🏓 Pong!');
  }
});

client.login(token);
