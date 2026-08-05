#!/usr/bin/env node
'use strict';

const [,, type, mode, key, ...parts] = process.argv;
const text = parts.join(' ');
const decode = mode === 'decode' || mode === 'decrypt';

function caesar(input, amount) {
    const shift = (decode ? -1 : 1) * Number(amount);
    return input.replace(/[a-z]/gi, char => {
        const base = char <= 'Z' ? 65 : 97;
        return String.fromCharCode((char.charCodeAt(0) - base + shift + 26 * 10) % 26 + base);
    });
}

function vigenere(input, secret) {
    let index = 0;
    const normalized = String(secret).replace(/[^a-z]/gi, '').toLowerCase();
    if (!normalized) throw new Error('Vigenère key must contain letters');
    return input.replace(/[a-z]/gi, char => {
        const base = char <= 'Z' ? 65 : 97;
        const direction = decode ? -1 : 1;
        const shift = direction * (normalized.charCodeAt(index++ % normalized.length) - 97);
        return String.fromCharCode((char.charCodeAt(0) - base + shift + 260) % 26 + base);
    });
}

function xor(input, secret) {
    const source = decode ? Buffer.from(input, 'hex') : Buffer.from(input);
    const mask = Buffer.from(String(secret));
    if (!mask.length) throw new Error('XOR key cannot be empty');
    const output = Buffer.alloc(source.length);
    for (let i = 0; i < source.length; i++) output[i] = source[i] ^ mask[i % mask.length];
    return decode ? output.toString() : output.toString('hex');
}

try {
    if (!type || !mode || key === undefined || !text) throw new Error('Usage: cipher <type> <encode|decode> <key> <text>');
    if (type === 'caesar') process.stdout.write(caesar(text, key));
    else if (type === 'vigenere') process.stdout.write(vigenere(text, key));
    else if (type === 'xor') process.stdout.write(xor(text, key));
    else throw new Error(`Unknown cipher: ${type}`);
} catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
}