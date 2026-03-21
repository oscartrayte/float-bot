// ─────────────────────────────────────────
// FLOAT® — Radio Player
// Joins a voice channel and streams
// Disco Factory FM 24/7
// ─────────────────────────────────────────

import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
} from '@discordjs/voice';
import ffmpegStatic from 'ffmpeg-static';
import { createRequire } from 'module';

// Point @discordjs/voice at the bundled ffmpeg binary
process.env.FFMPEG_PATH = ffmpegStatic;

const STREAM_URL = 'https://s5.radio.co/s253044a7a/listen';

let connection = null;
let player = null;

function createStream() {
  const resource = createAudioResource(STREAM_URL, {
    inlineVolume: false,
  });
  return resource;
}

function startPlaying() {
  const resource = createStream();
  player.play(resource);

  // If the stream ends or idles, restart it automatically
  player.once(AudioPlayerStatus.Idle, () => {
    console.log('📻 Stream ended, restarting...');
    setTimeout(startPlaying, 2000);
  });
}

export async function startRadio(guild) {
  const channelId = process.env.VOICE_CHANNEL_ID;
  const channel = guild.channels.cache.get(channelId);

  if (!channel) {
    console.warn('⚠️  Voice channel not found. Check VOICE_CHANNEL_ID in your .env');
    return;
  }

  console.log(`🎵 Joining voice channel: ${channel.name}`);

  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false,
  });

  // Wait until connected
  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    console.log('✅ Connected to voice channel.');
  } catch (err) {
    console.error('❌ Could not connect to voice channel:', err);
    connection.destroy();
    return;
  }

  // Create and subscribe the audio player
  player = createAudioPlayer();
  connection.subscribe(player);

  // Reconnect if disconnected unexpectedly
  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    console.warn('⚠️  Disconnected from voice. Attempting to reconnect...');
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
    } catch {
      console.error('❌ Reconnect failed. Destroying connection.');
      connection.destroy();
      // Retry after 10 seconds
      setTimeout(() => startRadio(guild), 10_000);
    }
  });

  startPlaying();
  console.log('📻 Disco Factory FM is now streaming in', channel.name);
}
