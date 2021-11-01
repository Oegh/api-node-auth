const https = require('https');
const RefreshToken = require('../model/refresh-token.model');

async function findRefreshToken(token) {
    return await RefreshToken.findOne({ token });
}

async function stolenToken(stolenToken) {
    if (!stolenToken.revoked) {
        const update = {
            revoked: true
        };

        const doc = await RefreshToken.findByIdAndUpdate(stolenToken.id, update, {
            new: true
        });
        return doc;
    }

    const token = stolenToken.replacedByToken;
    if (!token) {
        return stolenToken;
    }

    const newStolenToken = await RefreshToken.findOne({ token });
    return await this.stolenToken(newStolenToken);
}

async function revokeToken(id, newToken, ipAddress) {
    const update = {
        revoked: true,
        replacedByToken: newToken,
        revokedByIp: ipAddress,
    };

    const doc = await RefreshToken.findByIdAndUpdate(id, update, {
        new: true
    });

    return doc;
}

async function createRefreshToken(user, refreshToken, ip) {
    return await RefreshToken.create({
        user: user.id,
        token: refreshToken,
        revoked: false,
        createdByIp: ip
    });
}

module.exports = {
    findRefreshToken: findRefreshToken,
    stolenToken: stolenToken,
    revokeToken: revokeToken,
    createRefreshToken: createRefreshToken
};