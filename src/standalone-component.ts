import type { FunctionComponent } from "react";

import type {
  Component,
  ComponentRequirements,
  ComponentWithProps,
  FullCircleAnalysisRequired,
} from "./create-component";

type EmptyProps = Record<string, never>;
type NoRequirements = ComponentRequirements<never>;
type PendingAnalysis = ComponentRequirements<FullCircleAnalysisRequired>;

interface ToStandaloneComponent {
  (component: Component<NoRequirements>): FunctionComponent<EmptyProps>;
  (component: Component<PendingAnalysis>): FunctionComponent<EmptyProps>;
  <Props>(component: ComponentWithProps<Props, NoRequirements>): FunctionComponent<Props>;
  <Props>(component: ComponentWithProps<Props, PendingAnalysis>): FunctionComponent<Props>;
}

/**
 * Converts a fully provided Full Circle tree into a standalone component.
 *
 * Components with unresolved store requirements fail this function's input
 * type after Full Circle analysis. Before analysis, the pending-analysis
 * overload lets ordinary `tsc` validate authored code without a custom checker.
 */
export const toStandaloneComponent = ((component: unknown) => component) as ToStandaloneComponent;
