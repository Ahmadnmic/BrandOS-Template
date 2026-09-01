#!/usr/bin/env python3
"""
pdf_to_pages.py

Splits a PDF into one folder per page, each containing:
  - page-NN.md          reading-order text (headings/bold/lists preserved)
  - page-NN-layout.md   exact position of every text/image/vector element
  - page-NN-screenshot.png   full-page raster, for visual grounding
  - assets/images/      real embedded photos, original bytes untouched
  - assets/vectors/     vector-drawn art (logos, icons, backgrounds) as SVG
  - assets/fonts/       embedded font files used on that page

See the generated README.md in the output folder for the full naming and
coordinate-system reference.

Built on pymupdf4llm (https://pypi.org/project/pymupdf4llm/), which wraps
PyMuPDF's layout engine. Pure Python + a bundled C library -- no network
calls at runtime, no GPU, no external services. Once installed, this
script runs fully offline.

Install (do this once, while online):
    pip install pymupdf4llm

Usage:
    python pdf_to_pages.py input.pdf [output_dir]

    # or, with no arguments: drop PDF(s) into ./input/ and run with no args.
    # Each PDF gets its own output folder under ./output/<pdf-name>/
    python pdf_to_pages.py
"""

import re
import shutil
import sys
from pathlib import Path

import fitz  # PyMuPDF, bundled with pymupdf4llm
import pymupdf4llm

SCREENSHOT_DPI = 150

# pymupdf4llm never extracts an image's original file: every "image" it
# finds (real embedded photo or vector-drawn logo/icon alike) gets
# re-rendered from scratch via page.get_pixmap(clip=<detected bbox>, dpi=...).
# For a real embedded photo, that means decoding the original, drawing it,
# and re-sampling the crop at a fixed DPI -- which blurs it if the photo is
# placed at a size that needs more native pixels than that DPI provides
# (this deck's photos render out to ~3x their native resolution at 200 DPI).
# So for pages where we can cleanly identify each detected image as a real
# embedded photo, we pull the original bytes directly instead (see
# extract_native_page_images) and only fall back to this rendered DPI for
# the rare page where that match fails (see use_native below).
#
# We also pass ignore_graphics=True to to_markdown(), below: without it,
# pymupdf4llm treats vector-drawn art (logos, icon grids, decorative
# background shapes -- anything drawn as paths rather than a real embedded
# photo) as an "image" too, and (a) crops it to a heuristic bounding box
# that can cut off content bleeding past it, and (b) swallows any real
# text sitting on top of/near it into that same crop instead of keeping it
# as text in the markdown. Vector art has no "original file" to extract
# the way a photo does, so instead of a lossy, sometimes miscropped PNG
# render, we export it losslessly as SVG ourselves (see
# extract_vector_clusters / crop_svg) and keep real text as text.
VECTOR_RENDER_DPI = 400

try:
    # Reuses pymupdf4llm's own vector-graphics clustering/significance
    # logic so "what counts as a meaningful graphic" stays consistent with
    # how it used to be (mis)handled, instead of reinventing that heuristic.
    # These are undocumented internals of a third-party package, not its
    # public API -- if a future pymupdf4llm release renames or removes
    # them, we fall back to skipping vector-asset extraction rather than
    # crashing (see extract_vector_clusters).
    from pymupdf4llm.helpers.pymupdf_rag import is_significant, refine_boxes
except ImportError:
    is_significant = None
    refine_boxes = None


def slugify_page_num(n: int, total: int) -> str:
    width = max(2, len(str(total)))
    return str(n).zfill(width)


def sanitize_filename(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]", "_", name).strip("_") or "unnamed"


def clean_font_name(basefont: str) -> str:
    """Strip the random 6-letter PDF subset-font prefix (e.g. the
    "ABCDEF+" in "ABCDEF+Korolev-Light") so the extracted file is named
    after the actual typeface."""
    if len(basefont) > 7 and basefont[6] == "+" and basefont[:6].isalpha() and basefont[:6].isupper():
        basefont = basefont[7:]
    return sanitize_filename(basefont)


