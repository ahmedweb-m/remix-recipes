// app/root.tsx
import type { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts } from "@remix-run/react";

/**
 * We expect a static compiled Tailwind CSS at /styles/tailwind.css (public/styles/tailwind.css).
 * If you'd rather import via remix asset pipeline, re-add the import approach later.
 */
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/styles/tailwind.css" },
];

export default function App() {
  return (
    <html lang="en">
      <head>
         <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts /> {/* required for client hydration */}
      </body>
    </html>
  );
}
