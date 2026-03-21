// ─────────────────────────────────────────
// FLOAT® — New Member Welcome Event
// ─────────────────────────────────────────

import { AttachmentBuilder } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function handleNewMember(member) {
  const channelId = process.env.WELCOME_CHANNEL_ID;
  const channel = member.guild.channels.cache.get(channelId);

  if (!channel) {
    console.warn('⚠️  Welcome channel not found. Check WELCOME_CHANNEL_ID in your .env');
    return;
  }

  const message =
    `Hey ${member}, welcome aboard! We're thrilled to have you here at **FLOAT®**, the Virtual Nostalgia experience. ` +
    `Grab a drink, make a splash, and be sure to check out our <#1484604522373451816> and <#1484604686282657813> channels to read our latest! ` +
    `Have a great time, and don't forget to Float! 🕹️`;

  const banner = new AttachmentBuilder(
    join(__dirname, '../assets/welcome-banner.png'),
    { name: 'welcome-banner.png' }
  );

  await channel.send({ content: message, files: [banner] });
}