def get_page_background_color(page: fitz.Page):
    """Best-effort uniform background color, by sampling the four page
    corners -- used to exclude the background fill from vector-graphic
    detection so it isn't mistaken for a "graphic" of its own."""

    def corner(clip):
        pix = page.get_pixmap(clip=clip)
        if not pix.samples or not pix.is_unicolor:
            return None
        return pix.pixel(0, 0)

    r = page.rect
    corners = [
        corner((r.x0, r.y0, r.x0 + 10, r.y0 + 10)),
        corner((r.x1 - 10, r.y0, r.x1, r.y0 + 10)),
        corner((r.x0, r.y1 - 10, r.x0 + 10, r.y1)),
        corner((r.x1 - 10, r.y1 - 10, r.x1, r.y1)),
    ]
    if None in corners or len(set(corners)) != 1:
        return None
    c = corners[0]
    return (c[0] / 255, c[1] / 255, c[2] / 255)


def extract_native_page_images(doc: fitz.Document, page_index: int):
    """This page's real embedded raster images, original bytes untouched,
    in reading order (top-to-bottom, left-to-right). Returns a list of
    (bbox, ext, data) tuples, deduplicated by xref (the same image can be
    referenced more than once, e.g. as a repeated background)."""
    page = doc[page_index]
    seen_xrefs = set()
    entries = []
    for item in page.get_image_info(xrefs=True):
        xref = item.get("xref", 0)
        if not xref or xref in seen_xrefs:
            continue
        seen_xrefs.add(xref)
        entries.append((fitz.Rect(item["bbox"]), xref))
    entries.sort(key=lambda e: (round(e[0].y0, 1), round(e[0].x0, 1)))

    out = []
    for bbox, xref in entries:
        base = doc.extract_image(xref)
        out.append((bbox, base["ext"], base["image"]))
    return out


def _is_background_fill(path, bg_color, clip: fitz.Rect) -> bool:
    """True only for a fill that plausibly *is* the page background (a
    large rect the same color as it) -- not just any small shape that
    happens to share that color. Plenty of legitimate foreground art
    (e.g. a white logo/wordmark on a page with a white margin) is filled
    with the exact same color as the background; excluding every path of
    that color rather than just the actual background rect would strip
    those out of the vector-graphic detection too.
    """
    if bg_color is None or path["type"] != "f" or path["fill"] != bg_color:
        return False
    r = path["rect"]
    return r.width > 0.5 * clip.width and r.height > 0.5 * clip.height


def extract_vector_clusters(page: fitz.Page):
    """Bounding boxes of this page's meaningful vector-drawn graphics
    (logos, icons, decorative backgrounds) -- the same detection
    pymupdf4llm itself uses to decide what counts as a graphic, reused
    here so we export them as their own asset instead of skipping them.
    Returns a list of (bbox, member_paths) in reading order; member_paths
    is that cluster's own slice of page.get_drawings(), used elsewhere to
    fingerprint the shape for cross-page duplicate detection."""
    if is_significant is None or refine_boxes is None:
        return []

    clip = page.rect
    bg = get_page_background_color(page)
    paths = [
        p
        for p in page.get_drawings()
        if p["rect"] in clip
        and p["rect"].width < clip.width
        and p["rect"].height < clip.height
        and (p["rect"].width > 3 or p["rect"].height > 3)
        and not _is_background_fill(p, bg, clip)
    ]
    if not paths:
        return []

    clusters = page.cluster_drawings(drawings=paths)
    boxes = [b for b in clusters if is_significant(b, paths)]
    boxes = refine_boxes(boxes)
    boxes.sort(key=lambda b: (round(b.y0, 1), round(b.x0, 1)))
    return [(b, [p for p in paths if p["rect"] in b]) for b in boxes]


def cluster_shape_signature(bbox: fitz.Rect, member_paths):
    """A translation- and scale-invariant fingerprint for a vector
    cluster's shape: each member path's rect, expressed as a fraction of
    the cluster's own bbox and rounded to tolerate tiny placement noise.
    Fill color is deliberately ignored, since the same logo can recur in
    a different brand color (e.g. a "don't do this color" example) while
    still being the same graphic. Two clusters with the same signature
    are, for our purposes, the same graphic reused at a different place
    and/or size."""
    scale = max(bbox.width, bbox.height) or 1.0
    rects = tuple(
        sorted(
            (
                round((p["rect"].x0 - bbox.x0) / scale, 2),
                round((p["rect"].y0 - bbox.y0) / scale, 2),
                round((p["rect"].x1 - bbox.x0) / scale, 2),
                round((p["rect"].y1 - bbox.y0) / scale, 2),
            )
            for p in member_paths
        )
    )
    return (len(member_paths), rects)


