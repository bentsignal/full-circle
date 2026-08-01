import { createComponent } from "full-circle";

import { CounterPanel } from "./counter";

export const WorkspaceFrame = createComponent({
  ui: () => <CounterPanel />,
});
