# Full Circle development

Full Circle is a small standalone TypeScript package, not a monorepo.

Keep the public API centered on `createComponent`, `createStore`, `useStore`,
and `toStandaloneComponent`. User code should remain ordinary React code. The
compiler owns requirement propagation, provider subtraction, React Compiler
annotations, and hot-reload bookkeeping.

Do not annotate function return types. Keep component definitions in the
`deps`, `state`, `ui` pipeline, with business logic in `state` and rendering in
`ui`.

Before committing, run:

```sh
bun run check
```
