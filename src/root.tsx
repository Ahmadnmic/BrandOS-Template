import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { ReactNode } from "react";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";
import "./app.css";
import { LensProvider, BRAND_DEFAULT_THEME } from "./lens";
import { Shell } from "./components/shell/Shell";

// Stamp the theme before paint: a stored contrast choice wins, otherwise
// the brand's own appearance from sys.theme.default.
const themeInit = `(function(){try{var t=localStorage.getItem("brandos-theme");if(t!=="dark"&&t!=="light")t="${BRAND_DEFAULT_THEME}";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","${BRAND_DEFAULT_THEME}");}})();`;

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
