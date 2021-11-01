const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
const refreshTokenService = require('../services/refresh-token.service');
const authMiddleware = require("../middleware/auth");
const refreshMiddleware = require("../middleware/refresh");
const jwt = require('jsonwebtoken');

router.post('/authenticate', authenticate);
router.post('/user', authMiddleware, getUser);
router.post('/refresh-token', refreshMiddleware, refreshToken);

module.exports = router;

async function authenticate(req, res, next) {
    // Get user input
    const { username, password, audience } = req.body;
    const ipAddress = req.ip;

    // Validate user input
    if (!(username && password && audience)) {
        return next('input required');
    }

    const response = await userService.authApiUser(username, password);

    if (response.errorCode) {
        return next(response);
    }

    const user = await userService.createUser(username, password);
    var accessToken = userService.generateJwtToken(user, audience);
    var refreshToken = await userService.generateRefreshJwtToken(user, audience, ipAddress);

    setTokenCookie(res, refreshToken);

    res.status(201).json({
        userId: user.id,
        username: username,
        accessToken: accessToken,
    });
}

async function getUser(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    try {
        const username = jwt.decode(token).username;
        const response = await userService.getUser(username);

        if (response.errorCode) {
            res.send(response);
        } else {
            res.status(200).send(response);
        }

    } catch (err) {
        return next('invalid');
    }
}

async function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    const user = await userService.findUserByUsername(jwt.decode(token).username);
    const audience = req.body.audience;

    const refreshToken = await refreshTokenService.findRefreshToken(token);
    if (!refreshToken) {
        return next('reauthenticate');
    }

    if (refreshToken.revoked) {
        await refreshTokenService.stolenToken(refreshToken);
        return next('token compromised');
    }

    var accessToken = userService.generateJwtToken(user, audience);
    var newRefreshToken = await userService.generateRefreshJwtToken(user, audience, ipAddress);

    const revokedToken = await refreshTokenService.revokeToken(refreshToken.id, newRefreshToken, ipAddress);
    if (!revokedToken.revoked) {
        return next('token not revoked');
    }

    setTokenCookie(res, newRefreshToken);

    res.status(200).json({
        userId: user.id,
        username: user.username,
        accessToken: accessToken,
    });
}

// helper functions
function setTokenCookie(res, token) {
    // create http only cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        overwrite: true,
    };
    res.cookie('refreshToken', token, cookieOptions);
}