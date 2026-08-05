/*****************************************************************************
 *  lib/pluginBridge.js
 *
 *  RedX-Mini-MD ships with TWO plugin ecosystems merged together:
 *
 *   1) NATIVE format (original mini-bot style) — a plugin file calls
 *      cmd({ pattern, alias, desc, category, react }, handler) itself and
 *      self-registers into the shared `commands` array as a side effect.
 *      Example: plugins/ping.js
 *
 *   2) BRIDGED format (merged from the full session-id bot) — a plugin file
 *      does `module.exports = { command, aliases, category, description,
 *      handler(sock, message, args, context) {...} }`, or exports an ARRAY
 *      of such objects (used by the big auto-generated "cat-XX-*.js" bundle
 *      files, each of which packs dozens of individual commands together).
 *      Example: plugins/cat-06-admin.js
 *
 *  loadPlugins() below requires every file in /plugins exactly once and
 *  auto-detects which format it used:
 *    - If requiring the file grew the native `commands` array, it already
 *      registered itself — nothing more to do.
 *    - Otherwise, if the file returned an object/array with `command` +
 *      `handler`, we wrap each one in a small adapter that translates the
 *      native (conn, mek, m, ctx) call signature into the
 *      (sock, message, args, context) signature those plugins expect, then
 *      register it with the native cmd() so both formats dispatch through
 *      the exact same command table.
 *
 *  This means a plugin written for EITHER format can simply be dropped into
 *  /plugins — no manual wiring needed. That was the whole point of this file.
 *****************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const events = require('../arslan');
const { cmd } = events;
const config = require('../config');
const settings = require('../settings');

// Newsletter/forward tag some bridged plugins attach to outgoing messages.
// Pulled from settings.js — the single source of truth for brand/channel
// info (see settings.js's "CENTRAL JID / LINKS" block to rebrand in future).
function getChannelInfo() {
    return settings.channelInfo;
}

function wrapBridgedHandler(def) {
    return async (conn, mek, m, ctx) => {
        // Mirror the permission gates the original bridged-plugin dispatcher
        // used to apply itself, since the native loader doesn't know about
        // these flags by default.
        if (def.groupOnly && !ctx.isGroup) return ctx.reply('❌ This command only works in groups.');
        if (def.ownerOnly && !ctx.isOwner) return ctx.reply('❌ Owner / sudo only command.');
        if (def.adminOnly && ctx.isGroup && !ctx.isAdmins && !ctx.isOwner) {
            return ctx.reply('❌ Group admins only.');
        }

        const context = {
            chatId: ctx.from,
            senderId: ctx.sender,
            isGroup: ctx.isGroup,
            isSenderAdmin: !!ctx.isAdmins,
            isBotAdmin: !!ctx.isBotAdmins,
            senderIsOwnerOrSudo: !!ctx.isOwner,
            isOwnerOrSudoCheck: !!ctx.isOwner,
            isRealOwner: !!ctx.isOwner,
            sessionId: ctx.botNumber,
            channelInfo: getChannelInfo(),
            rawText: ctx.body,
            userMessage: ctx.text,
            messageText: ctx.text,
        };

        try {
            await def.handler(conn, mek, ctx.args, context);
        } catch (e) {
            console.log(`⚠️  [PLUGIN:${def.command}] ${e.message}`);
            if (ctx.reply) ctx.reply(`❌ Command error: ${e.message}`);
        }
    };
}

function registerBridgedDef(def, filename) {
    if (!def || !def.command || typeof def.handler !== 'function') return false;
    cmd({
        pattern: def.command,
        alias: def.aliases || def.alias || [],
        desc: def.description || def.desc || '',
        category: def.category || 'misc',
        filename,
    }, wrapBridgedHandler(def));
    return true;
}

/**
 * Load every plugin file in `pluginsDir`, auto-detecting native vs bridged
 * format, and return simple stats for the boot log.
 */
function loadPlugins(pluginsDir) {
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    let native = 0, bridged = 0, failed = 0;
    const failedFiles = [];

    for (const file of files) {
        const full = path.join(pluginsDir, file);
        const before = events.commands.length;
        let mod;
        try {
            delete require.cache[require.resolve(full)];
            mod = require(full);
        } catch (e) {
            failed++;
            failedFiles.push(`${file}: ${e.message}`);
            continue;
        }
        const after = events.commands.length;
        if (after > before) {
            native += (after - before);
            continue; // self-registered natively — nothing more to do
        }
        if (Array.isArray(mod)) {
            for (const def of mod) if (registerBridgedDef(def, full)) bridged++;
        } else if (mod && typeof mod === 'object') {
            if (registerBridgedDef(mod, full)) bridged++;
        }
    }

    return { totalFiles: files.length, native, bridged, failed, failedFiles };
}

module.exports = { loadPlugins, getChannelInfo };
