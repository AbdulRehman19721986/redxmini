'use strict';

const fs = require('fs');
const path = require('path');

const BINARIES = new Set(['cipher', 'analyze']);

function getBin(name) {
    if (!BINARIES.has(name)) {
        throw new Error(`Unsupported helper: ${name}`);
    }

    const binary = path.join(__dirname, '..', 'bin', `${name}.js`);
    if (!fs.existsSync(binary)) {
        throw new Error(`${name} helper is not installed`);
    }
    return binary;
}

module.exports = { getBin };