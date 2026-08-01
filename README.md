<h1 align="center">Full Circle</h1>
<p align="center">Readable React components with type-safe dependencies.</p>

Full Circle gives React components a small, consistent shape:

1. `deps` declares the stores a component needs.
2. `state` contains hooks and business logic.
3. `ui` renders the result of `state`.

Store requirements stay in the component's type until a provider satisfies
them. Missing providers become type errors instead of runtime surprises.

Full Circle is experimental. The current release is intended for testing and
feedback, not production applications.

## Installation

```sh
bun add full-circle effect@beta
```

```sh
pnpm add full-circle effect@beta
```

```sh
npm install full-circle effect@beta
```

Full Circle requires React 19 and TypeScript.

## Example

```tsx
import { useState } from "react";

import {
  createComponent,
  createStore,
  toStandaloneComponent,
  useStore,
} from "full-circle";

const Counter = createStore<{
  count: number;
  increment: () => void;
}>();

const CounterButton = createComponent({
  deps: [Counter],

  state: ({ deps }) => ({
    count: useStore(deps.counter, (state) => state.count),
    increment: useStore(deps.counter, (state) => state.increment),
  }),

  ui: ({ state }) => (
    <button type="button" onClick={state.increment}>
      Count: {state.count}
    </button>
  ),
});

const CounterApp = createComponent({
  state: () => {
    const [count, setCount] = useState(0);
    return {
      count,
      increment: () => setCount((current) => current + 1),
    };
  },

  ui: ({ state }) => (
    <Counter implements={() => state}>
      <CounterButton />
    </Counter>
  ),
});

export default toStandaloneComponent(CounterApp);
```

`CounterButton` requires `Counter`. That requirement bubbles through ordinary
JSX until `CounterApp` provides an implementation. `toStandaloneComponent`
only accepts a tree with no requirements left, then returns a normal React
component for a route or application entry point.

Props enter through `state`, so `ui` remains a function of state:

```tsx
import { createComponent, defineProps } from "full-circle";

const Greeting = createComponent({
  props: defineProps<{ name: string }>(),
  state: ({ props }) => ({ message: `Hello, ${props.name}` }),
  ui: ({ state }) => <p>{state.message}</p>,
});
```

## Setup

Add the Full Circle plugin before React in your Vite config. React Compiler is
recommended so the `state` and `ui` functions are compiled like ordinary hooks
and components.

```ts
import react from "@vitejs/plugin-react";
import { fullCircle } from "full-circle/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    fullCircle(),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});
```

Add the TypeScript plugin for dependency-aware editor types:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "full-circle/typescript" }]
  }
}
```

Use Full Circle's checker in place of `tsc --noEmit`:

```json
{
  "scripts": {
    "typecheck": "full-circle-tsc -p tsconfig.json"
  }
}
```

## Why Full Circle?

React was introduced with a simple idea: UI is a function of state. Full Circle
returns to that idea directly. A component's `ui` field is literally a function
of the value returned by `state`, while dependencies remain visible to the type
system.

## License

MIT
