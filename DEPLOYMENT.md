# RedX Mini MD deployment notes

## Required environment

Configure these as protected environment variables in Render, Railway, or
another host. Do not commit a `.env` file.

```text
MONGODB_USERNAME=your-atlas-username
MONGODB_PASSWORD=your-atlas-password
MONGODB_URI=mongodb+srv://cluster0.example.mongodb.net
PORT=10000
```

`config.js` combines the three MongoDB values at runtime. If
`MONGODB_URI` already contains credentials, the username and password are not
used. The app also maps the resolved URI to `MONGO_URL` for older plugins.

## Start

```bash
npm install
npm start
```

The service listens on the host-provided `PORT` value. The pairing portal is
available at `/` and the health endpoint is `/health`.

## What was repaired

- Added compatibility modules for scheduling, text analysis, and cipher tools.
- Added local JavaScript helpers for cipher and text analysis so those commands
  fail gracefully when optional native compilers are unavailable.
- Fixed legacy bundled plugin registration compatibility.
- Added MongoDB connection timeouts and disabled Mongoose command buffering so a
  blocked Atlas allowlist cannot hang requests.
- Added input validation, cache headers, and accessible error states to the
  pairing endpoint and portal.
- Removed hard-coded database and Telegram credentials from the source package.