# Full Circle example

A minimal TanStack Start app for exercising Full Circle's compiler integration and selector-based render behavior. React Scan loads automatically in development.

From the repository root:

```sh
bun run example:dev
```

Then open [http://localhost:3000](http://localhost:3000). Use the counter controls and inspect the React Scan outlines: `CurrentCount` updates with every count change, `Milestone` updates every five counts, and `CounterControls` keeps stable action subscriptions.
