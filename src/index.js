// ─────────────────────────────────────────
// FLOAT® Discord Bot
// NES nostalgia community bot
// ─────────────────────────────────────────

import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { handleNewMember } from './events/guildMemberAdd.js';
import { handleInteraction } from './interactions/index.js';
import { startRadio } from './radio.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// ── Ready ──────────────────────────────
client.once(Events.ClientReady, async (c) => {
  console.log(`✅ FLOAT® Bot is online. Logged in as ${c.user.tag}`);

  // Join voice channel and start streaming
  const guild = c.guilds.cache.get(process.env.GUILD_ID);
  if (guild) {
    await startRadio(guild);
  } else {
    console.warn('⚠️  Guild not found. Check GUILD_ID in your .env');
  }
});

// ── New member joins ───────────────────
client.on(Events.GuildMemberAdd, handleNewMember);

// ── Slash commands ─────────────────────
client.on(Events.InteractionCreate, handleInteraction);

// ── Login ──────────────────────────────
client.login(process.env.DISCORD_TOKEN);
