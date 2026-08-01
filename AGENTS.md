# Overview

Full Circle is a small TypeScript package for creating readable, performant, type-safe React components.

Keep the public API centered on `createComponent`, `createStore`, `useStore`,
and `toStandaloneComponent`. User code should remain ordinary React code. The
compiler owns requirement propagation, provider subtraction, React Compiler
annotations, and hot-reload bookkeeping.

Keep component definitions in the
`deps`, `state`, `ui` pipeline, with business logic in `state` and rendering in
`ui`.

Before committing, run:

```sh
bun run check
```