_SVG_OPEN_TAG_RE = re.compile(r"^<svg[^>]*>")


def crop_svg(full_page_svg: str, bbox: fitz.Rect) -> str:
    """Restrict a full-page SVG (from page.get_svg_image()) to bbox by
    rewriting its viewBox -- every shape keeps its original coordinates
    and quality, only the visible window changes, so this is a lossless
    crop rather than a re-render."""
    new_tag = (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" '
        f'width="{bbox.width:.2f}" height="{bbox.height:.2f}" '
        f'viewBox="{bbox.x0:.2f} {bbox.y0:.2f} {bbox.width:.2f} {bbox.height:.2f}">'
    )
    return _SVG_OPEN_TAG_RE.sub(new_tag, full_page_svg, count=1)


def extract_page_fonts(doc: fitz.Document, page: fitz.Page):
    """Embedded font files actually used on this page, deduplicated by
    xref. Base-14 standard fonts (Helvetica etc.) aren't embedded in the
    PDF and have nothing to extract, so they're skipped."""
    seen_xrefs = set()
    out = []
    for xref, ext, _subtype, basefont, *_rest in page.get_fonts(full=True):
        if not xref or xref in seen_xrefs:
            continue
        seen_xrefs.add(xref)
        _name, font_ext, _type, data = doc.extract_font(xref)
        if not data:
            continue
        out.append((clean_font_name(basefont), font_ext or ext, data))
    return out


def promote_repeated_logo(doc, output_dir: Path, shape_occurrences, total_pages: int) -> str:
    """Find the vector-graphic shape that recurs identically (allowing
    for translation and uniform scaling, but not recoloring) on the most
    distinct pages, and save its largest occurrence -- the most detailed
    to look at, though as vector art every occurrence is equally lossless
    -- into a document-level global-assets/ folder as logo.svg/.png. A
    reused shape appearing on multiple pages is, in a brand guide, almost
    always the brand mark itself; anything that never repeats is left
    alone rather than guessed at."""
    candidates = []
    for sig, occurrences in shape_occurrences.items():
        pages_hit = {page_index for page_index, _bbox, _area in occurrences}
        if len(pages_hit) >= 2:
            candidates.append((len(pages_hit), occurrences))

    if not candidates:
        return (
            "No graphic repeats identically across pages "
            "(within translation/scale) -- skipping global-assets/logo."
        )

    candidates.sort(key=lambda c: c[0], reverse=True)
    page_count, occurrences = candidates[0]
    best_page_index, best_bbox, _area = max(occurrences, key=lambda o: o[2])

    global_dir = output_dir / "global-assets"
    global_dir.mkdir(parents=True, exist_ok=True)
    page = doc[best_page_index]
    full_svg = page.get_svg_image(text_as_path=1)
    svg_content = crop_svg(full_svg, best_bbox)
    (global_dir / "logo.svg").write_text(svg_content, encoding="utf-8")

    svg_doc = fitz.open(stream=svg_content.encode("utf-8"), filetype="svg")
    pix = svg_doc[0].get_pixmap(dpi=VECTOR_RENDER_DPI)
    pix.save(str(global_dir / "logo.png"))
    svg_doc.close()

    pages_hit = sorted({page_index + 1 for page_index, _b, _a in occurrences})
    (global_dir / "README.md").write_text(
        "# global-assets/\n\n"
        f"`logo.svg` / `logo.png` -- the vector graphic that recurs "
        f"identically (same shape, any size/position) on {page_count} of "
        f"this document's {total_pages} pages: "
        f"{', '.join(f'page-{slugify_page_num(n, total_pages)}' for n in pages_hit)}. "
        f"Saved from its largest occurrence "
        f"(page-{slugify_page_num(best_page_index + 1, total_pages)}). "
        "Detected automatically as \"whatever graphic repeats across the "
        "most pages\" -- verify it's actually the logo and not some other "
        "recurring decorative element before relying on it.\n",
        encoding="utf-8",
    )
    return (
        f"Global logo: found a shape repeated on {page_count} pages "
        f"-> global-assets/logo.svg (from page-{slugify_page_num(best_page_index + 1, total_pages)})"
    )


