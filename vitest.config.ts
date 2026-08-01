import { defineConfig } from "vitest/config";

import { fullCircle } from "./src/compiler/vite";

export default defineConfig({
  plugins: [
    fullCircle({
      failOnDiagnostics: false,
      scanRoots: ["test/fixtures/components"],
    }),
  ],
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/runtime/setup.ts"],
  },
});
