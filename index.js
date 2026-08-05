const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pairRouter = require('./main');
app.use('/', pairRouter);

// Vercel runs this file as a serverless function and never calls .listen()
// itself — it just imports `app` and feeds requests to it directly. Calling
// .listen() there too would try to open a real TCP port, which Vercel's
// runtime doesn't support, so it's skipped when process.env.VERCEL is set.
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
}

module.exports = app;
