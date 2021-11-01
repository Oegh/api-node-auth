module.exports = {
    secret: "bezkoder-secret-key",
    jwtExpiration: 3600, // 1 hour
    jwtRefreshExpiration: 259200, // 24 hours
    issuer: 'Node Auth Api',
    jwksUri: 'http://localhost:4001/jwks'

    /* for test */
    // jwtExpiration: 60,          // 1 minute
    // jwtRefreshExpiration: 120,  // 2 minutes
};