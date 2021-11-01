const jwt = require("jsonwebtoken");
const fs = require("fs");
const authConfig = require('../configs/auth.config');

const config = process.env;

const verifyRefreshToken = (req, res, next) => {
    const token = req.cookies.refreshToken;
    const audience = req.body.audience;

    if (!token) {
        return res.status(403).json({ message: "A token is required for authentication" });
    }

    if (!audience) {
        return res.status(400).json({ message: "All input is required" });
    }

    try {
        const username = jwt.decode(token).username;

        if (!username) {
            return res.status(401).json({ message: 'Invalid Token' });
        }

        var i = authConfig.issuer; // Issuer 
        var s = username; // Subject 
        var a = audience; // Audience
        // SIGNING OPTIONS

        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
    return next();
};

module.exports = verifyRefreshToken;