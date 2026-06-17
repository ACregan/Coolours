import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
