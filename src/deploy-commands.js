// ─────────────────────────────────────────
// FLOAT® — Deploy Slash Commands
// Run this once with: node src/deploy-commands.js
// Re-run any time you add or change commands
// ─────────────────────────────────────────

import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import * as newsletter from './commands/newsletter.js';

const commands = [newsletter].map((cmd) => cmd.data.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 Registering slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log('✅ Slash commands registered successfully.');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();
