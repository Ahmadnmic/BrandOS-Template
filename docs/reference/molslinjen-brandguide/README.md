# Molslinjen guide, structural reference

This folder is a REFERENCE, not a template. It is an example of a clean
way to set up a scrolling brand guide, kept here so builders (human or
AI) can study the structure. Nothing in it may be copied into a brand
build as content: the colors, the wave graphic, the fonts, the copy and
every Molslinjen-specific decision belong to that brand alone.

## What to learn from it

- **The page model.** The whole guide is one scrolling document. Every
  chapter part is a `.page`: `min-height: 100vh`, flex-centered, one
  idea per page. See `src/App.jsx` and `src/styles/global.css`.
- **DOM-driven navigation.** Each page carries `data-page`,
  `data-label` and `data-chapter`. The bottom pager (`PageNav.jsx`)
  reads those attributes off the rendered document with an
  IntersectionObserver, so it stays correct when pages are added,
  removed or reordered. Nothing is registered twice.
- **Scroll-spy top nav.** `Nav.jsx` observes the section anchors and
  highlights the chapter you are in; the bar turns solid after 40px of
  scroll.
- **Data-driven content with an escape hatch.** Ordinary pages are
  plain data in `src/data/guide.js`, rendered by one `ContentPage.jsx`
  with a small block vocabulary (lead, p, list, cards, specs, rules,
  quote, images, note). Only pages where a control teaches the rule are
  components, listed in the `INTERACTIVE` map in `App.jsx`. That split
  keeps the guide writable without touching layout code.
- **One-shot reveal.** `useScrollReveal.js` adds `.is-visible` to
  `[data-reveal]` elements once and unobserves them; CSS handles the
  motion and `prefers-reduced-motion` turns it off entirely.
- **Honest image slots.** Missing photography renders as a dashed slot
  naming the intended motif (`ImageSlot.jsx`) instead of a stock photo
  or a fake.

## What NOT to take

Brand-specific everything: palette, wave device, Oswald/Barlow (stand-ins
for Korolev), tone, page order, the alternating dark/light rhythm as a
fixed rule. A BrandOS build derives all of that from the client's own
tokens and personality profile.

`LAES-MIG.txt` is the original hand-off note that shipped with the guide.
