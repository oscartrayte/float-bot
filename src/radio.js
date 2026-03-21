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
  StreamType,
} from '@discordjs/voice';
import { spawn } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpegPath = require('ffmpeg-static');

const STREAM_URL = 'https://s5.radio.co/s253044a7a/listen';

let connection = null;
let player = null;
let currentGuild = null;
let isRestarting = false;
let currentFfmpeg = null;

function createFFmpegStream() {
  const ffmpeg = spawn(ffmpegPath, [
    '-reconnect', '1',
    '-reconnect_streamed', '1',
    '-reconnect_delay_max', '5',
    '-i', STREAM_URL,
    '-vn',
    '-acodec', 'libopus',
    '-f', 'opus',
    '-ar', '48000',
    '-ac', '2',
    'pipe:1',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  ffmpeg.on('error', (err) => {
    console.error('❌ FFmpeg error:', err.message);
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error('🎬 FFmpeg stderr:', data.toString().trim());
  });

  return { stream: ffmpeg.stdout, ffmpeg };
}

function startPlaying() {
  if (!player) return;

  const { stream, ffmpeg } = createFFmpegStream();
  currentFfmpeg = ffmpeg;

  stream.once('data', () => {
    console.log('✅ FFmpeg stdout is flowing — data received from stream.');
  });

  const resource = createAudioResource(stream, {
    inputType: StreamType.OggOpus,
    inlineVolume: false,
  });

  console.log('✅ Audio resource created, handing to player...');

  console.log('▶️  Calling player.play(resource)...');
  player.play(resource);

  player.once(AudioPlayerStatus.Idle, () => {
    if (!isRestarting) {
      console.log('📻 Stream ended, restarting in 3s...');
      ffmpeg.kill();
      setTimeout(startPlaying, 3000);
    }
  });
}

export async function startRadio(guild) {
  currentGuild = guild;
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

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    console.log('✅ Connected to voice channel.');
  } catch (err) {
    console.error('❌ Could not connect to voice channel:', err);
    connection.destroy();
    setTimeout(() => startRadio(guild), 10_000);
    return;
  }

  player = createAudioPlayer();

  player.on('error', (err) => {
    console.error('❌ Player error:', err.message);
    if (currentFfmpeg) currentFfmpeg.kill();
    if (!isRestarting) {
      setTimeout(startPlaying, 3000);
    }
  });

  connection.subscribe(player);

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    console.warn('⚠️  Disconnected. Attempting to reconnect...');
    isRestarting = true;
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
      isRestarting = false;
    } catch {
      console.error('❌ Reconnect failed. Retrying in 10s...');
      connection.destroy();
      player = null;
      connection = null;
      isRestarting = false;
      setTimeout(() => startRadio(currentGuild), 10_000);
    }
  });

  startPlaying();
  console.log('📻 Disco Factory FM is now streaming in', channel.name);
}
