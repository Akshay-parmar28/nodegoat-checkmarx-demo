// default app configuration
const required = (name) => {
    const v = process.env[name];
    if (!v) throw new Error(`Missing required environment variable: ${name}`);
    return v;
};

const port = process.env.PORT || 4000;
let db = process.env.MONGODB_URI || "mongodb://localhost:27017/nodegoat";

module.exports = {
    port,
    db,
    cookieSecret: required("COOKIE_SECRET"),
    cryptoKey: required("CRYPTO_KEY"),
    cryptoAlgo: "aes256",
    hostName: "localhost",
    environmentalScripts: []
};