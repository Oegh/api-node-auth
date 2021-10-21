const https = require('https');

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
                    responseBody = '{"errorCode": "401", "msg": "Could not verify your access level for that URL." }';
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

module.exports = {
    authApiUser: authApiUser
};