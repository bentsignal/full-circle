<h1 align="center">Full Circle</h1>
<p align="center">A library for building readable, performant, type-safe React components</p>

## Installation

```sh
ni full-circle effect@beta
```

```sh
bun add full-circle effect@beta
```

```sh
pnpm add full-circle effect@beta
```

```sh
npm install full-circle effect@beta
```

## Why?

The goal of this project is to create:

1. Components that are easy to read & understand
2. Performant state management that is tracked by the type system

### Components 

Modern React code is far too often a homogenous soup of business logic and UI that becomes increasingly difficult for humans and agents to read as it grows in length and complexity. It doesn't have to be this way.

React was introduced with a simple idea: UI is a function of state. Full Circle
returns to that idea. A component's `ui` is literally a function
of the value returned by `state`.

By enforcing this pipeline:

1. `deps` declares the dependencies a component needs.
2. `state` contains business logic.
3. `ui` renders the result of `state`.

We gain a much clearer view of how our components work, and what they depend on. 

### State Management

React's context API is a subpar solution to state management. It has inherent performance issues and does not include context dependencies in the type system. Full circle addresses this by using selector functions, and by tracking dependencies in the component type signature. 

With React context, subscribing to a context subscribes you to all changes in that context, even if you only need a small piece of it. This causes unneccessary re-renders and leads to performance issues. With full circle, you only subscribe to the piece of the store you actually need. If your selector functions output doesn't change, you don't re-render.

Dependency tracking is solved under hood by [effect](https://www.effect.website/). When you add a store to the `deps` list, you will see it listed as a requirement in the component's type signature. If you use the component inside another component, that dependency will bubble up to the new parent component. If you wrap these dependent components with the Store, then the parent component's dependency will go away. By wrapping your applications root component with `createStandaloneComponent` (see example below), you assert that all dependencies are satisfied at compile time, instead of run time.

## Example

```tsx
import { useState } from "react";

import {
  createStore,
  useStore,
  defineProps
  createComponent,
  toStandaloneComponent,
} from "full-circle";

const Counter = createStore<{
  count: number;
  increment: () => void;
}>();

const CurrentCount = createComponent({
  deps: [Counter]

  state: ({ deps }) => ({
    count: useStore(deps.counter, (state) => state.count)
  }),

  ui: ({state}) => (
    <p>state.count</p>
  ),
})

const CounterButton = createComponent({
  deps: [Counter],

  props: defineProps<{
    className?: string;
    label: string;
  }>(),

  state: ({ deps, props }) => ({
    increment: useStore(deps.counter, (state) => state.increment),
    className,
    label
  }),

  ui: ({ state }) => (
    <button type="button" onClick={state.increment} className>
      {state.label}
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
      <CounterButton label="+1"/>
      <CurrentCount />
    </Counter>
  ),
});

// returns JSX, throws a type error
// if CounterApp has unsatisfied dependencies
export const SafeCounterApp = toStandaloneComponent(CounterApp);
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
