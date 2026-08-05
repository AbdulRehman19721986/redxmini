'use strict';

// The view-once implementation lives in the media bundle. This compatibility
// module restores the legacy standalone import used by the misc bundle.
const mediaBundle = require('./cat-15-media');
// cat-15-media already registers the actual commands. Exporting only the
// helper here avoids registering duplicate view-once commands.
const viewOnceCommands = [];

module.exports = viewOnceCommands;
module.exports.handleAutoVV = mediaBundle.handleAutoVV;