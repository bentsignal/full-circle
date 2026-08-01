export interface FullCircleSource {
  readonly fileName: string;
  readonly source: string;
}

export interface FullCircleRoot {
  readonly componentName: string;
  readonly fileName: string;
}

export interface AnalyzeFullCircleOptions {
  readonly roots?: readonly FullCircleRoot[];
  readonly sources: readonly FullCircleSource[];
}

export interface SourceLocation {
  readonly column: number;
  readonly line: number;
}

export type AnalyzedComponentKind = "component";

export interface AnalyzedComponent {
  readonly dependencies: readonly string[];
  readonly directRequirements: readonly string[];
  readonly fileName: string;
  readonly id: string;
  readonly kind: AnalyzedComponentKind;
  readonly location: SourceLocation;
  readonly name: string;
  readonly providedRequirements: readonly string[];
  readonly requirements: readonly string[];
}

export type BoundaryKind = "explicit" | "react";

export interface ReactBoundary {
  readonly componentId: string;
  readonly componentName: string;
  readonly fileName: string;
  readonly id: string;
  readonly kind: BoundaryKind;
  readonly location: SourceLocation;
  readonly ownerName: string;
  readonly requirementPaths: Readonly<Record<string, readonly string[]>>;
  readonly requirements: readonly string[];
}

export type FullCircleDiagnosticCode =
  | "component-cycle"
  | "duplicate-component"
  | "duplicate-store"
  | "unresolved-analysis-reference"
  | "unresolved-root";

export interface FullCircleDiagnostic {
  readonly code: FullCircleDiagnosticCode;
  readonly fileName: string;
  readonly location: SourceLocation;
  readonly message: string;
}

export interface FullCircleAnalysis {
  readonly boundaries: readonly ReactBoundary[];
  readonly components: readonly AnalyzedComponent[];
  readonly diagnostics: readonly FullCircleDiagnostic[];
  readonly hasErrors: boolean;
}
