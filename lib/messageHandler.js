'use strict';

const events = require('../arslan');
const { sms } = require('./msg');

function messageText(message) {
    const content = message?.message || {};
    return content.conversation ||
        content.extendedTextMessage?.text ||
        content.imageMessage?.caption ||
        content.videoMessage?.caption ||
        '';
}

async function handleMessages(conn, chatUpdate) {
    for (const message of chatUpdate?.messages || []) {
        if (!message?.message) continue;

        const text = messageText(message);
        if (!text) continue;

        const from = message.key.remoteJid;
        const [rawCommand, ...args] = text.trim().split(/\s+/);
        const prefix = String(process.env.PREFIX || '.');
        if (!rawCommand.startsWith(prefix)) continue;

        const command = rawCommand.slice(prefix.length).toLowerCase();
        const match = events.commands.find(item =>
            item.pattern === command || item.alias?.includes(command)
        );
        if (!match || typeof match.function !== 'function') continue;

        const sender = message.key.participant || message.key.remoteJid;
        const context = {
            from,
            chatId: from,
            quoted: message,
            body: text,
            isCmd: true,
            command,
            args,
            q: args.join(' '),
            text: args.join(' '),
            isGroup: from.endsWith('@g.us'),
            sender,
            senderNumber: sender.split('@')[0],
            isOwner: Boolean(message.key.fromMe),
            isCreator: Boolean(message.key.fromMe),
            reply: replyText(conn, from, message),
        };

        try {
            await match.function(conn, message, sms(conn, message), context);
        } catch (error) {
            console.error(`[MESSAGE_HANDLER] ${command}: ${error.message}`);
        }
    }
}

function replyText(conn, chatId, message) {
    return text => conn.sendMessage(chatId, { text }, { quoted: message });
}

module.exports = { handleMessages };