def extract_text_blocks(page: fitz.Page):
    """This page's text, at line granularity, with each line's exact
    bbox and the styling of its first span (font, size, color), in
    reading order. Line rather than paragraph/block granularity:
    PyMuPDF's block grouping joins same-row text into one block by y-band
    alone, which merges unrelated, widely-spaced fields (e.g. a running
    header's left/center/right labels) into one bogus full-width bbox.
    A line can technically mix styles across its spans (e.g. bold+light
    in one run); we take the first span's style as representative, which
    covers this deck -- true mixed-style lines would need splitting by
    span instead, at the cost of a noisier layout doc."""
    lines = []
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:  # 0 = text, 1 = image
            continue
        for line in block["lines"]:
            spans = line["spans"]
            text = "".join(span["text"] for span in spans).strip()
            if not text:
                continue
            style = spans[0]
            color = f"#{style['color']:06x}"
            lines.append((fitz.Rect(line["bbox"]), text, style["font"], style["size"], color))
    lines.sort(key=lambda b: (round(b[0].y0, 1), round(b[0].x0, 1)))
    return lines


def build_layout_markdown(page_slug: str, page: fitz.Page, elements):
    """elements: list of (bbox, kind, description, style) already in
    reading order, where kind is "text" / "image" / "vector" and style
    is a (font, size_pt, color_hex) tuple for text, None otherwise."""
    lines = [
        f"# {page_slug} layout",
        "",
        f"Page size: {page.rect.width:.1f} x {page.rect.height:.1f} pt "
        "(origin top-left, x right, y down; 1 pt = 1 CSS px in the React "
        "rebuild -- see AGENTS.md)",
        "",
        "| # | Type | Position x0,y0,x1,y1 (pt) | Size w x h (pt) | Font | Size (pt) | Color | Content / file |",
        "|---|------|---------------------------|------------------|------|-----------|-------|----------------|",
    ]
    for idx, (bbox, kind, description, style) in enumerate(elements, start=1):
        pos = f"{bbox.x0:.1f}, {bbox.y0:.1f}, {bbox.x1:.1f}, {bbox.y1:.1f}"
        size = f"{bbox.width:.1f} x {bbox.height:.1f}"
        font, font_size, color = style if style else ("", "", "")
        if kind == "text":
            description = description.replace("\n", " ").replace("|", "\\|")
            if len(description) > 120:
                description = description[:117] + "..."
            description = f"“{description}”"
        lines.append(
            f"| {idx} | {kind} | {pos} | {size} | {font} | {font_size} | {color} | {description} |"
        )
    lines.append("")
    return "\n".join(lines)


README_CONTENT = """\
# How to read this kit

Every PDF gets its own folder here, containing one subfolder per page.
Page folders are numbered `page-01`, `page-02`, ... (zero-padded to the
page count) in the PDF's original order.

## Per-page files

- **`page-NN.md`** -- the page's text, in reading order, with headings /
  bold / lists preserved as markdown. Real photos are referenced inline
  as `![](assets/images/img-NN.ext)` where they occur in the flow.
  Vector-drawn art (logos, decorative backgrounds) is *not* referenced
  here -- see `assets/vectors/` and the screenshot below instead.
- **`page-NN-layout.md`** -- every text line, photo and vector graphic
  on the page with its exact position, in PDF points (`pt`; 1 pt =
  1/72 inch). The coordinate origin is the page's **top-left corner**,
  x increases right, y increases *down*. Text rows also carry their
  font name, size (pt) and color (`#rrggbb`). Use this when you need to
  know exactly where and how something sits on the page, not just its
  reading order -- see `AGENTS.md` for the pixel-perfect rebuild this is
  meant to drive.
- **`page-NN-screenshot.png`** -- a full-page raster render (at
  {screenshot_dpi} DPI). This is the ground truth for what the page
  actually looks like, including any vector art that has no exact
  single-asset equivalent.

## `assets/`

- **`assets/images/img-NN.ext`** -- real embedded photos, extracted as
  their original file bytes (same JPEG/PNG the designer placed, same
  resolution, same quality -- not re-rendered or re-compressed).
  Numbered in reading order (top-to-bottom, left-to-right).
- **`assets/vectors/vec-NN.svg`** -- vector-drawn graphics (logos, icon
  sets, decorative shapes) that have no underlying photo file to
  extract. These are pulled out losslessly as SVG crops of the actual
  page geometry, so they scale to any size with no blur. Numbered in
  reading order.
- **`assets/fonts/FontName.ext`** -- embedded font files actually used
  on that page (subset-prefix stripped from the name). Standard fonts
  with nothing embedded in the PDF (e.g. base Helvetica) aren't included
  since there's no file to extract.

Any of the three `assets/` subfolders may be missing on a page that has
none of that content (e.g. a text-only page has no `images/` or
`vectors/`).

## `global-assets/` (document-level, not per-page)

If any vector graphic recurs identically (same shape, any position/size,
any color) across two or more pages, its largest occurrence is saved
here as `logo.svg` / `logo.png` -- in a brand guide this is almost
always the brand mark itself, reused throughout. `global-assets/README.md`
lists exactly which pages it was found on. This folder is only created
when such a repeat is actually found.

## Rebuilding a page from this kit

See **`AGENTS.md`** for the full task: turning a page's kit back into a
pixel-perfect React component.
"""


