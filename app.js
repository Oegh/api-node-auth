require("dotenv").config();
require("./configs/database").connect();

const cors = require('cors');
const fs = require("fs");
const jose = require("node-jose");
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const express = require("express");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const User = require("./model/user");
const auth = require("./middleware/auth");

const userController = require("./controllers/userController");

const client = jwksClient({
    jwksUri: 'http://localhost:4001/jwks'
});

app.get('/jwks', async(req, res) => {
    const ks = fs.readFileSync("keys.json");
    const keyStore = await jose.JWK.asKeyStore(ks.toString());
    res.send(keyStore.toJSON());
});

app.post("/user", auth, async(req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    try {
        const username = jwt.decode(token).username;
        const userbd = await User.findOne({ username });
        const response = await userController.authApiUser(userbd.username, userbd.password);
        if (response.errorCode) {
            res.send(response);
        } else {
            res.status(200).send(response);
        }

    } catch (err) {
        return res.status(401).send('Invalid Tokensdf');
    }
});

app.post('/auth', async(req, res) => {
    try {
        // Get user input
        const { username, password, audience } = req.body;

        // Validate user input
        if (!(username && password && audience)) {
            res.status(400).send("All input is required");
        }

        // await User.findOneAndDelete({ username });

        const userbd = await User.findOne({ username });

        if (!userbd) {
            User.create({
                username,
                password,
            });
        }

        const response = await userController.authApiUser(username, password);

        if (response.errorCode) {
            res.send(response);
        }

        const payload = {
            username: username
        };

        var privateKEY = fs.readFileSync('private.key', 'utf8');

        var i = 'Api Cujae'; // Issuer 
        var s = username; // Subject 
        var a = audience; // Audience
        // SIGNING OPTIONS
        var signOptions = {
            issuer: i,
            subject: s,
            audience: a,
            expiresIn: "12h",
            algorithm: "RS256"
        };

        var token = jwt.sign(payload, privateKEY, signOptions);

        res.status(201).send({ token });
    } catch (err) {
        console.log(err);
    }
});

app.post('/verify', async(req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const { audience } = req.body;

    if (!(audience && token)) {
        res.status(400).send("All input is required");
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

        jwt.verify(token, getKey, verifyOptions, function(err, decoded) {
            if (err) {
                res.status(401).send('Invalid Token');
            }
            res.status(202).json({
                valid: true,
                decoded: decoded
            });
        });
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, async(err, key) => {
        var signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

module.exports = app;