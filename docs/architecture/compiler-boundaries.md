# Compiler boundaries

Full Circle keeps authored components recognizable as ordinary React while the
compiler supplies the cross-component information TypeScript cannot infer from
source syntax alone.

## Stable component model

The public API stays centered on `createComponent`, `createStore`, `useStore`,
and `toStandaloneComponent`. Component definitions follow `deps`, `state`, and
`ui`: dependencies are declared, business logic runs in `state`, and rendering
stays in `ui`.

Effect is a runtime implementation dependency behind the package boundary. A
consumer should be able to install `full-circle` without separately installing
Effect. Do not add a public `full-circle-tsc` wrapper; ordinary TypeScript and
the supported compiler integrations have separate responsibilities.

## Two TypeScript modes

Ordinary `tsc` must remain usable without a Full Circle transform. Because it
cannot derive dependency object keys from variable names, the public types use
an intentionally permissive fallback for `deps`. That fallback preserves normal
application type-checking but does not promise exact requirement propagation.
See the fallback in
[`src/create-component.tsx`](../../src/create-component.tsx).

Exact dependency-aware types and requirement diagnostics are produced when the
compiler can analyze the project graph:

- The Vite integration lowers store names, dependency keys, provider
  implementations, component relationships, React Compiler annotations, and
  hot-reload identities. See
  [`src/compiler/lowering.ts`](../../src/compiler/lowering.ts) and
  [`src/compiler/vite.ts`](../../src/compiler/vite.ts).
- The optional TypeScript language-service plugin applies the same source model
  for editor types and hovers. See
  [`src/compiler/language-service.ts`](../../src/compiler/language-service.ts).
- `toStandaloneComponent` is the compile-time boundary where unresolved store
  requirements must be rejected. Requirement propagation and provider
  subtraction are compiler responsibilities, not conventions for user code to
  maintain manually.

## Verification boundaries

Keep the two modes explicit in tests:

- Runtime and ordinary-TypeScript compatibility live under
  [`test/runtime`](../../test/runtime) and the packed consumer fixture at
  [`test/fixtures/packed-consumer`](../../test/fixtures/packed-consumer).
- Requirement graph behavior lives in
  [`test/compiler/analyzer.test.ts`](../../test/compiler/analyzer.test.ts).
- Exact editor behavior lives in
  [`test/compiler/language-service.test.ts`](../../test/compiler/language-service.test.ts).
- The TanStack Start app in [`example`](../../example) exercises Vite, React
  Compiler, SSR, and selector-level rendering in an ordinary consumer shape.

Changes that make plain `tsc` depend on compiler-only inference, expose Effect
as a consumer-managed peer, or move requirement bookkeeping into authored React
code violate this boundary even if the transformed build still passes.
