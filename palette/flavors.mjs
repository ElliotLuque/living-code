// ─────────────────────────────────────────────────────────────────────────────
// Living Code — the single source of truth.
// Every port in extras/, the Neovim plugin, palette.json and the preview are
// generated from this file by `node scripts/build.mjs`. Edit here, never there.
//
// Values are OKLCH [lightness 0–1, chroma, hue°]. Hex is derived (gamut-mapped
// by chroma reduction), so the OKLCH numbers stay canonical.
//
// Design rule — two temperatures, not a rainbow:
//   cool (teal → mint → aqua → steel) = structure: keywords, functions, types
//   warm (amber → copper)             = data: strings, numbers, constants
//   flare (red) is reserved for errors; punctuation sinks into the slate.
//   moss / orchid / rose exist for terminals, diffs and markup.
// ─────────────────────────────────────────────────────────────────────────────

const N = (L, C = 0.01, h = 240) => [L, C, h];

const nightNeutrals = {
  crust: N(0.1),
  base: N(0.13),
  mantle: N(0.16),
  surface0: N(0.2),
  surface1: N(0.25),
  surface2: N(0.32, 0.012),
  overlay: N(0.45, 0.012),
  comment: N(0.58, 0.012, 235),
  subtext: N(0.7023, 0.0065, 223.49),
  text2: N(0.85),
  text: N(0.93),
};

const nightAccents = {
  teal: [0.65, 0.15, 180], // the brand — UI accent, cursor, focus
  mint: [0.8, 0.12, 180], // keywords
  aqua: [0.86, 0.07, 192], // functions — teal washed toward text
  steel: [0.75, 0.07, 232], // types — the slate hue with a little chroma
  amber: [0.83, 0.115, 78], // strings
  copper: [0.72, 0.12, 48], // numbers, constants
  flare: [0.67, 0.165, 25], // errors only
  moss: [0.78, 0.12, 142], // success, diff add
  orchid: [0.72, 0.1, 318], // decorators, tags, ANSI magenta
  rose: [0.8, 0.06, 350], // rare
};

export const flavors = {
  night: {
    name: "Living Code Night",
    light: false,
    description:
      "The default. Dark slate ground, teal structure, amber data. Cool hues clustered around the brand teal carry structure; warm amber and copper carry data.",
    neutrals: nightNeutrals,
    accents: nightAccents,
  },

  signal: {
    name: "Living Code Signal",
    light: false,
    description:
      "Restraint. Teal keywords and one warm signal for every literal; everything else is carried by the slate ramp. Code reads like prose with highlights.",
    neutrals: nightNeutrals,
    accents: { ...nightAccents, steel: [0.8, 0.06, 200], amber: [0.8, 0.12, 70] },
    roles: {
      function: "text",
      string: "amber",
      number: "amber",
      constant: "amber",
      escape: "copper",
      regex: "amber",
      decorator: "teal",
      tag: "teal",
      link: "steel",
    },
    ansi: { blue: [0.75, 0.07, 232] },
  },

  frost: {
    name: "Living Code Frost",
    light: false,
    description:
      "Night on a lifted, bluer slate with a third less chroma. Calmer for long sessions; the warm/cool split survives at low saturation.",
    neutrals: {
      ...nightNeutrals,
      crust: N(0.14, 0.015, 245),
      base: N(0.17, 0.015, 245),
      mantle: N(0.2, 0.015, 245),
      surface0: N(0.23, 0.015, 245),
      surface1: N(0.28, 0.015, 245),
      surface2: N(0.35, 0.018, 245),
      comment: N(0.61, 0.012, 235), // lifted for AA on the lighter base
    },
    accents: Object.fromEntries(
      Object.entries(nightAccents).map(([k, [L, C, h]]) => [k, [Math.min(L + 0.02, 0.9), C * 0.65, h]]),
    ),
  },

  paper: {
    name: "Living Code Paper",
    light: true,
    description:
      "Daylight. Same two temperatures on near-white slate, lightness inverted so every syntax color keeps WCAG AA contrast.",
    neutrals: {
      crust: N(0.92, 0.008),
      base: N(0.975, 0.004),
      mantle: N(0.95, 0.006),
      surface0: N(0.93, 0.008),
      surface1: N(0.88, 0.01),
      surface2: N(0.84, 0.015),
      overlay: N(0.68, 0.012),
      comment: N(0.55, 0.012, 235),
      subtext: N(0.45, 0.01),
      text2: N(0.32),
      text: N(0.2),
    },
    accents: {
      teal: [0.53, 0.09, 180],
      mint: [0.47, 0.08, 182],
      aqua: [0.5, 0.075, 200],
      steel: [0.5, 0.09, 240],
      amber: [0.53, 0.105, 75],
      copper: [0.52, 0.12, 45],
      flare: [0.52, 0.13, 25],
      moss: [0.52, 0.12, 142],
      orchid: [0.52, 0.1, 318],
      rose: [0.52, 0.06, 350],
    },
  },
};

export const flavorOrder = ["night", "signal", "frost", "paper"];

// Semantic roles → palette color names. Flavors override via `roles`.
export const defaultRoles = {
  // surfaces & text
  bg: "base",
  bgAlt: "mantle",
  bgDeep: "crust",
  fg: "text",
  fgAlt: "text2",
  fgMuted: "subtext",
  fgSubtle: "comment",
  // UI
  accent: "teal",
  cursor: "teal",
  selection: "surface2",
  lineHighlight: "surface0",
  border: "surface1",
  borderActive: "teal",
  lineNumber: "overlay",
  lineNumberActive: "amber",
  match: "amber",
  // states
  error: "flare",
  warning: "amber",
  info: "steel",
  hint: "mint",
  success: "moss",
  added: "moss",
  removed: "flare",
  modified: "amber",
  // syntax
  keyword: "mint",
  builtin: "mint",
  function: "aqua",
  string: "amber",
  number: "copper",
  constant: "copper",
  escape: "copper",
  regex: "orchid",
  type: "steel",
  namespace: "steel",
  operator: "comment",
  punctuation: "overlay",
  decorator: "orchid",
  tag: "orchid",
  attribute: "text2",
  property: "text2",
  variable: "text",
  parameter: "text2",
  comment: "comment",
  // markup
  heading: "teal",
  link: "aqua",
  code: "amber",
  quote: "comment",
};

// Font styles per role (ports that support them).
export const roleStyles = {
  comment: "italic",
  parameter: "italic",
  builtin: "italic",
  quote: "italic",
  heading: "bold",
  link: "underline",
};

// ANSI 16. Strings are palette names; arrays are literal OKLCH. Missing bright
// colors are derived: dark flavors +0.08 lightness, light flavors −0.08.
export const defaultAnsi = {
  black: "surface1",
  red: "flare",
  green: "moss",
  yellow: "amber",
  blue: "steel",
  magenta: "orchid",
  cyan: "teal",
  white: "subtext",
  brightblack: "overlay",
  brightwhite: "text",
};
