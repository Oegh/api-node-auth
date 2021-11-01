const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const jose = require("node-jose");
const fs = require("fs");
const authConfig = require('../configs/auth.config');

router.get('/', jwks);
router.post('/verify', verify);

const client = jwksClient({
    jwksUri: authConfig.jwksUri
});

module.exports = router;

async function jwks(_req, res) {
    const ks = fs.readFileSync("keys.json");
    const keyStore = await jose.JWK.asKeyStore(ks.toString());
    res.send(keyStore.toJSON());
}

async function verify(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const { audience } = req.body;

    if (!(audience && token)) {
        return next('All input is required');
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

        jwt.verify(token, getKey, verifyOptions, function(err, decoded) {
            if (err) {
                return next('Invalid Token');
            }
            res.status(202).json({
                valid: true,
                decoded: decoded
            });
        });
    } catch (err) {
        return next('Invalid Token');
    }
}

function getKey(header, callback) {
    client.getSigningKey(header.kid, async(err, key) => {
        var signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}