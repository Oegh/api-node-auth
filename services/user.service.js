const https = require('https');

var authApiUser = async function(base64String) {
    const options = {
        hostname: 'apidev.cujae.edu.cu',
        port: 443,
        path: `/user/login`,
        method: 'GET',
        headers: {
            'Authorization': `${base64String}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            res.setEncoding('utf8');
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 401) {
                    responseBody = '{"error": "401", "msg": "Token Invalid" }';
                    resolve(JSON.parse(responseBody));
                } else {
                    resolve(JSON.parse(responseBody));
                }

            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
};

async function getUser(token, username) {
    const options = {
        hostname: 'apidev.cujae.edu.cu',
        port: 443,
        path: `/user/${username}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
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
                    responseBody = '{"error": "401", "msg": "Token invalid" }';
                    resolve(JSON.parse(responseBody));
                } else {
                    resolve(JSON.parse(responseBody));
                }

            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

async function refreshToken(token, refreshToken) {
    console.log(token);
    const data = new TextEncoder().encode(
        JSON.stringify({
            refresh_token: refreshToken
        })
    );

    const options = {
        hostname: 'apidev.cujae.edu.cu',
        port: 443,
        path: `/user/refresh-token`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length
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
                    responseBody = '{"error": "401", "msg": "Access Token invalid" }';
                    resolve(JSON.parse(responseBody));
                } else if (res.statusCode === 400) {
                    responseBody = '{"error": "400", "msg": "Token is still valid, cant be refreshed" }';
                    resolve(JSON.parse(responseBody));
                } else {
                    resolve(JSON.parse(responseBody));
                }

            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(data);
        req.end();
    });
}

module.exports = {
    authApiUser: authApiUser,
    getUser: getUser,
    refreshToken: refreshToken,
};