// vitest.config.ts
import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true, // Enables 'describe', 'it', 'expect' without manual imports
    setupFiles: "./test/setup.ts", // Points to your global setup file
    exclude: [...configDefaults.exclude, "mcp/**"], // The MCP server runs its own tests
    coverage: {
      // Specify the provider you are using ('v8' or 'istanbul')
      provider: "v8",
      // Add the glob pattern for CSS modules to the exclude list
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "mcp/**",
        "**/*.module.css", // Excludes all .module.css files
      ],
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