AGENTS_CONTENT = """\
# AGENTS.md -- rebuilding pages as React components

This file is for the agent (or engineer) whose job is to turn this kit
back into pixel-perfect, live React markup -- one component per PDF
page, matching the original design exactly. It assumes you've already
read `README.md` for what each file in a page's folder is.

The task has two phases, in order: **(1) clean the assets**, then
**(2) rebuild each page**. Do not skip phase 1 -- a background-stripped
asset is required for the rebuild to composite correctly.

## Phase 1: strip solid backgrounds out of the assets

`assets/vectors/*.svg` files are lossless crops of the *page's* vector
content within a bounding box -- which usually means each one still
contains its own little rectangular background fill (the navy/white/etc.
box behind the logo or icon in that region of the page), not just the
foreground graphic. If you composite that whole SVG onto a rebuilt page
as-is, you get an opaque rectangle stamped on top of whatever the page
background actually is there, hiding it.

For every file in every page's `assets/vectors/`:

1. Parse the SVG's shape elements (`<path>`, `<rect>`, etc.).
2. Find the one shape (there is usually at most one) whose bounding box
   covers close to the full `viewBox` (say, >90% of its width and
   height) and has a single solid `fill` color, no gradient/pattern.
   That is the background fill for this crop, not part of the logo.
3. Delete that shape (or set its `fill` to `none`/`transparent`).
   Leave every other shape untouched -- they're the actual graphic.
4. Save the result. The SVG's `viewBox`/`width`/`height` stay the same;
   only that one background shape is removed, so the graphic keeps its
   exact size and position.

If a vector file has *no* shape matching that "covers almost the whole
box, one solid color" description, there is nothing to strip -- leave it
as-is (this is normal for e.g. a graphic that's already just an icon
with no background box of its own).

`assets/images/*` (real photos) are generally left alone -- photographic
content rarely has a clean, single-color background to strip. If a
specific photo obviously does (e.g. a product shot on a flat studio
backdrop) and the rebuild needs it transparent, treat it as a case-by-
case background-removal task, not part of the default pipeline.

Do this stripping once per unique asset file and keep the cleaned
version (e.g. write it back in place, or into a parallel
`assets/vectors-clean/` -- your choice) so phase 2 can just reference
the cleaned files directly.

## Phase 2: rebuild each page as a React component

Goal: for each `page-NN`, produce a React component that renders
*exactly* like `page-NN-screenshot.png` -- same layout, same fonts, same
colors, same images, pixel for pixel. `page-NN-layout.md` is your
source of truth for where everything goes; the screenshot is your
source of truth for what "correct" looks like when you verify.

### 1. Set up the page container

Read the "Page size: W x H pt" line at the top of `page-NN-layout.md`.
Create an outer container exactly that size, treating **1 pt = 1 CSS
px** (a deliberate 1:1 mapping, not a physical unit conversion -- it
keeps every coordinate in the layout table directly usable as a pixel
value with no math):

```jsx
<div style={{
  position: "relative",
  width: "1500px",   // = Page size width from layout.md
  height: "842px",   // = Page size height from layout.md
  overflow: "hidden",
  background: "#ffffff", // or whatever the page's actual base color is
}}>
  {/* page-NN's elements go here, each absolutely positioned */}
</div>
```

The coordinate origin is the top-left corner (x right, y down) -- the
same convention CSS `position: absolute` with `top`/`left` already uses,
so no axis flipping is needed.

### 2. Place every element from the layout table

For each row in `page-NN-layout.md`, in any order (they don't need to
be in DOM order, since every one is absolutely positioned), render an
absolutely positioned element using that row's `x0, y0, x1, y1`:

```jsx
<div style={{
  position: "absolute",
  left: `${x0}px`,
  top: `${y0}px`,
  width: `${x1 - x0}px`,
  height: `${y1 - y0}px`,
}}>
  ...
</div>
```

What goes inside depends on the row's `Type` column:

- **`text`** -- render the `Content` column's text, styled with:
  - `font-family`: the `Font` column's value (see Phase 3 for loading
    it), falling back to a generic sans-serif if that font truly can't
    be loaded.
  - `font-size`: the `Size (pt)` column's value, in px (again 1:1).
  - `color`: the `Color` column's value (already `#rrggbb`).
  - `white-space: pre` and no manual line-wrapping -- the bbox height
    tells you if PyMuPDF already split this into one row per visual
    line (it did; each row here is one line). Don't let the browser
    reflow/wrap text inside the box; size the box to the text, not the
    other way around, since the position numbers are already exact.
  - Watch for `Content` values ending in `...` -- that means the
    original text was truncated for the table's readability. For those,
    go back to the corresponding text in `page-NN.md` (same page, same
    approximate reading position) to get the untruncated string.

- **`image`** -- an `<img>` (or CSS `background-image`) pointing at the
  `Content / file` column's path (`assets/images/img-NN.ext`), sized to
  exactly the row's bbox. These are the original, unmodified photo
  files -- no cleanup needed.

- **`vector`** -- the **background-stripped** version (Phase 1) of the
  file the `Content / file` column names (`assets/vectors/vec-NN.svg`),
  inlined as `<svg>` or via `<img src=...>`, sized to exactly the row's
  bbox. Using the cleaned version here is what lets the page's own
  background show through around the logo/icon shape instead of a
  stray colored box.

  If `global-assets/logo.svg` exists (check `global-assets/README.md`
  for which pages it was detected on) and this row is one of those
  occurrences, prefer reusing that shared file over the page's own
  `vec-NN.svg` copy, for consistency across pages.

### 3. Load the fonts

For every distinct `Font` value that appears in any layout table you're
using, add an `@font-face` pointing at `assets/fonts/<FontName>.<ext>`.

**Important caveat:** PDFs commonly embed fonts as a bare CFF/Type1
program (extracted here with a `.cff` extension), which is *not* a
complete font file a browser can load directly via `@font-face` --
browsers need a full SFNT-wrapped font (OTF/TTF) or WOFF/WOFF2. If you
hit `.cff` files:

- Convert them into a proper OTF/WOFF first (e.g. with the Python
  `fontTools` package: wrap the raw CFF table into an OTF container,
  then optionally compress to WOFF2) -- do this once per font, reuse the
  converted file everywhere that font is used.
- If conversion isn't practical, fall back to the closest available
  system/web font for that role and note the substitution -- don't
  silently ship a page where the custom brand font failed to load and
  the browser silently substituted its own default.

`.ttf` / `.otf` files extracted here (if any) can be used directly:

```css
@font-face {
  font-family: "Korolev-Bold";
  src: url("assets/fonts/Korolev-Bold.otf") format("opentype");
}
```

### 4. Verify against the screenshot

Once a page's component renders, take a screenshot of it (e.g. via a
headless browser) at the same pixel dimensions as the page container,
and compare it side-by-side (or with a pixel-diff tool) against
`page-NN-screenshot.png`. Check specifically for:

- Text sitting at the wrong position/size (usually a missed unit
  conversion, or a font that failed to load and changed line length).
- A vector graphic showing its old solid-color background box (Phase 1
  step skipped or missed a shape).
- Missing content -- cross-check the row count in `page-NN-layout.md`
  against what actually rendered.

Fix mismatches and re-check before moving to the next page. Do not
consider a page done on the basis of the code "looking right" alone --
confirm it visually against the screenshot.
"""


