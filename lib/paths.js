'use strict';

const fs = require('fs');
const path = require('path');

// Keep runtime data beside the bot project, not beside whichever process
// launched it. This matters on Render and when the bot is started by a
// supervisor from a different working directory.
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const TEMP_DIR = path.join(ROOT_DIR, 'temp');
const SESSION_DIR = path.join(ROOT_DIR, 'session');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
}

function dataFile(name) {
    return path.join(ensureDir(DATA_DIR), name);
}

module.exports = {
    ROOT_DIR,
    DATA_DIR,
    ASSETS_DIR,
    TEMP_DIR,
    SESSION_DIR,
    ensureDir,
    dataFile
};