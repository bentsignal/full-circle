import { useState } from "react";

import { createComponent, createStore, toStandaloneComponent, useStore } from "full-circle";

const Counter = createStore<{
  count: number;
}>();

const Readout = createComponent({
  deps: [Counter],
  state: ({ deps }) => ({
    count: useStore(deps.counter, (state) => state.count),
  }),
  ui: ({ state }) => <output>{state.count}</output>,
});

const App = createComponent({
  state: () => {
    const [count] = useState(0);
    return { count };
  },
  ui: ({ state }) => (
    <Counter implements={() => state}>
      <Readout />
    </Counter>
  ),
});

export default toStandaloneComponent(App);
