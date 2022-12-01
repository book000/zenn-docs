import { PlaywrightTestConfig } from "@playwright/test";
const config: PlaywrightTestConfig = {
  webServer: {
    command: "npx zenn preview",
    cwd: process.env.GITHUB_WORKSPACE,
    port: 3000,
  },
  timeout: 0
};
export default config;
