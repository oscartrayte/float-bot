// ─────────────────────────────────────────
// FLOAT® — /welcome command
// Sends the full welcome sequence to the
// welcome channel. Restricted to Junglist only.
// ─────────────────────────────────────────

import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const JUNGLIST_ID = '985921013432872960';
const WELCOME_CHANNEL_ID = '1485237353462235279';

export const data = new SlashCommandBuilder()
  .setName('welcome')
  .setDescription('Post the FLOAT® welcome sequence to the welcome channel');

export async function execute(interaction) {
  // Restrict to Junglist only
  if (interaction.user.id !== JUNGLIST_ID) {
    await interaction.reply({
      content: '❌ Only Junglist can use this command.',
      ephemeral: true,
    });
    return;
  }

  const channel = interaction.guild.channels.cache.get(WELCOME_CHANNEL_ID);

  if (!channel) {
    await interaction.reply({
      content: '❌ Welcome channel not found.',
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({ content: '✅ Sending welcome sequence...', ephemeral: true });

  // ── Helper: send image embed ──────────────
  async function sendImage(filename) {
    const attachment = new AttachmentBuilder(
      join(__dirname, `../assets/${filename}`),
      { name: filename }
    );
    const embed = new EmbedBuilder()
      .setImage(`attachment://${filename}`);
    await channel.send({ embeds: [embed], files: [attachment] });
  }

  // ── EMBED 1 — Welcome ─────────────────────
  await sendImage('embed1.webp');
  await channel.send(
    `You've just entered **FLOAT®** — a virtual space inspired by the golden age of 16-bit gaming. The pixels are warm, the music's on, and the nostalgia is real. Make yourself at home!`
  );

  // ── EMBED 2 — About ───────────────────────
  await sendImage('embed2.webp');
  await channel.send(
    `**FLOAT®** was created in 2024 by <@${JUNGLIST_ID}>, a web developer with a deep love for the SNES era and everything that came with it. After keeping it close for a while, it felt too good not to share — so in 2026, FLOAT® was republished and opened up to the world. Consider this your invitation.\n\nThe inspiration came from months of restless internet browsing — late nights falling down rabbit holes, searching for something that felt genuinely nostalgic rather than just retro-flavoured. Nothing quite hit the mark. So Junglist built it instead. The biggest spark was **Zombies Ate My Neighbours** — that perfect, chaotic slice of early 90s SNES culture that somehow captured everything about the era in one game. The colour palette, the humour, the energy. FLOAT® is what happens when that feeling refuses to leave you alone.`
  );

  // ── EMBED 3 — Team ────────────────────────
  await sendImage('embed3.webp');

  const dmButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('💬 DM Junglist')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/users/${JUNGLIST_ID}`)
  );

  await channel.send({
    content: `Right now, **FLOAT®** is a solo operation — built, designed, and kept alive entirely by Junglist. One person, one vision, no committee. That said, good things grow. I'm always keeping an eye out for enthusiastic designers and vibe-setters who genuinely get what FLOAT® is about — people who feel it, not just understand it. If that sounds like you, drop me a DM with your work.`,
    components: [dmButton],
  });

  // ── EMBED 4 — Support ─────────────────────
  await sendImage('embed4.webp');
  await channel.send(
    `**FLOAT®** exists for one reason — to make people feel something. There's no agenda here, no monetisation strategy, no hustle. This was built because nostalgia deserves a home on the internet, and that's reason enough.\n\nThat said, keeping the lights on has a small cost. If you've enjoyed your time here and want to chip in towards running costs, you're more than welcome to — but please know it is genuinely never expected. You can support the project at **revolut.me/oscarcash**. Every little helps, and it's appreciated more than you know.`
  );
}
