"use strict";

const { defineConfig } = require("cypress");
const { execFile } = require("child_process");
const path = require("path");
const { port, hostName } = require("./config/env/all");

module.exports = defineConfig({
    e2e: {
        baseUrl: `http://${hostName}:${port}`,
        blockHosts: "*:35729",
        fixturesFolder: "test/e2e/fixtures",
        specPattern: "test/e2e/integration/**/*.js",
        screenshotsFolder: "test/e2e/screenshots",
        videosFolder: "test/e2e/videos",
        supportFile: "test/e2e/support/index.js",
        setupNodeEvents(on) {
            on("task", {
                dbReset() {
                    return new Promise((resolve, reject) => {
                        execFile(process.execPath, [path.join(__dirname, "artifacts/db-reset.js")], {
                            cwd: __dirname,
                            env: { ...process.env, NODE_ENV: "test" }
                        }, (error, stdout, stderr) => {
                            if (error) {
                                reject(new Error(`${stderr}\n${stdout}`));
                                return;
                            }
                            resolve(null);
                        });
                    });
                }
            });
        },
        video: false
    }
});
