# RedX Mini-MD

RedX Mini-MD is the rebranded multi-device WhatsApp session bot for Abdul
Rehman Rajpoot. It keeps the uploaded Mini-MD command and plugin system, adds
deterministic plugin discovery, and exposes a cinematic login-style pairing
gateway at `/`.

## Pairing gateway

The `pair.html` page is a self-contained, responsive pairing interface with
animated depth, moving grid effects, reduced-motion support, validation states,
clipboard copy, and the real `/code?number=` request. It does not contain
credentials or session data. Replace the `BOT_BASE_URL` value only when a
plugin needs to link back to a deployed bot URL.

## Deploy on Render

Use the root `render.yaml` blueprint. Render will run this folder as a Node
web service. Set the required `MONGODB_URI` secret in Render before starting
the service. The service exposes:

- `/` — RedX pairing page
- `/code?number=923009842133` — request a pairing code
- `/status` — active session status
- `/ping` — health check and loaded command count
- `/disconnect?number=923009842133` — remove a session

Never commit a MongoDB URL, Telegram token, or WhatsApp session credentials.

## Local start

```bash
cp .env.example .env
npm install
npm start
```

Then open `http://localhost:8000/`.

## Official links

- Owner: Abdul Rehman Rajpoot
- WhatsApp: +923009842133
- GitHub: https://github.com/AbdulRehman19721986/REDXBOT-MD
- Updates: https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10
- Telegram: https://t.me/TeamRedxhacker2
