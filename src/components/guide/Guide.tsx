import { useState } from "react";
import type { ReactNode } from "react";
import { useLens } from "../../lens";

export function ChapterHead(props: { num: string; title: string; steps?: string }) {
  return (
    <div className="mb-6 border-b border-line pb-4">
      <div className="label mb-2 text-[10px]">
        {props.num} · <span className="text-accent">{props.title.toUpperCase()}</span>
        {props.steps ? <span> · {props.steps}</span> : null}
      </div>
      <h1 className="display text-3xl font-bold">{props.title}</h1>
    </div>
  );
}

export function CopyValue(props: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(props.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="font-mono text-[11px] text-dim hover:text-ink"
      title={"Kopiér " + (props.label ?? props.value)}
    >
      {copied ? "KOPIERET ✓" : (props.label ?? props.value) + " ⧉"}
    </button>
  );
}

export function ColorSwatch(props: {
  name: string;
  hex: string;
  cmyk?: string;
  pms?: string;
  onDark?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-line">
      <div className="h-20" style={{ background: props.hex }} />
      <div className="space-y-1 bg-panel px-3 py-2.5">
        <div className="flex items-center justify-between font-mono text-[11px] tracking-wider">
          <span>{props.name.toUpperCase()}</span>
          <CopyValue value={props.hex} label="⧉" />
        </div>
        <div className="font-mono text-[9.5px] leading-relaxed text-dim">
          HEX {props.hex}
          {props.cmyk ? <br /> : null}
          {props.cmyk ? "CMYK " + props.cmyk : null}
          {props.pms ? <br /> : null}
          {props.pms ? "PMS " + props.pms : null}
        </div>
      </div>
    </div>
  );
}

export function RatioBar(props: { parts: { name: string; pct: number; bg: string; fg: string }[] }) {
  return (
    <div>
      <div className="label mb-2 text-[9px]">VÆGTNING I FLADEN</div>
      <div className="flex h-7 overflow-hidden rounded-md border border-line">
        {props.parts.map((p) => (
          <span
            key={p.name}
            style={{ flexGrow: p.pct, background: p.bg, color: p.fg }}
            className="flex items-center justify-center font-mono text-[8.5px] tracking-wider"
          >
            {p.pct >= 10 ? `${p.name.toUpperCase()} ${p.pct}%` : `${p.pct}%`}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TokenTable(props: {
  rows: { token: string; role: string; light: string; dark: string }[];
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="w-full font-mono text-[10.5px]">
        <thead>
          <tr className="bg-panel text-left">
            {["TOKEN", "ROLLE", "LYS", "MØRK"].map((h) => (
              <th key={h} className="label whitespace-nowrap px-3 py-2 text-[8.5px]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((r) => (
            <tr key={r.token} className="border-t border-line">
              <td className="whitespace-nowrap px-3 py-1.5">
                <CopyValue value={r.token} label={r.token} />
              </td>
              <td className="whitespace-nowrap px-3 py-1.5 text-dim">{r.role}</td>
              {[r.light, r.dark].map((v, i) => (
                <td key={i} className="whitespace-nowrap px-3 py-1.5">
                  {/^#/.test(v) ? (
                    <span
                      className="mr-1.5 inline-block size-2.5 rounded-xs border border-line align-[-1px]"
                      style={{ background: v }}
                    />
                  ) : null}
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CodeBlock(props: { title: string; code: string }) {
  const { lens } = useLens();
  const [open, setOpen] = useState(false);
  const block = (
    <div className="relative rounded-md border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-3.5 py-2">
        <span className="label text-[8.5px]">{props.title}</span>
        <CopyValue value={props.code} label="KOPIÉR" />
      </div>
      <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[11px] leading-relaxed">{props.code}</pre>
    </div>
  );
  if (lens === "dev") return block;
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="rounded-md bg-action px-3.5 py-2 font-mono text-[10px] font-bold tracking-wider text-on-action"
      >
        {"</>"} KODE
      </button>
      {open ? <div className="absolute left-0 top-full z-10 mt-2 w-80 shadow-xl">{block}</div> : null}
    </div>
  );
}

export function TypeSpecimen(props: { face: string; sample: string; children?: ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-panel p-5">
      <div className="label mb-3 text-[9px]">{props.face}</div>
      <div className="display text-4xl font-bold leading-tight">{props.sample}</div>
      {props.children}
    </div>
  );
}
