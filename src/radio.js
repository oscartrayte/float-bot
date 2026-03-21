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

function createFFmpegStream() {
  const ffmpeg = spawn(ffmpegPath, [
    '-reconnect', '1',
    '-reconnect_streamed', '1',
    '-reconnect_delay_max', '5',
    '-i', STREAM_URL,
    '-loglevel', 'error',
    '-vn',
    '-acodec', 'libopus',
    '-b:a', '128k',
    '-frame_duration', '20',
    '-application', 'audio',
    '-f', 'ogg',
    '-ar', '48000',
    '-ac', '2',
    'pipe:1',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  ffmpeg.stderr.on('data', (data) => {
    console.error('🎬 FFmpeg:', data.toString().trim());
  });

  ffmpeg.on('error', (err) => {
    console.error('❌ FFmpeg spawn error:', err.message);
  });

  ffmpeg.on('close', (code) => {
    console.log(`🎬 FFmpeg exited with code ${code}`);
  });

  return { stream: ffmpeg.stdout, ffmpeg };
}

function startPlaying() {
  if (!player) return;

  player.removeAllListeners(AudioPlayerStatus.Idle);
  player.removeAllListeners('error');

  const { stream, ffmpeg } = createFFmpegStream();

  const resource = createAudioResource(stream, {
    inputType: StreamType.OggOpus,
    inlineVolume: false,
  });

  player.play(resource);

  player.once(AudioPlayerStatus.Idle, () => {
    if (!isRestarting) {
      console.log('📻 Stream ended, restarting in 3s...');
      ffmpeg.kill('SIGTERM');
      setTimeout(startPlaying, 3000);
    }
  });

  player.once('error', (err) => {
    console.error('❌ Player error:', err.message);
    ffmpeg.kill('SIGTERM');
    if (!isRestarting) {
      setTimeout(startPlaying, 3000);
    }
  });

  stream.on('error', (err) => {
    console.error('❌ Stream error:', err.message);
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
