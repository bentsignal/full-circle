import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { createFullCircleLanguageService } from "../../src/compiler";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const repositoryConfigFileName = path.join(repositoryRoot, "tsconfig.json");
const counterFileName = path.join(repositoryRoot, "examples/counter.tsx");
const multipleStoresFileName = path.join(repositoryRoot, "examples/multiple-stores.tsx");
const fixtureRoot = path.join(repositoryRoot, "test/fixtures/language-service");
const fixtureConfigFileName = path.join(fixtureRoot, "tsconfig.json");
const fixtureCounterFileName = path.join(fixtureRoot, "counter.tsx");
const fixtureFrameFileName = path.join(fixtureRoot, "frame.tsx");

describe("createFullCircleLanguageService", () => {
  it("makes missing analysis visible before the compiler runs", () => {
    const { service } = createService({
      configFileName: repositoryConfigFileName,
      lower: false,
      projectRoot: repositoryRoot,
    });
    const source = fs.readFileSync(counterFileName, "utf8");
    const quickInfo = quickInfoOf(service, source, counterFileName, "CounterButton");

    expect(quickInfo).toContain("FullCircleAnalysisRequired");
    expect(quickInfo).toContain("StoreRequirement<string,");
  }, 15_000);

  it("updates quick info when a provider is added or removed", () => {
    const project = createService({
      configFileName: repositoryConfigFileName,
      projectRoot: repositoryRoot,
    });
    const source = fs.readFileSync(counterFileName, "utf8");
    const withProvider = setCounterProvider(source, true);
    const withoutProvider = setCounterProvider(source, false);

    project.updateFile(counterFileName, withProvider);
    expect(quickInfoOf(project.service, withProvider, counterFileName, "CounterPanel")).toBe(
      "const CounterPanel: Component<ComponentRequirements<never>>",
    );

    project.updateFile(counterFileName, withoutProvider);
    expect(
      quickInfoOf(project.service, withoutProvider, counterFileName, "CounterPanel"),
    ).toContain('const CounterPanel: Component<ComponentRequirements<StoreRequirement<"Counter",');
  }, 15_000);

  it("invalidates unchanged parents when an imported child changes", () => {
    const project = createService({
      configFileName: fixtureConfigFileName,
      projectRoot: fixtureRoot,
    });
    const counterSource = fs.readFileSync(fixtureCounterFileName, "utf8");
    const frameSource = fs.readFileSync(fixtureFrameFileName, "utf8");

    project.updateFile(fixtureCounterFileName, setCounterProvider(counterSource, true));
    expect(quickInfoOf(project.service, frameSource, fixtureFrameFileName, "WorkspaceFrame")).toBe(
      "const WorkspaceFrame: Component<ComponentRequirements<never>>",
    );

    project.updateFile(fixtureCounterFileName, setCounterProvider(counterSource, false));
    expect(
      quickInfoOf(project.service, frameSource, fixtureFrameFileName, "WorkspaceFrame"),
    ).toContain(
      'const WorkspaceFrame: Component<ComponentRequirements<StoreRequirement<"Counter",',
    );
  }, 15_000);

  it("discovers lowercase components added after project load", () => {
    const project = createService({
      configFileName: repositoryConfigFileName,
      projectRoot: repositoryRoot,
    });
    const source = fs.readFileSync(counterFileName, "utf8");
    const withLowercaseComponent = `${source}

const testComponent = createComponent({
  ui: () => <CounterButton />,
});
`;

    project.updateFile(counterFileName, source);
    project.updateFile(counterFileName, withLowercaseComponent);

    expect(
      quickInfoOf(project.service, withLowercaseComponent, counterFileName, "testComponent"),
    ).toContain('const testComponent: Component<ComponentRequirements<StoreRequirement<"Counter",');
  }, 15_000);

  it("bubbles requirements through every JSX parent", () => {
    const { service } = createService({
      configFileName: repositoryConfigFileName,
      projectRoot: repositoryRoot,
    });
    const source = fs.readFileSync(counterFileName, "utf8");

    for (const name of ["CounterButton", "CounterRow", "CounterPanel", "CounterExample"]) {
      expect(quickInfoOf(service, source, counterFileName, name)).toContain(
        'StoreRequirement<"Counter", CounterState>',
      );
    }
  }, 15_000);

  it("subtracts only the requirements provided at each boundary", () => {
    const { service } = createService({
      configFileName: repositoryConfigFileName,
      projectRoot: repositoryRoot,
    });
    const source = fs.readFileSync(multipleStoresFileName, "utf8");

    expect(quickInfoOf(service, source, multipleStoresFileName, "IdentityBadge")).toContain(
      'StoreRequirement<"Viewer", ViewerState>',
    );
    expect(quickInfoOf(service, source, multipleStoresFileName, "IdentityBadge")).toContain(
      'StoreRequirement<"Theme", ThemeState>',
    );
    expect(
      quickInfoOf(service, source, multipleStoresFileName, "ViewerProvidedDashboard"),
    ).not.toContain('StoreRequirement<"Viewer", ViewerState>');
    expect(
      quickInfoOf(service, source, multipleStoresFileName, "ViewerAndThemeProvidedDashboard"),
    ).toContain('StoreRequirement<"Workspace", WorkspaceState>');
    expect(quickInfoOf(service, source, multipleStoresFileName, "FullyProvidedDashboard")).toBe(
      "const FullyProvidedDashboard: Component<ComponentRequirements<never>>",
    );
  }, 15_000);
});

