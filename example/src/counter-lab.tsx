import { useState } from "react";

import { createComponent, createStore, toStandaloneComponent, useStore } from "full-circle";

interface CounterState {
  readonly count: number;
  readonly decrement: () => void;
  readonly increment: () => void;
  readonly reset: () => void;
}

const Counter = createStore<CounterState>();

const CurrentCount = createComponent({
  deps: [Counter],
  state: ({ deps }) => ({
    count: useStore(deps.counter, (store) => store.count),
  }),
  ui: ({ state }) => (
    <div className="counter-readout">
      <output aria-label="Current count">{String(state.count).padStart(2, "0")}</output>
      <div className="counter-meta">
        <span>Live selector</span>
        <strong>{state.count % 2 === 0 ? "EVEN" : "ODD"}</strong>
        <span>Re-renders on every count change.</span>
      </div>
    </div>
  ),
});

const CounterControls = createComponent({
  deps: [Counter],
  state: ({ deps }) => ({
    decrement: useStore(deps.counter, (store) => store.decrement),
    increment: useStore(deps.counter, (store) => store.increment),
    reset: useStore(deps.counter, (store) => store.reset),
  }),
  ui: ({ state }) => (
    <div className="control-strip">
      <button aria-label="Decrease count" onClick={state.decrement} type="button">
        − Decrement
      </button>
      <button aria-label="Increase count" onClick={state.increment} type="button">
        + Increment
      </button>
      <button onClick={state.reset} type="button">
        Reset
      </button>
    </div>
  ),
});

const Milestone = createComponent({
  deps: [Counter],
  state: ({ deps }) => ({
    group: useStore(deps.counter, (store) => Math.floor(store.count / 5)),
  }),
  ui: ({ state }) => (
    <section className="diagnostic-panel">
      <span className="panel-label">Milestone selector</span>
      <div className="milestone-value">
        <output>{state.group}</output>
        <span>
          Updates once
          <br />
          per five clicks
        </span>
      </div>
    </section>
  ),
});

const SelectorMap = createComponent({
  ui: () => (
    <section className="selector-map">
      <span className="panel-label">React Scan map</span>
      <div className="selector-row" data-tone="hot">
        <div>
          <strong>CurrentCount</strong>
          <span>Subscribes to count; expect an outline on every update.</span>
        </div>
      </div>
      <div className="selector-row" data-tone="cool">
        <div>
          <strong>CounterControls</strong>
          <span>Selects stable actions; it should stay quiet while count changes.</span>
        </div>
      </div>
      <div className="selector-row" data-tone="cool">
        <div>
          <strong>Milestone</strong>
          <span>Selects floor(count / 5); it updates only at each threshold.</span>
        </div>
      </div>
    </section>
  ),
});

const CounterExperience = createComponent({
  state: () => {
    const [count, setCount] = useState(0);
    const decrement = () => setCount((current) => current - 1);
    const increment = () => setCount((current) => current + 1);
    const reset = () => setCount(0);

    return { count, decrement, increment, reset };
  },
  ui: ({ state }) => (
    <Counter implements={() => state}>
      <main className="lab-shell">
        <div className="lab-frame">
          <header className="masthead">
            <strong>Full Circle // 0.1</strong>
            <span className="live-status">Instrumentation online</span>
          </header>

          <section className="intro-grid">
            <div>
              <span className="eyebrow">Selector isolation study</span>
              <h1>
                Render
                <br />
                <em>behavior.</em>
              </h1>
            </div>
            <p className="intro-copy">
              Open React Scan, change the count, and watch each subscriber independently. The
              component tree remains ordinary React; Full Circle tracks the requirements and store
              slices around it.
            </p>
          </section>

          <section className="dashboard">
            <div className="counter-stage">
              <CurrentCount />
              <CounterControls />
            </div>
            <aside className="diagnostics">
              <Milestone />
              <SelectorMap />
              <div className="diagnostic-panel static-note">
                This panel has no store dependency. It should not participate in counter updates.
              </div>
            </aside>
          </section>

          <footer className="footer-note">
            <span>TanStack Start diagnostic harness</span>
            <span>React Scan loads in development only</span>
          </footer>
        </div>
      </main>
    </Counter>
  ),
});

export const CounterLab = toStandaloneComponent(CounterExperience);
