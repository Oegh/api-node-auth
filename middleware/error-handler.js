function errorHandler(err, req, res, next) {
    switch (true) {
        case typeof err === 'string':
            if (err.toLowerCase().includes('input required')) {
                return res.status(400).json({ message: 'All input is required' });
            }

            if (err.toLowerCase().includes('token required')) {
                return res.status(403).json({ message: 'A token is required for authentication.' });
            }

            if (err.toLowerCase().includes('invalid')) {
                return res.status(401).json({ message: 'Invalid Token' });
            }

            if (err.toLowerCase().includes('reauthenticate')) {
                return res.status(401).json({ message: 'Re-Authenticate User' });
            }

            if (err.toLowerCase().includes('compromised')) {
                return res.status(403).json({ message: 'The user token has been compromised, Log-out users.' });
            }

            if (err.toLowerCase().includes('not revoked')) {
                return res.status(500).json({ message: 'The system could not revoke user please, Log-out users' });
            }
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            return res.status(statusCode).json({ message: 'Error' });
        case err.name === 'ValidationError':
            // mongoose validation error
            return res.status(400).json({ message: 'Not Found' });
        case err.name === 'UnauthorizedError':
            // jwt authentication error
            return res.status(401).json({ message: 'Unauthorized' });
        default:
            if (err.errorCode == 401) {
                return res.status(401).json(err);
            }
            return res.status(500).json({ message: err.message });
    }
}

module.exports = errorHandler;