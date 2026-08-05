<div align="center">

# 👑 RedX-Mini-MD

**Official multi-device WhatsApp bot — by Abdul Rehman Rajpoot (REDXAPI)**

A lightweight, multi-session pairing bot merged with 500+ commands from the full
RedX session-ID bot, unified behind one clean web login page.

[![WhatsApp Channel](https://img.shields.io/badge/WhatsApp-Channel-25D366?style=for-the-badge&logo=whatsapp)](https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10)
[![WhatsApp Group](https://img.shields.io/badge/WhatsApp-Group-25D366?style=for-the-badge&logo=whatsapp)](https://chat.whatsapp.com/LhSmx2SeXX75r8I2bxsNDo)
[![Telegram](https://img.shields.io/badge/Telegram-Group-26A5E4?style=for-the-badge&logo=telegram)](https://t.me/TeamRedxhacker2)
[![YouTube](https://img.shields.io/badge/YouTube-Channel-FF0000?style=for-the-badge&logo=youtube)](https://youtube.com/@rootmindtech)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-181717?style=for-the-badge&logo=github)](https://github.com/AbdulRehman19721986/REDXBOT-MD)

</div>

---

## ✨ What this is

RedX-Mini-MD takes the mini bot's simple, multi-session **web pairing page**
(open the site → type your number → get a pairing code → done) and merges in
the full command library from the session-ID bot, so you get one bot that is
both **easy to deploy** and **heavy on features**.

- 🔑 **Simple login-style pairing page** — no terminal, no QR-scanning hassle.
  Just visit the site, type a WhatsApp number, get an 8-character pair code.
- 🗂️ **Multi-session support** — pair more than one number from the same
  deployment, sessions are stored in MongoDB.
- 🔌 **Dual plugin system** — plugins can be written either in the mini bot's
  native `cmd()` style *or* the session bot's `{command, handler}` style.
  Both formats are auto-detected and loaded side-by-side (see
  [`lib/pluginBridge.js`](lib/pluginBridge.js)) — drop a new plugin file in
  either format into `/plugins` and it just works.
- 🧩 **500+ merged commands**: AI chat, image generation, stickers, video/audio
  downloaders (YouTube, TikTok, Facebook, Instagram, Spotify), games, group
  management, admin/security tools (antilink, antispam, antibadword,
  anti-flood), profile tools, schedulers, and more.

---

## 🚫 What's intentionally NOT included

A few plugins from the original session bot were left out of this merge on
purpose, and won't be re-added:

- Explicit/adult-content commands with no age-gating.
- A "silent auto-forward view-once media to owner" plugin — this covertly
  captured other people's disappearing messages without their knowledge,
  which isn't something this project ships.

Everything else — 500+ legitimate commands — made it in.

---

## 🚀 Quick start (local)

```bash
git clone <your-repo-url>
cd redx-mini-md
npm install
cp .env.example .env   # fill in MONGODB_URI at minimum
npm start
```

Then open `http://localhost:<PORT>` in a browser, type your WhatsApp number,
and grab your pairing code from the WhatsApp app under
**Linked Devices → Link with phone number**.

## ☁️ Deploy on Render

1. Push this repo to your own GitHub account.
2. On [Render](https://render.com), create a **New Web Service** from the repo.
3. Build command: `npm install` — Start command: `npm start`.
4. Add environment variables (see **Environment variables** below) — at
   minimum set `MONGODB_URI`.
5. Once deployed, open the Render URL — that's your pairing page.

> **Puppeteer note:** the `.topdf`-style HTML→PDF command tries Puppeteer
> first and automatically falls back to a lighter PDF generator if Puppeteer
> isn't installed. Puppeteer itself isn't in `package.json` by default to
> keep Render builds fast and reliable — install it yourself
> (`npm install puppeteer`) plus the packages in `Aptfile` only if you want
> full HTML rendering and have the resources for it.

> **Optional DB backends:** by default the bot uses MongoDB (session store)
> plus flat JSON files (feature settings). If you want MySQL or Postgres
> instead for the feature-settings store, `npm install mysql2` or
> `npm install pg` and set `MYSQL_URL` / `POSTGRES_URL` — these are lazy-loaded
> and otherwise never touched.

## 🔧 Environment variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string for multi-session storage |
| `PORT` | – | Web server port (Render sets this automatically) |
| `OWNER_NUMBERS` | – | Comma-separated bot owner numbers (default: `923009842133`) |
| `WORK_TYPE` | – | `public` / `private` / `group` / `inbox` |
| `CHANNEL_JID` / `CHANNEL_NAME` / `CHANNEL_LINK` | – | Rebrand the forwarded-message channel tag |
| `GIPHY_API_KEY` / `OPENWEATHER_KEY` | – | Optional third-party API keys used by a few commands |

See `settings.js` — the **"CENTRAL JID / LINKS"** block — for the single
place to rebrand channel/links project-wide in future.

---

## 🧱 Project structure

```
redx-mini-md/
├── index.js            # process entrypoint
├── main.js              # Express server, pairing routes, message dispatcher
├── arslan.js             # core cmd() registration + dispatch engine
├── config.js            # bot identity, owner, brand/social links
├── settings.js           # secondary settings module used by merged plugins
├── pair.html             # the web login/pairing page
├── lib/
│   ├── pluginBridge.js   # ⭐ unifies the two plugin formats — start here
│   └── ...               # session store, antidelete, helpers, etc.
├── plugins/              # 82 files, 500+ commands (native + bridged)
└── data/                 # JSON-backed feature settings (auto-created)
```

## 🩹 Adding your own plugins

Either style works, drop the file straight into `/plugins`:

```js
// Native style
const { cmd } = require('../arslan');
cmd({ pattern: 'hello', desc: 'Say hi', category: 'fun' }, async (conn, mek, m, { reply }) => {
    await reply('Hello 👋');
});
```

```js
// Bridged style
module.exports = {
    command: 'hello',
    category: 'fun',
    description: 'Say hi',
    async handler(sock, message, args, context) {
        await sock.sendMessage(context.chatId, { text: 'Hello 👋' }, { quoted: message });
    }
};
```

---

<div align="center">

**© RedX-Mini-MD | Built for Abdul Rehman Rajpoot (REDXAPI)**

</div>
