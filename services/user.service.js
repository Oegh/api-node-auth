const https = require('https');
const User = require('../model/user.model');
const refreshTokenService = require('../services/refresh-token.service');
const fs = require("fs");
const jwt = require('jsonwebtoken');
const authConfig = require('../configs/auth.config');

var authApiUser = async function(username, password) {
    const base64String = Buffer.from(username + ':' + password).toString('base64');

    const options = {
        hostname: 'api.cujae.edu.cu',
        port: 443,
        path: `/user/${username}`,
        method: 'GET',
        headers: {
            'Authorization': `Basic ${base64String}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            console.log(`status Code: ${res.statusCode}`);
            res.setEncoding('utf8');
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 401) {
                    responseBody = '{"errorCode": "401", "msg": "Could not verify your access level for that URL" }';
                    resolve(JSON.parse(responseBody));
                } else {
                    resolve(JSON.parse(responseBody));
                }

            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(base64String);
        req.end();
    });
};

var createUser = async function(username, password) {
    const userbd = await User.findOne({ username });

    if (!userbd) {
        return User.create({
            username,
            password,
        });
    }
    return userbd;
};

function generateJwtToken(user, audience) {
    const payload = {
        username: user.username,
    };

    var privateKEY = fs.readFileSync('private.key', 'utf8');

    var i = authConfig.issuer; // Issuer 
    var s = user.username; // Subject 
    var a = audience; // Audience
    // SIGNING OPTIONS
    var signOptions = {
        issuer: i,
        subject: s,
        audience: a,
        expiresIn: authConfig.jwtExpiration,
        algorithm: "RS256"
    };

    return jwt.sign(payload, privateKEY, signOptions);
}

async function generateRefreshJwtToken(user, audience, ip) {
    const payload = {
        username: user.username
    };

    var a = audience; // Audience

    var refreshToken = jwt.sign(payload, process.env.TOKEN_KEY, {
        expiresIn: authConfig.jwtRefreshExpiration,
        audience: a,
    });

    await refreshTokenService.createRefreshToken(user, refreshToken, ip);
    return refreshToken;
}

async function getUser(username) {
    const userbd = await User.findOne({ username });
    return await authApiUser(userbd.username, userbd.password);
}

async function findUserByUsername(username) {
    return await User.findOne({ username });
}

module.exports = {
    authApiUser: authApiUser,
    createUser: createUser,
    generateJwtToken: generateJwtToken,
    generateRefreshJwtToken: generateRefreshJwtToken,
    getUser: getUser,
    findUserByUsername: findUserByUsername,
};