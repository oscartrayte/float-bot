# 🕹️ FLOAT® Discord Bot

NES nostalgia community bot. Welcomes new members and handles newsletter posting.

---

## Features

- **Auto welcome message** — sends your FLOAT® welcome banner image + a personalised @mention message to the welcome channel whenever a new member joins
- **`/newsletter`** — admin-only slash command to post a formatted newsletter embed to a designated channel
- **24/7 Radio** — bot automatically joins your voice channel on startup and streams Disco Factory FM continuously, with auto-reconnect if the stream drops

---

## Setup (Mac, local hosting)

### 1. Prerequisites

Make sure you have Node.js installed. Check with:
```bash
node -v
```
You need v18 or higher. If not installed, grab it from [nodejs.org](https://nodejs.org).

---

### 2. Create your Discord bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** — name it `FLOAT Bot` or similar
3. Go to **Bot** in the sidebar → click **Reset Token** → copy your token
4. Under **Privileged Gateway Intents**, enable:
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent**
5. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot permissions: `Send Messages`, `Embed Links`, `Read Message History`, `View Channels`
6. Copy the generated URL, open it in your browser, and invite the bot to your server

---

### 3. Get your IDs

Enable Developer Mode in Discord (Settings → Advanced → Developer Mode), then:

- **Client ID** — Discord Developer Portal → your app → OAuth2
- **Guild ID** — Right-click your server name → Copy Server ID
- **Newsletter Channel ID** — Right-click your newsletter channel → Copy Channel ID
- **Welcome Channel ID** — Right-click your welcome channel → Copy Channel ID

---

### 4. Install & configure

```bash
# Clone or copy this folder, then:
cd float-bot
npm install

# Copy the example env file
cp .env.example .env
```

Open `.env` and fill in all six values:
```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
NEWSLETTER_CHANNEL_ID=your_newsletter_channel_id_here
WELCOME_CHANNEL_ID=your_welcome_channel_id_here
VOICE_CHANNEL_ID=your_voice_channel_id_here
```

> **VOICE_CHANNEL_ID** — right-click the voice channel you want the bot to stream in → Copy Channel ID

---

### 5. Register slash commands

This only needs to be run once (and again whenever you add new commands):

```bash
node src/deploy-commands.js
```

---

### 6. Start the bot

```bash
npm start
```

You should see:
```
✅ FLOAT® Bot is online. Logged in as FLOAT Bot#1234
```

The bot will now run as long as that terminal window is open.

---

## Usage

### `/newsletter`

Admin-only. Fill in:

| Field | Required | Description |
|-------|----------|-------------|
| `issue` | ✅ | e.g. `Issue 01` or `March 2026` |
| `headline` | ✅ | Intro/strapline for the issue |
| `body` | ✅ | Main content. Use `\n` for line breaks |
| `section_title` | ❌ | Optional extra section heading |
| `section_body` | ❌ | Optional extra section content |

The newsletter posts to your `NEWSLETTER_CHANNEL_ID` channel as a rich embed.

---

## File structure

```
float-bot/
├── src/
│   ├── index.js                  # Bot entry point
│   ├── radio.js                  # Voice channel radio streamer
│   ├── deploy-commands.js        # Run once to register slash commands
│   ├── assets/
│   │   └── welcome-banner.png    # FLOAT® welcome banner image
│   ├── events/
│   │   └── guildMemberAdd.js     # Welcome message logic
│   ├── interactions/
│   │   └── index.js              # Routes slash commands
│   └── commands/
│       └── newsletter.js         # /newsletter command
├── .env                          # Your secrets (never commit this)
├── .env.example                  # Safe template to share
└── package.json
```

---

## Keep it running (optional, later)

For now, running locally with `npm start` is fine. When you're ready to host it permanently, options include:
- [Railway](https://railway.app) — free tier, simple deploy
- [Render](https://render.com) — free tier, good for small bots
- A cheap VPS (DigitalOcean, Hetzner)

---

*FLOAT® · Built with discord.js v14*
