import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      vscode: path.resolve(__dirname, "test/mocks/vscode.ts")
    }
  },
  test: {
    include: ["test/unit/**/*.test.ts", "test/webview/**/*.test.ts"],
    exclude: ["dist/**", "dist-test/**", "node_modules/**"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"]
    }
  }
});
