// Perceptual color math, dependency-free. OKLab/OKLCH per Bjorn Ottosson's
// published formulas; WCAG relative luminance for the contrast gate.

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

export function rgbToHex([r, g, b]) {
  const c = (x) =>
    Math.round(Math.min(1, Math.max(0, x)) * 255)
      .toString(16)
      .padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}

const srgbToLinear = (c) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const linearToSrgb = (c) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

export function rgbToOklab([r, g, b]) {
  const [lr, lg, lb] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  const l = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb,
  );
  const m = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb,
  );
  const s = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb,
  );
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklabToRgb([L, a, b]) {
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  return [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export function hexToOklch(hex) {
  const [L, a, b] = rgbToOklab(hexToRgb(hex));
  return { L, C: Math.hypot(a, b), H: Math.atan2(b, a) };
}

// Gamut-safe OKLCH -> hex: reduce chroma until the color fits sRGB.
export function oklchToHex({ L, C, H }) {
  let c = C;
  for (let i = 0; i < 24; i++) {
    const rgb = oklabToRgb([L, c * Math.cos(H), c * Math.sin(H)]);
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005)) return rgbToHex(rgb);
    c *= 0.9;
  }
  return rgbToHex(oklabToRgb([L, 0, 0]));
}

// Perceptual color difference (OKLab distance scaled ~0-100).
export function deltaE(hexA, hexB) {
  const a = rgbToOklab(hexToRgb(hexA));
  const b = rgbToOklab(hexToRgb(hexB));
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 100;
}

export function wcagLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA, hexB) {
  const [l1, l2] = [wcagLuminance(hexA), wcagLuminance(hexB)].sort(
    (x, y) => y - x,
  );
  return (l1 + 0.05) / (l2 + 0.05);
}
