// ═══════════════════════════════════════════════════════════════════════════
//  █████╗ ██████╗ ███████╗██╗      █████╗  ███╗   ██╗    ███╗   ███╗██████╗ 
// ██╔══██╗██╔══██╗██╔════╝██║     ██╔══██╗████╗  ██║    ████╗ ████║██╔══██╗
// ███████║██████╔╝███████╗██║     ███████║██╔██╗ ██║    ██╔████╔██║██║  ██║
// ██╔══██║██╔══██╗╚════██║██║     ██╔══██║██║╚██╗██║    ██║╚██╔╝██║██║  ██║
// ██║  ██║██║  ██║███████║███████╗██║  ██║██║  ████║     ██║ ╚═╝ ██║██████╔╝
// ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═══╝    ╚═╝     ╚═╝╚═════╝ 
// ═══════════════════════════════════════════════════════════════════════════
//                    REDX MINI-MD - BOT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const dotenv = require('dotenv');

// ────────────────────────────────────────────────────────────────────────────
//  🔄 ENVIRONMENT LOADER
// ────────────────────────────────────────────────────────────────────────────
if (fs.existsSync('.env')) {
    dotenv.config({ path: '.env' });
}

// ────────────────────────────────────────────────────────────────────────────
//  📦 CONFIGURATION EXPORT
// ────────────────────────────────────────────────────────────────────────────
module.exports = {

    // ═══════════════════════════════════════════════════════════════════════
    //  🔐 SESSION & DATABASE
    // ═══════════════════════════════════════════════════════════════════════
    
    /** 
     * @description Session ID for bot authentication and persistence
     * @type {string}
     * @default "MINI BOT"
     */
    SESSION_ID: process.env.SESSION_ID || "redx-mini-md",
    
    /** 
     * @description MongoDB Atlas connection string
     * @type {string}
     * @default "mongodb+srv://..."
     */
    // Required in production. Never commit a database URL here.
    MONGODB_URI: process.env.MONGODB_URI,

    // ═══════════════════════════════════════════════════════════════════════
    //  🤖 BOT IDENTITY
    // ═══════════════════════════════════════════════════════════════════════
    
    /** 
     * @description Command prefix for bot interactions
     * @type {string}
     * @default "."
     */
    PREFIX: process.env.PREFIX || '.',
    
    /** 
     * @description Owner's WhatsApp number with country code
     * @type {string}
     * @default "923009842133"
     */
    OWNER_NUMBER: String(process.env.OWNER_NUMBER || '923009842133')
        .split(',')
        .map((number) => number.replace(/[^0-9]/g, ''))
        .filter(Boolean),
    
    /** 
     * @description Display name of the bot
     * @type {string}
     * @default "RedX Mini-MD"
     */
    BOT_NAME: process.env.BOT_NAME || "RedX Mini-MD",
    
    /** 
     * @description Footer text for bot messages
     * @type {string}
     * @default "© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀʀꜱʟᴀɴ-ᴍᴅ"
     */
    BOT_FOOTER: process.env.BOT_FOOTER || '© Powered by RedX Mini-MD',
    OWNER_NAME: process.env.OWNER_NAME || 'Abdul Rehman Rajpoot',
    
    /** 
     * @description Bot work mode
     * @type {('public'|'private'|'group'|'inbox')}
     * @default "public"
     * @example
     * - public  : Responds to all messages
     * - private : Only responds in DMs
     * - group   : Only responds in groups
     * - inbox   : Only responds in DMs
     */
    WORK_TYPE: process.env.WORK_TYPE || "public",
    ANTIDELETE: 'true',  // Global antidelete enable/disable

    // ═══════════════════════════════════════════════════════════════════════
    //  👁️ STATUS AUTOMATION
    // ═══════════════════════════════════════════════════════════════════════
    
    /** 
     * @description Auto-view WhatsApp status updates
     * @type {string}
     * @default "true"
     */
    AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || 'true',
    
    /** 
     * @description Auto-like status updates with random emojis
     * @type {string}
     * @default "true"
     */
    AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS || 'true',
    
    /** 
     * @description Emoji pool for auto-like feature
     * @type {string[]}
     */
    AUTO_LIKE_EMOJI: ['❤️', '🌹', '✨', '🥰', '🌹', '😍', '💞', '💕', '☺️', '🤗'],
    
    /** 
     * @description Auto-reply to status updates
     * @type {string}
     * @default "false"
     */
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || 'false',
    
    /** 
     * @description Default message for status reply
     * @type {string}
     * @default "🤗"
     */
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || '🤗',

    // ═══════════════════════════════════════════════════════════════════════
    //  💬 PRESENCE & CHAT SETTINGS
    // ═══════════════════════════════════════════════════════════════════════
    
    /** 
     * @description Mark messages as read (blue ticks)
     * @type {string}
     * @default "false"
     */
    READ_MESSAGE: process.env.READ_MESSAGE || 'false',
    
    /** 
     * @description Show typing indicator in chat
     * @type {string}
     * @default "false"
     */
    AUTO_TYPING: process.env.AUTO_TYPING || 'false',
    
    /** 
     * @description Show recording indicator in chat
     * @type {string}
     * @default "false"
     */
    AUTO_RECORDING: process.env.AUTO_RECORDING || 'false',

    // ═══════════════════════════════════════════════════════════════════════
    //  👥 GROUP MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════
    
    /** 
     * @description Send welcome message when new member joins
     * @type {string}
     * @default "true"
     */
    WELCOME_ENABLE: process.env.WELCOME_ENABLE || 'true',
    
    /** 
     * @description Send goodbye message when member leaves
     * @type {string}
     * @default "true"
     */
    GOODBYE_ENABLE: process.env.GOODBYE_ENABLE || 'true',
    
    /** 
     * @description Custom welcome message (null = use default)
     * @type {string|null}
     * @default null
     */
    WELCOME_MSG: process.env.WELCOME_MSG || null,
    
    /** 
     * @description Custom goodbye message (null = use default)
     * @type {string|null}
     * @default null
     */
    GOODBYE_MSG: process.env.GOODBYE_MSG || null,
    
    /** 
     * @description Custom welcome image URL (null = use default)
     * @type {string|null}
     * @default null
     */
    WELCOME_IMAGE: process.env.WELCOME_IMAGE || null,
    
    /** 
     * @description Custom goodbye image URL (null = use default)
     * @type {string|null}
     * @default null
     */
    GOODBYE_IMAGE: process.env.GOODBYE_IMAGE || null,
    
    /** 
     * @description WhatsApp group invite link
     * @type {string}
     */
    GROUP_INVITE_LINK: process.env.GROUP_INVITE_LINK || 'https://chat.whatsapp.com/LhSmx2SeXX75r8I2bxsNDo',

    // ═══════════════════════════════════════════════════════════════════════
    //  🛡️ SECURITY & ANTI-CALL
    // ═══════════════════════════════════════════════════════════════════════
    
    /** 
     * @description Reject incoming calls automatically
     * @type {string}
     * @default "false"
     */
    ANTI_CALL: process.env.ANTI_CALL || 'false',
    
    /** 
     * @description Message sent when rejecting calls
     * @type {string}
     * @default "*CALL LATER PLEASE ☺️🌹*"
     */
    REJECT_MSG: process.env.REJECT_MSG || '*CALL LATER PLEASE ☺️🌹*',

    // ═══════════════════════════════════════════════════════════════════════
    //  🖼️ MEDIA & LINKS
    // ═══════════════════════════════════════════════════════════════════════
    
    /** 
     * @description Default bot profile image path/URL
     * @type {string}
     */
    IMAGE_PATH: process.env.IMAGE_PATH || 'https://files.catbox.moe/s36b12.jpg',
    
    /** 
     * @description WhatsApp channel link for updates
     * @type {string}
     */
    CHANNEL_LINK: process.env.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10',
    NEWSLETTER_JID: process.env.NEWSLETTER_JID || '120363405513439052@newsletter',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',

    // ═══════════════════════════════════════════════════════════════════════
    //  📡 EXTERNAL API INTEGRATIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /** 
     * @description Telegram bot token for notifications
     * @type {string}
     * @default ""
     */
    // Optional. Set both Telegram values in Render if notifications are enabled.
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    
    /** 
     * @description Telegram chat ID for sending notifications
     * @type {string}
     * @default ""
     */
    BOT_BASE_URL: process.env.BOT_BASE_URL || ''

};

// ────────────────────────────────────────────────────────────────────────────
//  📖 USAGE EXAMPLES
// ────────────────────────────────────────────────────────────────────────────

/**
 * @example
 * // Import configuration
 * const config = require('./config');
 * 
 * // Access bot settings
 * console.log(`Bot: ${config.BOT_NAME}`);
 * console.log(`Prefix: ${config.PREFIX}`);
 * console.log(`Owner: ${config.OWNER_NUMBER}`);
 * 
 * // Check if auto-view status is enabled
 * if (config.AUTO_VIEW_STATUS === 'true') {
 *     console.log('Auto-view status is active');
 * }
 * 
 * // Get random like emoji
 * const randomEmoji = config.AUTO_LIKE_EMOJI[Math.floor(Math.random() * config.AUTO_LIKE_EMOJI.length)];
 */

// ────────────────────────────────────────────────────────────────────────────
//  🏷️ EXPORT METADATA
// ────────────────────────────────────────────────────────────────────────────

/**
 * @module config
 * @description RedX Mini-MD Bot Configuration Module
 * @version 2.0.0
 * @author Abdul Rehman Rajpoot
 * @license MIT
 */
