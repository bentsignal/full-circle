import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";

import type { FullCircleAnalysis, FullCircleDiagnostic, FullCircleRoot } from "./types.js";
import { analyzeFullCircle } from "./analyzer.js";
import { lowerFullCircleSources } from "./lowering.js";

export const fullCircleAnalysisModuleId = "virtual:full-circle-analysis";
const resolvedAnalysisModuleId = `\0${fullCircleAnalysisModuleId}`;
const sourcePattern = /\.[jt]sx?$/u;
const ignoredDirectories = new Set([".git", ".turbo", "build", "coverage", "dist", "node_modules"]);

export interface FullCircleCompilerPluginOptions {
  readonly failOnDiagnostics?: boolean;
  readonly roots?: readonly FullCircleRoot[];
  readonly scanRoots?: readonly string[];
  readonly transformUnscanned?: boolean;
}

export function fullCircleCompiler(options: FullCircleCompilerPluginOptions = {}) {
  const sources = new Map<string, string>();
  let viteRoot = process.cwd();
  let latestAnalysis = analyzeFullCircle({ sources: [] });

  const analyze = () => {
    latestAnalysis = analyzeFullCircle({
      roots: options.roots,
      sources: [...sources].map(([fileName, source]) => ({
        fileName,
        source,
      })),
    });
    return latestAnalysis;
  };

  return {
    name: "full-circle",
    enforce: "pre",

    configResolved(config) {
      viteRoot = config.root;
    },

    async buildStart() {
      sources.clear();
      const scanRoots = options.scanRoots?.length ? options.scanRoots : [viteRoot];

      for (const scanRoot of scanRoots) {
        await scanSourcePath({
          sourcePath: path.resolve(viteRoot, scanRoot),
          sources,
        });
      }

      const analysis = analyze();
      if (options.failOnDiagnostics !== false && analysis.hasErrors) {
        this.error(formatFullCircleDiagnostics(analysis.diagnostics));
      }
    },

    transform(source, id) {
      const fileName = stripViteQuery(id);
      if (
        isAnalyzableSource(fileName) &&
        !fileName.includes(`${path.sep}node_modules${path.sep}`)
      ) {
        const resolvedFileName = path.resolve(fileName);
        if (!sources.has(resolvedFileName) && !options.transformUnscanned) {
          return null;
        }
        if (sources.has(resolvedFileName)) {
          sources.set(resolvedFileName, source);
        }
        const lowered = lowerFullCircleSources(
          sources.has(resolvedFileName)
            ? [...sources].map(([sourceFileName, sourceText]) => ({
                fileName: sourceFileName,
                source: sourceText,
              }))
            : [{ fileName: resolvedFileName, source }],
        ).get(resolvedFileName);
        if (lowered && lowered.insertions.length > 0) {
          return {
            code: lowered.source,
            map: null,
          };
        }
      }
      return null;
    },

    resolveId(id) {
      return id === fullCircleAnalysisModuleId ? resolvedAnalysisModuleId : null;
    },

    load(id) {
      if (id !== resolvedAnalysisModuleId) {
        return null;
      }
      return createAnalysisModule(analyze());
    },

    async handleHotUpdate(context) {
      if (!isAnalyzableSource(context.file)) {
        return;
      }

      sources.set(path.resolve(context.file), await context.read());
      const analysisModule = context.server.moduleGraph.getModuleById(resolvedAnalysisModuleId);
      if (analysisModule) {
        context.server.moduleGraph.invalidateModule(analysisModule);
      }
    },

    api: {
      analyze,
    },
  } satisfies Plugin & {
    readonly api: {
      readonly analyze: () => FullCircleAnalysis;
    };
  };
}

export const fullCircle = fullCircleCompiler;

export function createAnalysisModule(analysis: FullCircleAnalysis) {
  const serialized = JSON.stringify(analysis).replaceAll("<", "\\u003c");
  return `export const analysis = ${serialized};\nexport default analysis;\n`;
}

export function formatFullCircleDiagnostics(diagnostics: readonly FullCircleDiagnostic[]) {
  return [
    "Full Circle requirement analysis failed:",
    ...diagnostics.map(
      (diagnostic) =>
        `${diagnostic.fileName}:${diagnostic.location.line}:${diagnostic.location.column} [${diagnostic.code}] ${diagnostic.message}`,
    ),
  ].join("\n");
}

async function scanSourcePath({
  sourcePath,
  sources,
}: {
  readonly sourcePath: string;
  readonly sources: Map<string, string>;
}) {
  const sourceStats = await stat(sourcePath);
  if (sourceStats.isFile()) {
    if (isAnalyzableSource(sourcePath)) {
      sources.set(path.resolve(sourcePath), await readFile(sourcePath, "utf8"));
    }
    return;
  }

  const entries = await readdir(sourcePath, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const fileName = path.join(sourcePath, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) {
          await scanSourcePath({ sourcePath: fileName, sources });
        }
        return;
      }

      if (entry.isFile() && isAnalyzableSource(fileName)) {
        sources.set(path.resolve(fileName), await readFile(fileName, "utf8"));
      }
    }),
  );
}

function isAnalyzableSource(fileName: string) {
  return sourcePattern.test(fileName) && !fileName.endsWith(".d.ts");
}

function stripViteQuery(id: string) {
  return id.split("?", 1)[0] ?? id;
}
