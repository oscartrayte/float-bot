// ─────────────────────────────────────────
// FLOAT® — Now Playing
// Polls Disco Factory FM for current track
// and updates bot Discord status
// ─────────────────────────────────────────

import { ActivityType } from 'discord.js';

const STATUS_URL = 'https://public.radio.co/stations/s253044a7a/status';
const POLL_INTERVAL = 10_000; // every 10 seconds

let lastTrack = null;
let intervalId = null;

async function fetchCurrentTrack() {
  try {
    const res = await fetch(STATUS_URL);
    const data = await res.json();
    return data?.current_track?.title || null;
  } catch (err) {
    console.error('⚠️  Could not fetch now playing:', err.message);
    return null;
  }
}

export async function startNowPlaying(client) {
  async function update() {
    const track = await fetchCurrentTrack();

    if (track && track !== lastTrack) {
      lastTrack = track;
      console.log(`🎵 Now playing: ${track}`);

      client.user.setActivity(`🎵 ${track}`, {
        type: ActivityType.Listening,
      });
    }
  }

  // Run immediately on start
  await update();

  // Then poll every 10 seconds
  intervalId = setInterval(update, POLL_INTERVAL);
}

export function stopNowPlaying() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
