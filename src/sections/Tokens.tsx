import {
  ChapterHead,
  TokenTable,
  DownloadChip,
} from "../components/guide/Guide";
import tokens from "../../brand/tokens.json";

interface TokenValue {
  $value: { light: string; dark: string } | string;
}

function resolve(v: string): string {
  const m = v.match(/^\{ref\.(.+)\}$/);
  if (!m) return v;
  const ref = (tokens.ref as Record<string, unknown>)[m[1]] as
    { $value: string } | undefined;
  return ref ? ref.$value : v;
}

export function Tokens() {
  const colorEntries = Object.entries(tokens.sys.color).filter(
    ([k]) => !k.startsWith("$"),
  ) as [string, TokenValue][];
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
    <>
      <ChapterHead num="12" title="Tokens" />
      <p className="mb-6 max-w-xl text-sm text-dim">
        Tokens er den eneste kilde til farve og form. Byg med --sys-rollerne,
        aldrig med rå værdier.
      </p>
      <TokenTable rows={rows} />
      <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <DownloadChip label="TOKENS.CSS" href="/exports/tokens.css" />
        <DownloadChip label="TOKENS.JSON" href="/exports/tokens.json" />
      </div>
    </>
  );
}
