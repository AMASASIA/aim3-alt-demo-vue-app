/**
 * Privacy Guard Middleware
 * Strips all tracking headers and strictly allows only the defined payload.
 */
const privacyGuard = (req, res, next) => {
    // 1. Sanitize Headers
    // Explicitly nullify tracking headers before any processing
    req.headers['cookie'] = null;
    req.headers['user-agent'] = 'AMAS-Clean-Proxy/1.0';
    req.headers['x-forwarded-for'] = null;
    req.headers['referer'] = null;
    req.headers['accept-language'] = null;

    // 2. Extract strictly allowed payload (Allowlist)
    // We only pass through specific keys to the next handler
    if (req.body) {
        const allowedKeys = ['itemId', 'price', 'timestamp', 'signature', 'encryptedData'];
        const cleanBody = {};

        allowedKeys.forEach(key => {
            if (req.body[key] !== undefined) {
                cleanBody[key] = req.body[key];
            }
        });

        // Replace req.body with the sanitized version
        req.body = cleanBody;
    }

    console.log('[PrivacyGuard] Request Sanitized. Tracking data destroyed.');
    next();
};

module.exports = privacyGuard;
