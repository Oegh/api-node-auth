const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');

router.post('/refresh-token', refreshToken);
router.get('/authenticate', authenticate);
router.get('/user', getUser);

module.exports = router;

async function authenticate(req, res, next) {
    // Get user input
    const base64String = req.headers.authorization;

    // Validate user input
    if (!base64String) {
        return next('input required');
    }

    const response = await userService.authApiUser(base64String);

    if (response.error) {
        res.status(401).send(response);
    } else {
        var accessToken = response.data.access_token;
        var refreshToken = response.data.refresh_token;

        res.status(200).json({
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }
}

async function getUser(req, res, next) {
    const authHeader = req.headers.authorization;

    console.log(authHeader);

    if (!authHeader) {
        return next('token required');
    }
    const token = authHeader && authHeader.split(' ')[1];
    const payloadBase64 = token.split('.')[1];
    const buff = Buffer.from(payloadBase64, 'base64');
    const username = JSON.parse(buff.toString('utf-8')).sub;
    console.log(username);

    try {
        const response = await userService.getUser(token, username);
        console.log(response);

        if (response.error) {
            res.status(401).send(response);
        } else {
            res.status(200).send(response);
        }

    } catch (err) {
        console.log(err);
        return next('invalid');
    }
}

async function refreshToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const refreshToken = req.body.refresh_token;

    if (!(refreshToken && authHeader)) {
        return next('reauthenticate');
    }

    const token = authHeader && authHeader.split(' ')[1];

    const response = await userService.refreshToken(token, refreshToken);

    if (response.error) {
        res.status(response.error).send(response);
    } else {
        res.status(200).send(response);
    }
}

// helper functions
// function setTokenCookie(res, token) {
//     // create http only cookie with refresh token that expires in 7 days
//     const cookieOptions = {
//         httpOnly: true,
//         expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         overwrite: true,
//     };
//     res.cookie('refreshToken', token, cookieOptions);
// }