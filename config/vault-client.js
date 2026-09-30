const http = require("http");
const { URL } = require("url");

function fetchVaultSecret() {
    return new Promise((resolve) => {
        const vaultAddr = process.env.VAULT_ADDR || "http://127.0.0.1:8200";
        const vaultToken = process.env.VAULT_TOKEN || "root-dev-token";
        const url = new URL("/v1/secret/data/nodegoat", vaultAddr);

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: "GET",
            headers: { "X-Vault-Token": vaultToken }
        };

        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.data && parsed.data.data) {
                        return resolve({
                            cookieSecret: parsed.data.data.cookieSecret,
                            cryptoKey: parsed.data.data.cryptoKey
                        });
                    }
                } catch (e) {
                    console.log("Vault response parse error, using fallback secrets:", e.message);
                }
                resolve(null);
            });
        });

        req.on("error", (err) => {
            console.log("Vault unreachable, using fallback secrets:", err.message);
            resolve(null);
        });

        req.setTimeout(3000, () => {
            req.destroy();
            resolve(null);
        });

        req.end();
    });
}

module.exports = { fetchVaultSecret };