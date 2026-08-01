import eslint from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

import { fullCircleProcessor } from "./tooling/eslint/full-circle-processor";
import { strictSyntaxRules } from "./tooling/eslint/strict-syntax";

export default defineConfig(
  {
    ignores: [
      "dist/**",
      "example/.output/**",
      "example/.tanstack/**",
      "example/dist/**",
      "example/node_modules/**",
      "node_modules/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,mts,cts}"],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      ...strictSyntaxRules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat["jsx-runtime"],
    settings: { react: { version: "detect" } },
  },
  reactHooks.configs.flat["recommended-latest"],
  {
    files: ["example/**/*.tsx", "src/**/*.tsx", "test/**/*.tsx"],
    processor: fullCircleProcessor,
  },
);
