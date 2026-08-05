/*****************************************************************************
 *  REDX-MINI-MD v9.0 ULTRA - Settings                                          *
 *  Owner: Abdul Rehman Rajpoot | +923009842133                              *
 *  GitHub: https://github.com/AbdulRehman19721986/REDXBOT-MD                *
 *****************************************************************************/
'use strict';
const fs = require('fs');

let platform = 'local';
if (process.env.RAILWAY_SERVICE_NAME || process.env.RAILWAY_PROJECT_NAME) platform = 'railway';
else if (process.env.DYNO || process.env.HEROKU_APP_NAME) platform = 'heroku';
else if (process.env.RENDER_EXTERNAL_URL) platform = 'render';
else if (process.env.KOYEB_APP_NAME) platform = 'koyeb';
else if (fs.existsSync('/.fly')) platform = 'flyio';

module.exports = {
    // Bot Identity
    botName: process.env.BOT_NAME || 'REDX-MINI-MD',
    botDesc:    process.env.BOT_DESC    || '🔥 Advanced WhatsApp Bot v9.0 ULTRA',
    botDp:      process.env.BOT_DP      || 'https://files.catbox.moe/s36b12.jpg',
    version:    '9.0.0',
    description: 'REDX-MINI-MD v9.0 ULTRA – 500+ Features, 24/7 Online',

    // SINGLE OWNER — Abdul Rehman Rajpoot
    botOwner:    process.env.BOT_OWNER    || 'Abdul Rehman Rajpoot',
    ownerNumber: process.env.OWNER_NUMBER || '923009842133',
    ownerName:   process.env.OWNER_NAME   || 'Abdul Rehman Rajpoot',
    ownerVideo:  process.env.OWNER_VIDEO  || 'https://files.catbox.moe/sqyj68.mp4',

    // Command
    prefixes:    ['.'],
    commandMode: process.env.COMMAND_MODE || 'public',
    packname: process.env.PACKNAME || 'REDX-MINI-MD',
    author:      process.env.AUTHOR       || 'Abdul Rehman Rajpoot',
    timeZone:    process.env.TIMEZONE     || 'Asia/Karachi',

    // Performance
    maxStoreMessages:    parseInt(process.env.MAX_STORE_MESSAGES)  || 20,
    tempCleanupInterval: 20 * 60 * 1000,
    storeWriteInterval:  parseInt(process.env.STORE_WRITE_INTERVAL) || 10000,

    // ══════════════════════════════════════════════════════════
    //  CENTRAL JID / LINKS — change here → affects everywhere
    // ══════════════════════════════════════════════════════════
    channelJid:    process.env.CHANNEL_JID    || '120363405513439052@newsletter',
    channelName:   process.env.CHANNEL_NAME   || 'REDX-MINI-MD | Abdul Rehman Rajpoot',
    channelLink:   process.env.CHANNEL_LINK   || 'https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10',
    whatsappGroup: process.env.WHATSAPP_GROUP || 'https://chat.whatsapp.com/LhSmx2SeXX75r8I2bxsNDo',
    pairSite:      process.env.PAIR_SITE      || process.env.RENDER_EXTERNAL_URL || '',
    vpsLink:       process.env.VPS_LINK       || '',
    githubRepo:    'https://github.com/AbdulRehman19721986/REDXBOT-MD',
    telegramGroup: 'https://t.me/TeamRedxhacker2',
    youtubeChannel:'https://youtube.com/@rootmindtech',
    // ══════════════════════════════════════════════════════════

    // Newsletter contextInfo builder — import this everywhere
    get channelInfo() {
        return {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:  this.channelJid,
                    newsletterName: this.channelName,
                    serverMessageId: 143,
                }
            }
        };
    },

    welcomeAudio:   'https://files.catbox.moe/voio3f.m4a',
    ownerSongUrl:   'https://files.catbox.moe/voio3f.m4a',
    updateZipUrl:   'https://github.com/AbdulRehman19721986/REDXBOT-MD/archive/refs/heads/main.zip',

    // APIs
    giphyApiKey:    process.env.GIPHY_API_KEY   || '',
    openWeatherKey: process.env.OPENWEATHER_KEY || '',

    platform,
};
