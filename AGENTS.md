# Overview

Full Circle is a small TypeScript package for creating readable, performant, type-safe React components.

Keep the public API centered on `createComponent`, `createStore`, `useStore`,
and `toStandaloneComponent`. User code should remain ordinary React code. The
compiler owns requirement propagation, provider subtraction, React Compiler
annotations, and hot-reload bookkeeping.

Keep component definitions in the
`deps`, `state`, `ui` pipeline, with business logic in `state` and rendering in
`ui`.

## Sources of truth

- Start at [docs/README.md](docs/README.md) for the documentation map and
  [docs/architecture/compiler-boundaries.md](docs/architecture/compiler-boundaries.md)
  for the compiler/runtime contract.
- Treat current code and tests as authoritative for behavior. Use
  [GitHub Issues](https://github.com/bentsignal/full-circle/issues) for actionable
  work; do not create a second repository-local backlog.
- Keep project knowledge in versioned code, tests, and focused documentation.

Before committing, run:

```sh
bun run check
```
