import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  entry: {
    "compiler/index": "src/compiler/index.ts",
    "compiler/vite": "src/compiler/vite.ts",
    index: "src/index.ts",
  },
  external: [
    /^node:/u,
    "effect",
    "react",
    "react-dom",
    "typescript",
    "use-sync-external-store",
    "vite",
  ],
  format: "esm",
  platform: "neutral",
  sourcemap: true,
  target: "es2022",
});