def write_readme(output_dir: Path):
    content = README_CONTENT.format(screenshot_dpi=SCREENSHOT_DPI)
    (output_dir / "README.md").write_text(content, encoding="utf-8")


def write_agents_doc(output_dir: Path):
    (output_dir / "AGENTS.md").write_text(AGENTS_CONTENT, encoding="utf-8")


def process_pdf(pdf_path: Path, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)

    # pymupdf4llm writes all extracted images into one flat folder, named
    # like "<pdfstem>-<0-based-page>-<index>.png". We point it at a scratch
    # folder, then move each image into its page's own assets/ folder.
    scratch_images = output_dir / "_scratch_images"
    if scratch_images.exists():
        shutil.rmtree(scratch_images)
    scratch_images.mkdir(parents=True)

    doc = fitz.open(str(pdf_path))

    print(f"Reading '{pdf_path.name}'...")
    chunks = pymupdf4llm.to_markdown(
        str(pdf_path),
        page_chunks=True,       # one dict per page
        write_images=True,      # extract real embedded images to files
        ignore_graphics=True,   # don't treat vector-drawn art as an "image"
        image_path=str(scratch_images),
        image_format="png",
        dpi=VECTOR_RENDER_DPI,
    )

    total_pages = len(chunks)
    print(f"{total_pages} pages found. Organizing into per-page folders...")

    # Every vector-cluster shape seen anywhere in the document, keyed by
    # cluster_shape_signature(), so the most-repeated one (almost always
    # the brand mark reused across pages) can be promoted to
    # global-assets/ after the per-page loop below. Value: list of
    # (page_index, bbox, area_pt2) for every occurrence of that shape.
    shape_occurrences = {}

    for i, chunk in enumerate(chunks):
        page = doc[i]
        page_num = i + 1
        page_slug = f"page-{slugify_page_num(page_num, total_pages)}"
        page_dir = output_dir / page_slug
        assets_dir = page_dir / "assets"
        images_dir = assets_dir / "images"
        vectors_dir = assets_dir / "vectors"
        fonts_dir = assets_dir / "fonts"
        page_dir.mkdir(parents=True, exist_ok=True)

        md_text = chunk.get("text", "").strip()
        layout_elements = []

        # --- real photos -----------------------------------------------
        # pymupdf4llm embeds image references directly in the markdown as
        # ![](scratch_images/filename.png), one per detected real photo
        # (vector art is excluded by ignore_graphics above), in the same
        # reading order it used for the surrounding text.
        refs = re.findall(r"!\[\]\(([^)]+)\)", md_text)

        # If every detected image on this page is a real embedded photo
        # (native count matches ref count 1:1), swap in the original file
        # bytes instead of pymupdf4llm's re-rendered crop -- exact original
        # quality, and no risk of the crop cutting off content that
        # overflows pymupdf4llm's detected bounding box. Pages with a
        # mismatch (e.g. a collage where pymupdf4llm's overlap heuristic
        # drops a real photo) fall back to the rendered crop below instead
        # of risking a wrong swap.
        native_images = extract_native_page_images(doc, i)
        use_native = len(refs) > 0 and len(native_images) == len(refs)

        if refs:
            images_dir.mkdir(parents=True, exist_ok=True)
        for idx, ref in enumerate(refs, start=1):
            if use_native:
                bbox, ext, data = native_images[idx - 1]
                dest_name = f"img-{str(idx).zfill(2)}.{ext}"
                (images_dir / dest_name).write_bytes(data)
                md_text = md_text.replace(ref, f"assets/images/{dest_name}")
                layout_elements.append((bbox, "image", f"assets/images/{dest_name}", None))
                continue

            src_path = Path(ref)
            if not src_path.exists():
                src_path = scratch_images / Path(ref).name
            if not src_path.exists():
                continue
            ext = src_path.suffix or ".png"
            dest_name = f"img-{str(idx).zfill(2)}{ext}"
            dest_path = images_dir / dest_name
            shutil.move(str(src_path), dest_path)
            md_text = md_text.replace(ref, f"assets/images/{dest_name}")
            # Position unknown for the rendered fallback (pymupdf4llm
            # doesn't hand back the bbox it cropped), so it's omitted
            # from the layout doc rather than guessed.

        # --- vector-drawn art --------------------------------------------
        vector_clusters = extract_vector_clusters(page)
        if vector_clusters:
            vectors_dir.mkdir(parents=True, exist_ok=True)
            full_svg = page.get_svg_image(text_as_path=1)
            for idx, (bbox, member_paths) in enumerate(vector_clusters, start=1):
                dest_name = f"vec-{str(idx).zfill(2)}.svg"
                (vectors_dir / dest_name).write_text(
                    crop_svg(full_svg, bbox), encoding="utf-8"
                )
                layout_elements.append((bbox, "vector", f"assets/vectors/{dest_name}", None))
                # At least 2 paths, so a lone rectangle/line doesn't count
                # as a distinctive shape when hunting for a repeated logo.
                if len(member_paths) >= 2:
                    sig = cluster_shape_signature(bbox, member_paths)
                    shape_occurrences.setdefault(sig, []).append(
                        (i, bbox, bbox.width * bbox.height)
                    )

        # --- fonts ---------------------------------------------------------
        page_fonts = extract_page_fonts(doc, page)
        if page_fonts:
            fonts_dir.mkdir(parents=True, exist_ok=True)
            used_names = set()
            for name, ext, data in page_fonts:
                dest_name = f"{name}.{ext}"
                n = 2
                while dest_name in used_names:
                    dest_name = f"{name}-{n}.{ext}"
                    n += 1
                used_names.add(dest_name)
                (fonts_dir / dest_name).write_bytes(data)

        # --- text blocks (for the layout doc only; page-NN.md keeps the
        # markdown text pymupdf4llm already produced above) --------------
        for bbox, text, font, font_size, color in extract_text_blocks(page):
            layout_elements.append((bbox, "text", text, (font, round(font_size, 1), color)))

        md_path = page_dir / f"{page_slug}.md"
        content = md_text if md_text else f"# {page_slug}\n\n"
        md_path.write_text(content, encoding="utf-8")

        layout_elements.sort(key=lambda e: (round(e[0].y0, 1), round(e[0].x0, 1)))
        layout_path = page_dir / f"{page_slug}-layout.md"
        layout_path.write_text(
            build_layout_markdown(page_slug, page, layout_elements), encoding="utf-8"
        )

        screenshot_path = page_dir / f"{page_slug}-screenshot.png"
        pix = page.get_pixmap(dpi=SCREENSHOT_DPI)
        pix.save(str(screenshot_path))

        img_count = len(refs)
        img_note = "original" if use_native else "rendered" if img_count else "none"
        print(
            f"  {page_slug}: {len(md_text.split())} words, "
            f"{img_count} image(s) [{img_note}], {len(vector_clusters)} vector(s), "
            f"{len(page_fonts)} font(s)"
        )

    logo_note = promote_repeated_logo(doc, output_dir, shape_occurrences, total_pages)
    print(logo_note)

    doc.close()

    write_readme(output_dir)
    write_agents_doc(output_dir)

    # Clean up scratch (anything left over that wasn't matched to a page)
    shutil.rmtree(scratch_images, ignore_errors=True)

    print(f"Done: {output_dir}\n")


