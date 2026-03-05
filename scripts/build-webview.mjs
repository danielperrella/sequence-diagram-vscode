import { build } from "esbuild";

await build({
  entryPoints: ["src/webview/runtime/index.ts"],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  sourcemap: true,
  outfile: "media/webview-runtime.js"
});
