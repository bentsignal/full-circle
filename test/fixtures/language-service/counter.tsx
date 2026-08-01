import { useState } from "react";

import { createComponent, createStore, useStore } from "full-circle";

export const Counter = createStore<{
  count: number;
  increment: () => void;
}>();

function useCounterImplementation() {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount((current) => current + 1) };
}

export const CounterControls = createComponent({
  deps: [Counter],
  state: ({ deps }) => ({
    count: useStore(deps.counter, (state) => state.count),
    increment: useStore(deps.counter, (state) => state.increment),
  }),
  ui: ({ state }) => (
    <button type="button" onClick={state.increment}>
      {state.count}
    </button>
  ),
});

export const CounterPanel = createComponent({
  ui: () => (
    <Counter implements={useCounterImplementation}>
      <CounterControls />
    </Counter>
  ),
});
