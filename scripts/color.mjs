// Pure OKLCH color math (no Node APIs — also imported by the browser preview).

const rad = (d) => (d * Math.PI) / 180;

export function oklchToOklab([L, C, h]) {
  return [L, C * Math.cos(rad(h)), C * Math.sin(rad(h))];
}

export function oklabToOklch([L, a, b]) {
  const C = Math.hypot(a, b);
  const h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return [L, C, h];
}

export function oklchToLinearRgb(c) {
  const [L, a, b] = oklchToOklab(c);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const EPS = 1e-4;
export const inGamut = (c) => oklchToLinearRgb(c).every((x) => x > -EPS && x < 1 + EPS);

/** Map into sRGB by reducing chroma (keeps lightness and hue, like CSS Color 4). */
export function toGamut([L, C, h]) {
  if (inGamut([L, C, h])) return [L, C, h];
  let lo = 0, hi = C;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut([L, mid, h])) lo = mid; else hi = mid;
  }
  return [L, lo, h];
}

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const encode = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);

export function rgb(c) {
  return oklchToLinearRgb(toGamut(c)).map((x) => Math.round(clamp01(encode(clamp01(x))) * 255));
}

export const hex = (c) => "#" + rgb(c).map((x) => x.toString(16).padStart(2, "0")).join("");

export function luminance(c) {
  const [r, g, b] = oklchToLinearRgb(toGamut(c)).map(clamp01);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const round = (n, d) => +n.toFixed(d);
export const css = ([L, C, h]) =>
  `oklch(${round(L, 4)} ${round(C, 4)} ${round(((h % 360) + 360) % 360, 2)})`;

/** Interpolate in OKLab. t = 0 → a, t = 1 → b. */
export function mix(a, b, t) {
  const A = oklchToOklab(a), B = oklchToOklab(b);
  return oklabToOklch(A.map((v, i) => v + (B[i] - v) * t));
}
