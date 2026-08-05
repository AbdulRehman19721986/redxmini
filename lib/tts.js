'use strict';

const fs = require('fs');
const https = require('https');

/**
 * Small gTTS-compatible adapter.
 *
 * The old `gtts` package pulls an obsolete request/form-data tree that is no
 * longer installable in several production environments. Keep the same
 * constructor + save callback API used by the existing plugins, but request
 * the audio directly from Google's public translate endpoint.
 */
class TextToSpeech {
    constructor(text, language = 'en') {
        this.text = String(text || '').slice(0, 200);
        this.language = String(language || 'en').split(/[-_]/)[0];
    }

    save(filePath, callback) {
        const params = new URLSearchParams({
            ie: 'UTF-8',
            q: this.text,
            tl: this.language,
            client: 'tw-ob',
        });
        const request = https.get(
            `https://translate.google.com/translate_tts?${params.toString()}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    Accept: 'audio/mpeg',
                },
            },
            (response) => {
                if (response.statusCode !== 200) {
                    response.resume();
                    callback(new Error(`TTS request failed with HTTP ${response.statusCode}`));
                    return;
                }

                const chunks = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => {
                    try {
                        fs.writeFileSync(filePath, Buffer.concat(chunks));
                        callback(null);
                    } catch (error) {
                        callback(error);
                    }
                });
            },
        );
        request.on('error', callback);
        request.setTimeout(30000, () => {
            request.destroy(new Error('TTS request timed out'));
        });
    }
}

module.exports = TextToSpeech;