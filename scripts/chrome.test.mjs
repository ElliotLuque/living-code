import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { chromePackages, zipName } from "./package-chrome.mjs";
import { chrome, chromeTheme, firefox } from "./ports/browsers.mjs";
import { resolveAll } from "./resolve.mjs";

// Keys in Chromium's kOverwritableColorTable (browser_theme_pack.cc); Chrome drops anything else.
const CHROMIUM_COLOR_KEYS = new Set(["frame", "frame_inactive", "frame_incognito", "frame_incognito_inactive", "toolbar", "tab_text", "tab_background_text", "background_tab", "background_tab_inactive", "background_tab_incognito", "background_tab_incognito_inactive", "bookmark_text", "toolbar_button_icon", "button_background", "omnibox_background", "omnibox_text", "ntp_background", "ntp_header", "ntp_link", "ntp_text", "toolbar_text"]);

const flavors = resolveAll();
const shipped = flavors.filter((f) => f.id === "night" || f.id === "paper");
const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const isRgb = (a) => Array.isArray(a) && a.length === 3 && a.every((n) => Number.isInteger(n) && n >= 0 && n <= 255);
const REQUIRED_COLORS = ["frame", "toolbar", "tab_text", "tab_background_text", "bookmark_text", "omnibox_background", "omnibox_text", "ntp_background", "ntp_text"];

test("Chrome and Firefox ship exactly Night and Paper", () => {
  assert.deepEqual(shipped.map((f) => f.id), ["night", "paper"]);
  for (const port of [chrome, firefox]) {
    for (const f of flavors) assert.equal(port.files(f).length, shipped.includes(f) ? 1 : 0, `${port.id} ${f.id}`);
  }
});

for (const f of shipped) {
  test(`${f.name}: Chrome manifest has the required fields and RGB-array colors`, () => {
    const m = chromeTheme(f);
    assert.equal(m.manifest_version, 3);
    assert.equal(m.name, f.name);
    assert.match(m.version, /^\d+\.\d+\.\d+$/);
    assert.ok(m.description.length > 0 && m.description.length <= 132, "Chrome limits description to 132 characters");
    assert.deepEqual(Object.keys(m.icons), ["48", "128"]);
    for (const k of REQUIRED_COLORS) assert.ok(m.theme.colors[k], k);
    for (const k of Object.keys(m.theme.colors)) assert.ok(CHROMIUM_COLOR_KEYS.has(k), `Chromium ignores ${k}`);
    for (const [k, v] of Object.entries(m.theme.colors)) assert.ok(isRgb(v), `${k} = ${JSON.stringify(v)}`);
    assert.ok(m.theme.tints.buttons.every((n) => n === -1 || (n >= 0 && n <= 1)));
    assert.equal(typeof m.theme.properties.ntp_background_alignment, "string");
    const out = JSON.parse(chrome.files(f)[0].content);
    assert.deepEqual(out, m);
  });

  test(`${f.name}: Chrome colors match the Firefox theme`, () => {
    const ff = JSON.parse(firefox.files(f)[0].content).theme.colors;
    const toHex = (a) => "#" + a.map((n) => n.toString(16).padStart(2, "0")).join("");
    const cr = chromeTheme(f).theme.colors;
    assert.equal(toHex(cr.frame), ff.frame);
    assert.equal(toHex(cr.toolbar), ff.toolbar);
    assert.equal(toHex(cr.ntp_background), ff.ntp_background);
    assert.equal(toHex(cr.omnibox_background), ff.toolbar_field);
  });

  test(`${f.name}: Chrome icons are byte copies of the Firefox icons`, async () => {
    for (const n of [48, 128]) {
      const a = await readFile(new URL(`../extras/chrome/${f.slug}/icons/icon-${n}.png`, import.meta.url));
      const b = await readFile(new URL(`../extras/firefox/${f.slug}/icons/icon-${n}.png`, import.meta.url));
      assert.ok(a.equals(b), `icon-${n}.png`);
      assert.equal(a.readUInt32BE(16), n, "PNG width");
    }
  });
}

test("Chrome zips hold manifest.json at the root, once per shipped flavor", () => {
  const pkgs = chromePackages(flavors);
  assert.deepEqual(pkgs.map((p) => zipName(p.flavor)), ["living-code-chrome-night.zip", "living-code-chrome-paper.zip"]);
  for (const p of pkgs) assert.ok(p.entries.some((e) => e.path === "manifest.json"));
});

test("browser install text links straight to the AMO listings and never promises Frost or Signal", () => {
  assert.match(firefox.install, /addons\.mozilla\.org\/firefox\/addon\/living-code-night\//);
  assert.match(firefox.install, /addons\.mozilla\.org\/firefox\/addon\/living-code-paper\//);
  assert.doesNotMatch(firefox.install, /search\/\?q=/);
  for (const text of [firefox.install, chrome.install]) {
    assert.doesNotMatch(text, /Frost|Signal|—/);
  }
  assert.ok(readme.includes(chrome.install));
  assert.match(readme, /Browser themes \(Firefox and Chrome\) ship Night and Paper only/);
});
