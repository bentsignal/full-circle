import { createFileRoute } from "@tanstack/react-router";

import { CounterLab } from "#/counter-lab";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CounterLab />;
}
