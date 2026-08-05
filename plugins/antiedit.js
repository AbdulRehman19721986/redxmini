'use strict';

const cache = new Map();
const timers = new Map();
const CACHE_TTL = 30 * 60 * 1000;

function getText(message) {
    return message?.conversation ||
        message?.extendedTextMessage?.text ||
        message?.imageMessage?.caption ||
        message?.videoMessage?.caption ||
        '';
}

function cacheMessage(message) {
    const id = message?.key?.id;
    if (!id) return;
    cache.set(id, {
        id,
        chatId: message.key.remoteJid,
        sender: message.key.participant || message.key.remoteJid,
        text: getText(message.message),
        updatedAt: Date.now(),
    });
    clearTimeout(timers.get(id));
    timers.set(id, setTimeout(() => {
        cache.delete(id);
        timers.delete(id);
    }, CACHE_TTL));
}

async function handleUpdate(sock, updates) {
    for (const update of updates || []) {
        const id = update?.key?.id;
        const previous = cache.get(id);
        const edited = update?.update?.message;
        const nextText = getText(edited);
        if (!previous || !nextText || nextText === previous.text) continue;

        await sock.sendMessage(previous.chatId, {
            text: `Message edited by @${previous.sender.split('@')[0]}\n\nBefore:\n${previous.text}\n\nAfter:\n${nextText}`,
            mentions: [previous.sender]
        });
        previous.text = nextText;
        previous.updatedAt = Date.now();
        cache.set(id, previous);
    }
}

module.exports = {
    command: 'antiedit',
    aliases: ['editwatch'],
    category: 'security',
    description: 'Track edits to recently received text messages.',
    handler: async (sock, message, args, context = {}) => {
        const chatId = context.chatId || message.key.remoteJid;
        await sock.sendMessage(chatId, {
            text: 'Edit tracking is active for recently received messages.'
        }, { quoted: message });
    },
    cache: cacheMessage,
    handleUpdate
};