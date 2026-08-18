import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    retries: 0,
    use: {
        baseURL: "http://localhost:3211",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: "npm run start -- --port 3211 --no-open",
        url: "http://localhost:3211",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
