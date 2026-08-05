'use strict';

const sessions = new Map();

async function startSlider(sock, { chatId, quoted, ownerId, items, render, timeoutMs = 120000 }) {
    if (!items?.length) return sock.sendMessage(chatId, { text: 'No results.' }, { quoted });

    const sent = await sock.sendMessage(chatId, {
        text: render(items[0], 0, items.length)
    }, { quoted });

    const session = {
        items,
        index: 0,
        render,
        ownerId,
        chatId,
        key: sent.key,
        timeout: null
    };
    session.timeout = setTimeout(() => sessions.delete(sent.key.id), timeoutMs);
    sessions.set(sent.key.id, session);
    return sent;
}

async function handleReaction(sock, reaction) {
    const id = reaction.key?.id;
    const session = sessions.get(id);
    if (!session) return;

    const sender = reaction.key?.participant || reaction.key?.remoteJid;
    if (session.ownerId && sender !== session.ownerId) return;

    const emoji = reaction.reaction?.text;
    if (emoji === '▶️') session.index = (session.index + 1) % session.items.length;
    else if (emoji === '◀️') session.index = (session.index - 1 + session.items.length) % session.items.length;
    else return;

    await sock.sendMessage(session.chatId, {
        text: session.render(session.items[session.index], session.index, session.items.length),
        edit: session.key
    });

    clearTimeout(session.timeout);
    session.timeout = setTimeout(() => sessions.delete(id), 120000);
}

module.exports = { startSlider, handleReaction };