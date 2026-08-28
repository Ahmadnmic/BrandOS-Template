import { useState } from "react";
import type { ReactNode } from "react";
import { useLens } from "../../lens";
import tokens from "../../../brand/tokens.json";

// The brand's containment idiom drives how every guide component renders.
// "ruled": hairlines and whitespace, square, flush-left (editorial brands).
// "boxed": contained cards (only for brands whose own material is carded).
export const CONTAINMENT: "ruled" | "boxed" | "open" =
  (tokens.sys?.composition?.containment?.$value as
    "ruled" | "boxed" | "open") ?? "ruled";

const ruled = CONTAINMENT !== "boxed";

export function ChapterHead(props: {
  num: string;
  title: string;
  steps?: string;
}) {
  return (
    <div className="mb-10 border-b border-line pb-5">
      <div className="label mb-3 text-[10px]">
        {props.num} ·{" "}
        <span className="text-accent">{props.title.toUpperCase()}</span>
        {props.steps ? <span> · {props.steps}</span> : null}
      </div>
      <h1 className="display text-4xl font-bold md:text-5xl">{props.title}</h1>
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

// Color as composed fields: one continuous strip the way printed brand
// guides paint palettes, values in a ruled table below. Never chips in cards.
export function Palette(props: {
  colors: {
    name: string;
    hex: string;
    onHex: string;
    cmyk?: string;
    pms?: string;
  }[];
}) {
  return (
    <div>
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${props.colors.length}, 1fr)` }}
      >
        {props.colors.map((c) => (
          <div
            key={c.name}
            className="relative h-32 md:h-40"
            style={{ background: c.hex }}
          >
            <span
              className="absolute bottom-3 left-3 font-mono text-[10px] tracking-widest"
              style={{ color: c.onHex }}
            >
              {c.name.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <table className="w-full">
        <tbody>
          {props.colors.map((c) => (
            <tr key={c.name} className="border-b border-line">
              <td className="py-2.5 pr-4 font-mono text-[11px] tracking-widest">
                {c.name.toUpperCase()}
              </td>
              <td className="py-2.5 pr-4 font-mono text-[11px]">
                <CopyValue value={c.hex} label={"HEX " + c.hex} />
              </td>
              <td className="hidden py-2.5 pr-4 font-mono text-[11px] text-dim sm:table-cell">
                {c.cmyk ? "CMYK " + c.cmyk : ""}
              </td>
              <td className="hidden py-2.5 font-mono text-[11px] text-dim md:table-cell">
                {c.pms ? "PMS " + c.pms : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RatioBar(props: {
  parts: { name: string; pct: number; bg: string; fg: string }[];
}) {
  return (
    <div>
      <div className="label mb-2 text-[9px]">VÆGTNING I FLADEN</div>
      <div className="flex h-8">
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

// Download affordance. Only real artifacts render; an artifact that does not
// exist yet is absent from the guide, never announced. A local href
// downloads; an external href (the Figma library) opens in a new tab.
export function DownloadChip(props: { label: string; href?: string }) {
  if (!props.href) return null;
  const external = /^https?:\/\//.test(props.href);
  return (
    <a
      href={props.href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : { download: true })}
      className="label inline-flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[9px] text-accent hover:border-accent"
    >
      {external ? "↗" : "⇩"} {props.label}
    </a>
  );
}

// Usage rules the way every serious guide states them: GØR/UNDGÅ pairs,
// one imperative sentence per rule, ruled columns, no cards.
export function Rules(props: { dos: string[]; donts: string[] }) {
  return (
    <div className="grid gap-x-12 md:grid-cols-2">
      <div>
        <div className="label mb-1 text-[9px] text-accent">GØR</div>
        {props.dos.map((r) => (
          <p
            key={r}
            className="border-t border-line py-2.5 text-sm leading-snug"
          >
            {r}
          </p>
        ))}
      </div>
      <div className="mt-6 md:mt-0">
        <div className="label mb-1 text-[9px]">UNDGÅ</div>
        {props.donts.map((r) => (
          <p
            key={r}
            className="border-t border-line py-2.5 text-sm leading-snug text-dim"
          >
            {r}
          </p>
        ))}
      </div>
    </div>
  );
}

export function TokenTable(props: {
  rows: { token: string; role: string; light: string; dark: string }[];
}) {
  const { lens } = useLens();
  const [open, setOpen] = useState(false);
  // Dev lens: always expanded inline. Every other lens: one click away.
  if (lens !== "dev" && !open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="label border-t border-line py-3 text-left text-[9px] hover:text-accent"
      >
        VIS TOKEN-TABEL ▸
      </button>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full font-mono text-[11px]">
        <thead>
          <tr className="border-b border-line text-left">
            {["TOKEN", "ROLLE", "LYS", "MØRK"].map((h) => (
              <th
                key={h}
                className="label whitespace-nowrap py-2 pr-4 text-[8.5px] font-normal"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((r) => (
            <tr key={r.token} className="border-b border-line">
              <td className="whitespace-nowrap py-2 pr-4">
                <CopyValue value={r.token} label={r.token} />
              </td>
              <td className="whitespace-nowrap py-2 pr-4 text-dim">{r.role}</td>
              {[r.light, r.dark].map((v, i) => (
                <td key={i} className="whitespace-nowrap py-2 pr-4">
                  {/^#/.test(v) ? (
                    <span
                      className="mr-2 inline-block size-3 align-[-2px]"
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
    <div className="border-l-2 border-accent bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="label text-[8.5px]">{props.title}</span>
        <CopyValue value={props.code} label="KOPIÉR" />
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[11px] leading-relaxed">
        {props.code}
      </pre>
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
      {open ? (
        <div className="absolute left-0 top-full z-10 mt-2 w-80 shadow-xl">
          {block}
        </div>
      ) : null}
    </div>
  );
}

export function TypeSpecimen(props: {
  face: string;
  sample: string;
  children?: ReactNode;
}) {
  const { lens } = useLens();
  const size =
    lens === "design" ? "text-6xl md:text-8xl" : "text-5xl md:text-6xl";
  return (
    <div
      className={
        ruled
          ? "border-t border-line pt-5"
          : "rounded-md border border-line bg-panel p-5"
      }
    >
      <div className="label mb-4 text-[9px]">{props.face}</div>
      <div className={"display font-bold leading-tight " + size}>
        {props.sample}
      </div>
      {props.children}
    </div>
  );
}

// A ruled index row: the Brandpad-style numbered TOC line. The default way
// this template lists things; card grids exist only for boxed brands.
export function IndexRow(props: {
  num?: string;
  title: string;
  meta?: string;
  muted?: boolean;
}) {
  return (
    <div
      className={
        "group flex items-baseline gap-5 border-t border-line py-4 " +
        (props.muted ? "opacity-45" : "")
      }
    >
      {props.num ? (
        <span className="w-8 shrink-0 font-mono text-[11px] text-dim">
          {props.num}
        </span>
      ) : null}
      <span className="display text-lg font-bold md:text-xl">
        {props.title}
      </span>
      {props.meta ? (
        <span className="label ml-auto shrink-0 text-[9px]">{props.meta}</span>
      ) : (
        <span className="ml-auto font-mono text-dim opacity-0 transition-opacity group-hover:opacity-100">
          →
        </span>
      )}
    </div>
  );
}
