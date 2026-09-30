// default app configuration
const port = process.env.PORT || 4000;
let db = process.env.MONGODB_URI;

module.exports = {
    port,
    db,
    cookieSecret: process.env.COOKIE_SECRET,
    cryptoKey: process.env.CRYPTO_KEY,
    cryptoAlgo: "aes256",
    hostName: "localhost",
    environmentalScripts: []
};

