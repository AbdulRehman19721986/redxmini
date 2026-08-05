/*****************************************************************************
 * REDX-MINI-MD — view-once compatibility entrypoint
 *
 * Some deployments and older integrations load the feature as
 * `plugins/advanced-vv.js`, while the bundled command implementation lives
 * in `plugins/viewonce.js`/`cat-15-media.js`. Keep this shim as the single
 * compatibility boundary so both loading conventions work.
 *****************************************************************************/

'use strict';

const vvPlugin = require('./viewonce');

module.exports = vvPlugin;
module.exports.handleAutoVV = vvPlugin.handleAutoVV;