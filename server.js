const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

const TARGET_URL = process.env.REAL_NEW_API_URL;

// Safeguard check to ensure Railway variables are active
if (!TARGET_URL) {
    console.error("❌ CRITICAL ERROR: The 'REAL_NEW_API_URL' variable is missing!");
    process.exit(1);
}

console.log(`🚀 Gatekeeper initializing. Target backend: ${TARGET_URL}`);

// 1. Intercept and drop JanitorAI traffic
app.use((req, res, next) => {
    const referer = req.headers['referer'] || '';
    const origin = req.headers['origin'] || '';

    if (referer.includes('janitorai.com') || origin.includes('janitorai.com')) {
        console.log(`[BLOCKED] DROPPED request originating from JanitorAI.`);
        return res.status(403).json({ 
            error: true, 
            message: "Access denied: Traffic from JanitorAI is blocked on this instance." 
        });
    }
    next();
});

// 2. Safely forward clean traffic using v3 configurations
app.use('/', createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true,
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔒 Gatekeeper firewall running on port ${PORT}`));
                         