def main():
    script_dir = Path(__file__).resolve().parent

    if len(sys.argv) >= 2:
        # Explicit usage: python pdf_to_pages.py input.pdf [output_dir]
        pdf_path = Path(sys.argv[1]).resolve()
        if not pdf_path.exists():
            print(f"File not found: {pdf_path}")
            sys.exit(1)
        output_dir = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else pdf_path.parent / "output"
        process_pdf(pdf_path, output_dir)
        return

    # No arguments: process every PDF found in ./input/
    input_dir = script_dir / "input"
    output_root = script_dir / "output"
    input_dir.mkdir(exist_ok=True)
    output_root.mkdir(exist_ok=True)

    pdfs = sorted(input_dir.glob("*.pdf"))
    if not pdfs:
        print(f"No PDFs found in {input_dir}")
        print("Drop a .pdf file in there and run this script again,")
        print("or run: python pdf_to_pages.py your-file.pdf [output_dir]")
        return

    print(f"Found {len(pdfs)} PDF(s) in {input_dir.name}/\n")
    for pdf_path in pdfs:
        out_dir = output_root / pdf_path.stem
        print(f"Processing '{pdf_path.name}' -> output/{pdf_path.stem}/")
        process_pdf(pdf_path, out_dir)


if __name__ == "__main__":
    main()
