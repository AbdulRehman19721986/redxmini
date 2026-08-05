# RedX Mini-MD plugins

Every `.js` file in this directory is loaded by `../lib/plugin-loader.js` in
alphabetical order. A plugin registers one or more commands through
`../arslan.js`.

To add a plugin:

1. Create a focused `<feature>.js` file in this directory.
2. Register commands with `cmd({ pattern, alias, category, desc }, handler)`.
3. Keep secrets and service URLs in environment variables, never in plugin code.
4. Restart the bot and confirm `/ping` reports the expected command count.

The original Mini-MD plugin set is kept intact in this folder; the loader only
centralizes discovery and isolates failures so one broken optional plugin does
not prevent the bot from starting.