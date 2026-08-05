const fs = require('fs');
const path = require('path');

/**
 * Load plugin modules in a deterministic order.
 *
 * Keeping discovery in one place makes it safe to add or remove plugins
 * without changing the bot entry point. A failed plugin is isolated so the
 * rest of the RedX command set can still boot.
 */
function loadPlugins(pluginsDir, log = () => {}) {
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });

    const files = fs.readdirSync(pluginsDir)
        .filter((file) => file.endsWith('.js') && file !== 'index.js')
        .sort((a, b) => a.localeCompare(b));
    const loaded = [];
    const failed = [];

    for (const file of files) {
        try {
            require(path.join(pluginsDir, file));
            loaded.push(file);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            failed.push({ file, message });
            log(`Failed to load plugin ${file}: ${message}`, 'error');
        }
    }

    return { total: files.length, loaded, failed };
}

module.exports = { loadPlugins };