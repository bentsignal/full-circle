import { useState } from "react";

import { createComponent, createStore, toStandaloneComponent, useStore } from "../src";

export const Counter = createStore<{
  count: number;
  increment: () => void;
}>();

export const CounterButton = createComponent({
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

export const CounterApp = createComponent({
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

export const App = toStandaloneComponent(CounterApp);
