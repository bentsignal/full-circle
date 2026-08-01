export { analyzeFullCircle } from "./analyzer.js";
export {
  createAnalysisModule,
  fullCircle,
  fullCircleAnalysisModuleId,
  fullCircleCompiler,
  formatFullCircleDiagnostics,
} from "./vite.js";
export {
  lowerFullCircleSources,
  loweredToOriginalPosition,
  originalToLoweredPosition,
  type LoweredFullCircleSource,
  type SourceInsertion,
} from "./lowering.js";
export { createFullCircleLanguageService } from "./language-service.js";
export type { FullCircleCompilerPluginOptions } from "./vite.js";
export type {
  AnalyzeFullCircleOptions,
  AnalyzedComponent,
  AnalyzedComponentKind,
  BoundaryKind,
  FullCircleAnalysis,
  FullCircleDiagnostic,
  FullCircleDiagnosticCode,
  FullCircleRoot,
  FullCircleSource,
  ReactBoundary,
  SourceLocation,
} from "./types.js";
