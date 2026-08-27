import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { ReactNode } from "react";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";
import "./app.css";
import { LensProvider } from "./lens";
import { Shell } from "./components/shell/Shell";

const themeInit = `(function(){try{var t=localStorage.getItem("brandos-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="da" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <LensProvider>
      <Shell>
        <Outlet />
      </Shell>
    </LensProvider>
  );
}
