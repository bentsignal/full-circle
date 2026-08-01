import type { ReactNode } from "react";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Full Circle · Render Lab",
      },
      {
        name: "description",
        content: "A focused TanStack Start harness for testing Full Circle store updates.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {import.meta.env.DEV ? (
          <script crossOrigin="anonymous" src="https://unpkg.com/react-scan/dist/auto.global.js" />
        ) : null}
      </head>
      <body>
        {children}

        <Scripts />
      </body>
    </html>
  );
}
