import { ChapterHead, TokenTable } from "../components/guide/Guide";
import tokens from "../../brand/tokens.json";

export function meta() {
  return [{ title: "Tokens · Odense Basket BrandOS" }];
}

interface TokenValue {
  $value: { light: string; dark: string } | string;
}

function resolve(v: string): string {
  const m = v.match(/^\{ref\.(.+)\}$/);
  if (!m) return v;
  const ref = (tokens.ref as Record<string, unknown>)[m[1]] as { $value: string } | undefined;
  return ref ? ref.$value : v;
}

export default function Tokens() {
  const colorEntries = Object.entries(tokens.sys.color).filter(([k]) => !k.startsWith("$")) as [
    string,
    TokenValue,
  ][];
  const rows = colorEntries.map(([name, node]) => {
    const v = node.$value as { light: string; dark: string };
    return {
      token: "--sys-" + name,
      role: name,
      light: resolve(v.light),
      dark: resolve(v.dark),
    };
  });
  return (
    <div className="mx-auto max-w-4xl">
      <ChapterHead num="12" title="Tokens" steps="ROLLER · LYS/MØRK · EKSPORT" />
      <p className="mb-6 max-w-xl text-sm text-dim">
        Genereret direkte fra brand/tokens.json, siden kan ikke drifte fra koden. Klik på et
        token-navn for at kopiere det.
      </p>
      <TokenTable rows={rows} />
    </div>
  );
}
