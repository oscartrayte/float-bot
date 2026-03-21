// ─────────────────────────────────────────
// FLOAT® — /newsletter command
// Posts a formatted newsletter update
// Only usable by server admins
// ─────────────────────────────────────────

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('newsletter')
  .setDescription('Post a FLOAT® newsletter update to the newsletter channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName('issue')
      .setDescription('Issue number or name, e.g. "Issue 01" or "March 2026"')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('headline')
      .setDescription('The main headline or intro line for this issue')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('body')
      .setDescription('The main body content of the newsletter (use \\n for line breaks)')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('section_title')
      .setDescription('Optional: title for an extra section (e.g. "This Week in NES")')
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName('section_body')
      .setDescription('Optional: content for the extra section')
      .setRequired(false)
  );

export async function execute(interaction) {
  const issue = interaction.options.getString('issue');
  const headline = interaction.options.getString('headline');
  const body = interaction.options.getString('body').replace(/\\n/g, '\n');
  const sectionTitle = interaction.options.getString('section_title');
  const sectionBody = interaction.options.getString('section_body');

  const channelId = process.env.NEWSLETTER_CHANNEL_ID;
  const channel = interaction.guild.channels.cache.get(channelId);

  if (!channel) {
    await interaction.reply({
      content: '⚠️ Newsletter channel not found. Check `NEWSLETTER_CHANNEL_ID` in your `.env` file.',
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xE8A020)
    .setTitle(`📺 FLOAT® · ${issue}`)
    .setDescription(`*${headline}*\n\n─────────────────────────\n\n${body}`)
    .setFooter({ text: 'FLOAT® · NES nostalgia community' })
    .setTimestamp();

  if (sectionTitle && sectionBody) {
    embed.addFields({ name: `🕹️ ${sectionTitle}`, value: sectionBody });
  }

  await channel.send({ embeds: [embed] });

  await interaction.reply({
    content: `✅ Newsletter posted to <#${channelId}>`,
    ephemeral: true,
  });
}
