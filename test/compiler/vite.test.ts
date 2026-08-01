import { describe, expect, it } from "vitest";

import {
  createAnalysisModule,
  fullCircleAnalysisModuleId,
  fullCircleCompiler,
  formatFullCircleDiagnostics,
} from "../../src/compiler";

describe("fullCircleCompiler", () => {
  it("exposes analysis through a zero-codegen virtual module", () => {
    const plugin = fullCircleCompiler({ failOnDiagnostics: false });
    expect(plugin.name).toBe("full-circle");
    expect(plugin.resolveId).toBeTypeOf("function");
    expect(fullCircleAnalysisModuleId).toBe("virtual:full-circle-analysis");

    const module = createAnalysisModule({
      boundaries: [],
      components: [],
      diagnostics: [],
      hasErrors: false,
    });
    expect(module).toContain("export const analysis =");
    expect(module).toContain("export default analysis");
  });

  it("formats actionable build diagnostics", () => {
    const output = formatFullCircleDiagnostics([
      {
        code: "unresolved-root",
        fileName: "/project/app.tsx",
        location: { column: 14, line: 7 },
        message: "Auth is unresolved.",
      },
    ]);

    expect(output).toContain("/project/app.tsx:7:14 [unresolved-root] Auth is unresolved.");
  });
});