function createService({
  configFileName,
  lower = true,
  projectRoot,
}: {
  configFileName: string;
  lower?: boolean;
  projectRoot: string;
}) {
  const sources = new Map<string, string>();
  const versions = new Map<string, number>();
  const config = ts.readConfigFile(configFileName, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    projectRoot,
    {},
    configFileName,
  );
  class ProjectHost implements ts.LanguageServiceHost {
    fileExists = ts.sys.fileExists;
    readDirectory = ts.sys.readDirectory;
    readFile = ts.sys.readFile;

    getCompilationSettings() {
      this.assertReceiver();
      return parsed.options;
    }

    getCurrentDirectory() {
      this.assertReceiver();
      return projectRoot;
    }

    getDefaultLibFileName(options: ts.CompilerOptions) {
      this.assertReceiver();
      return ts.getDefaultLibFilePath(options);
    }

    getProjectVersion() {
      this.assertReceiver();
      return "stable-project";
    }

    getScriptFileNames() {
      this.assertReceiver();
      return parsed.fileNames;
    }

    getScriptSnapshot(fileName: string) {
      this.assertReceiver();
      const source = sources.get(path.resolve(fileName)) ?? ts.sys.readFile(fileName);
      return source ? ts.ScriptSnapshot.fromString(source) : undefined;
    }

    getScriptVersion(fileName: string) {
      this.assertReceiver();
      return String(versions.get(path.resolve(fileName)) ?? 1);
    }

    private assertReceiver() {
      if (this !== host) {
        throw new Error("Project host method lost its receiver.");
      }
    }
  }

  const host = new ProjectHost();
  const underlyingService = ts.createLanguageService(host);
  const languageService = new Proxy(underlyingService, {
    get(target, property) {
      const value = Reflect.get(target, property, target) as unknown;
      if (typeof value !== "function") {
        return value;
      }
      return function (this: ts.LanguageService, ...args: unknown[]) {
        if (this !== languageService) {
          throw new Error("Language service method lost its receiver.");
        }
        return Reflect.apply(value, target, args);
      };
    },
  });
  const service = lower
    ? createFullCircleLanguageService({
        languageService,
        languageServiceHost: host,
        typescript: ts,
      })
    : languageService;
  return {
    service,
    updateFile(fileName: string, source: string) {
      const resolved = path.resolve(fileName);
      sources.set(resolved, source);
      versions.set(resolved, (versions.get(resolved) ?? 1) + 1);
    },
  };
}

function setCounterProvider(source: string, enabled: boolean) {
  const comment = enabled ? "" : "// ";
  return source
    .replace(
      /^(\s*)(?:\/\/ )?<Counter implements=\{useCounterImplementation\}>$/mu,
      `$1${comment}<Counter implements={useCounterImplementation}>`,
    )
    .replace(/^(\s*)(?:\/\/ )?<\/Counter>$/mu, `$1${comment}</Counter>`);
}

function quickInfoOf(service: ts.LanguageService, source: string, fileName: string, name: string) {
  const position = source.indexOf(`const ${name}`) + "const ".length;
  const quickInfo = service.getQuickInfoAtPosition(fileName, position);
  return ts.displayPartsToString(quickInfo?.displayParts);
}
