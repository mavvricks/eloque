const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eloquente_secret_key';

const optionalAuthenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(); // Proceed without user (guest mode)
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (!err) {
            req.user = user;
        }
        // If error (invalid token), we just proceed as guest too, or we could log it.
        // For robustness, let's just proceed.
        next();
    });
};

module.exports = optionalAuthenticateToken;
