const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// 1. Intercept and block JanitorAI
app.use((req, res, next) => {
    const referer = req.headers['referer'] || '';
    const origin = req.headers['origin'] || '';

    if (referer.includes('janitorai.com') || origin.includes('janitorai.com')) {
        console.log(`[BLOCKED] Request rejected from JanitorAI.`);
        return res.status(403).json({ 
            error: true, 
            message: "Access denied: Traffic from JanitorAI is blocked on this instance." 
        });
    }
    next();
});

// 2. If clean, forward the request to your actual New API instance
app.use('/', createProxyMiddleware({
    target: process.env.REAL_NEW_API_URL, // e.g., https://your-internal-newapi-service
    changeOrigin: true,
    ws: true, // enables web sockets for streaming responses
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gatekeeper proxy running on port ${PORT}`));
