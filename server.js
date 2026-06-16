const express = require('express');
const proxy = require('express-http-proxy'); // This matches the new package
const app = express();

const TARGET_URL = process.env.REAL_NEW_API_URL;

if (!TARGET_URL) {
    console.error("❌ CRITICAL ERROR: The 'REAL_NEW_API_URL' environment variable is missing!");
    process.exit(1);
}

console.log(`🛡️ Gatekeeper initialized. Forwarding destination: ${TARGET_URL}`);

// 1. Intercept and drop JanitorAI traffic completely
app.use((req, res, next) => {
    const referer = req.headers['referer'] || '';
    const origin = req.headers['origin'] || '';

    if (referer.includes('janitorai.com') || origin.includes('janitorai.com')) {
        console.log(`[BLOCKED] Dropped a malicious request originating from JanitorAI.`);
        return res.status(403).json({ 
            error: true, 
            message: "Access denied: Traffic from JanitorAI is blocked on this instance." 
        });
    }
    next();
});

// 2. Silently proxy clean requests (supports chunked streaming responses)
app.use('/', proxy(TARGET_URL, {
    parseReqBody: false, // Essential for streaming AI responses properly
    proxyTimeout: 60000
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔒 Firewall running on port ${PORT}`));
app.listen(PORT, () => console.log(`🔒 Gatekeeper firewall running on port ${PORT}`));
                         
