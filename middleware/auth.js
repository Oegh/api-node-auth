const jwt = require("jsonwebtoken");
const fs = require("fs");
const authConfig = require('../configs/auth.config');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const audience = req.body.audience;

    if (!token) {
        return next("A token is required for authentication");
    }

    if (!audience) {
        return next("All input is required");
    }

    try {
        const username = jwt.decode(token).username;

        if (!username) {
            return next('Invalid Token');
        }

        var i = authConfig.issuer; // Issuer 
        var s = username; // Subject 
        var a = audience; // Audience
        // SIGNING OPTIONS
        var verifyOptions = {
            issuer: i,
            subject: s,
            audience: a,
            expiresIn: authConfig.jwtExpiration,
            algorithm: ["RS256"]
        };

        var publicKey = fs.readFileSync('./public.key', 'utf8');
        const decoded = jwt.verify(token, publicKey, verifyOptions);
        req.user = decoded;
    } catch (err) {
        return next("Invalid Token");
    }

    return next();
};

module.exports = verifyToken;