// ─────────────────────────────────────────
// FLOAT® — /newsletter command
// Upload an image and post it in an embed
// Only usable by server admins
// ─────────────────────────────────────────

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('newsletter')
  .setDescription('Post a FLOAT® newsletter image to the newsletter channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addAttachmentOption((option) =>
    option
      .setName('image')
      .setDescription('The newsletter image to post')
      .setRequired(true)
  );

export async function execute(interaction) {
  const image = interaction.options.getAttachment('image');

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
    .setImage(image.url);

  await channel.send({ embeds: [embed] });

  await interaction.reply({
    content: `✅ Newsletter posted to <#${channelId}>`,
    ephemeral: true,
  });
}
