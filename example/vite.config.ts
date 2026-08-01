import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { fullCircle } from "../src/compiler/vite";

const config = defineConfig({
  resolve: {
    alias: {
      "full-circle": fileURLToPath(new URL("../src/index.ts", import.meta.url)),
    },
    dedupe: ["react", "react-dom", "use-sync-external-store"],
  },
  plugins: [
    fullCircle(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});

export default config;
