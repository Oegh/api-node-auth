const jwt = require("jsonwebtoken");
const fs = require("fs");

const config = process.env;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const audience = req.body.audience;

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }

    if (!audience) {
        return res.status(400).send("All input is required");
    }

    try {
        const username = jwt.decode(token).username;

        if (!username) {
            return res.status(401).send('Invalid Token');
        }

        var i = 'Api Cujae'; // Issuer 
        var s = username; // Subject 
        var a = audience; // Audience
        // SIGNING OPTIONS
        var verifyOptions = {
            issuer: i,
            subject: s,
            audience: a,
            expiresIn: "12h",
            algorithm: ["RS256"]
        };

        var publicKey = fs.readFileSync('./public.key', 'utf8');
        const decoded = jwt.verify(token, publicKey, verifyOptions);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }

    return next();
};

module.exports = verifyToken;