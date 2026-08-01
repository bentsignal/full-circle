import type ts from "typescript";

import { createFullCircleLanguageService } from "./language-service.js";

function initialize({ typescript }: { readonly typescript: typeof ts }) {
  return {
    create(info: ts.server.PluginCreateInfo) {
      if (!usesFullCircle(info)) {
        return info.languageService;
      }

      return createFullCircleLanguageService({
        languageService: info.languageService,
        languageServiceHost: info.languageServiceHost,
        typescript,
      });
    },
  } satisfies ts.server.PluginModule;
}

function usesFullCircle(info: ts.server.PluginCreateInfo) {
  const isConfigured =
    info.project
      .getCompilerOptions()
      .plugins?.some((plugin) => plugin.name === "full-circle/typescript") ?? false;
  if (isConfigured) {
    return true;
  }

  try {
    require.resolve("full-circle", {
      paths: [info.project.getCurrentDirectory()],
    });
    return true;
  } catch {
    // A global editor registration stays inert outside Full Circle projects.
  }

  return info.project.getFileNames().some((fileName) => {
    if (fileName.includes("/node_modules/") || !/\.[cm]?[jt]sx?$/u.test(fileName)) {
      return false;
    }
    const snapshot = info.languageServiceHost.getScriptSnapshot(fileName);
    return snapshot?.getText(0, snapshot.getLength()).includes("full-circle");
  });
}

export = initialize;
