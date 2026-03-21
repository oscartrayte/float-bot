// ─────────────────────────────────────────
// FLOAT® — Interaction Router
// Routes slash commands to their handlers
// ─────────────────────────────────────────

import * as newsletter from '../commands/newsletter.js';

const commands = {
  newsletter,
};

export async function handleInteraction(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = commands[interaction.commandName];

  if (!command) {
    console.warn(`⚠️  Unknown command: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing /${interaction.commandName}:`, error);
    const reply = { content: '❌ Something went wrong running that command.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}
