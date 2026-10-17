import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { MIN_APP_VERSION, OBSIDIAN_VERSION, obsidian, obsidianVariables, SNIPPET_FLAVORS } from "./ports/obsidian.mjs";
import { SLACK_SLOTS, slack, slackFlavors, slackString } from "./ports/slack.mjs";
import { resolveAll } from "./resolve.mjs";

const flavors = resolveAll();
const read = (path) => readFile(new URL(`../extras/obsidian/${path}`, import.meta.url), "utf8");
const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

test("Obsidian manifest follows the theme spec", async () => {
  const m = JSON.parse(await read("manifest.json"));
  assert.equal(m.name, "Living Code");
  assert.match(m.version, /^\d+\.\d+\.\d+$/);
  assert.equal(m.version, OBSIDIAN_VERSION);
  assert.equal(m.minAppVersion, MIN_APP_VERSION);
  assert.equal(m.author, "Elliot Luque");
  assert.match(m.authorUrl, /^https:\/\//);
});

test("extras/obsidian is a theme repository root with a 512x288 screenshot", async () => {
  for (const file of ["manifest.json", "theme.css", "README.md", "LICENSE"]) assert.ok((await read(file)).length > 0, file);
  const png = await readFile(new URL("../extras/obsidian/screenshot.png", import.meta.url));
  assert.equal(png.toString("hex", 0, 8), "89504e470d0a1a0a");
  assert.equal(png.readUInt32BE(16), 512);
  assert.equal(png.readUInt32BE(20), 288);
});

test("theme.css styles dark as Night and light as Paper with balanced braces", async () => {
  const css = await read("theme.css");
  const night = flavors.find((f) => f.id === "night"), paper = flavors.find((f) => f.id === "paper");
  const block = (sel) => css.match(new RegExp(`\\${sel} \\{([^}]*)\\}`))?.[1] ?? "";
  assert.ok(block(".theme-dark").includes(`--background-primary: ${night.r("bg")};`));
  assert.ok(block(".theme-light").includes(`--background-primary: ${paper.r("bg")};`));
  assert.ok(block(".theme-dark").includes(`--text-accent: ${night.r("link")};`));
  assert.equal(css.split("{").length, css.split("}").length);
  for (const [k, v] of obsidianVariables(night)) assert.match(v, /^#[0-9a-f]{6}$/i, k);
});

test("Frost and Signal ship as dark-only snippets that redefine the same variables", async () => {
  assert.deepEqual(SNIPPET_FLAVORS, ["frost", "signal"]);
  const base = new Set(obsidianVariables(flavors[0]).map(([k]) => k));
  for (const id of SNIPPET_FLAVORS) {
    const f = flavors.find((x) => x.id === id);
    const css = await read(`snippets/${f.slug}.css`);
    assert.ok(!css.includes(".theme-light"));
    assert.ok(css.includes(`--background-primary: ${f.r("bg")};`));
    for (const k of base) assert.ok(css.includes(`${k}:`), `${id} ${k}`);
  }
  assert.equal(obsidian.files(flavors[0]).length, 0);
});

test("Obsidian install text names both routes", () => {
  assert.match(obsidian.install, /Settings → Appearance → Themes → Manage/);
  assert.match(obsidian.install, /<vault>\/\.obsidian\/themes\/Living Code\//);
  assert.doesNotMatch(obsidian.install, /—/);
  assert.ok(readme.includes(obsidian.install));
});

test("Slack strings are eight hex colors and no flavor is shipped twice", () => {
  const { unique, duplicates } = slackFlavors(flavors);
  assert.equal(unique.length + duplicates.length, flavors.length);
  const strings = unique.map(slackString);
  assert.equal(new Set(strings).size, strings.length);
  for (const s of strings) {
    const parts = s.split(",");
    assert.equal(parts.length, SLACK_SLOTS.length);
    for (const p of parts) assert.match(p, /^#[0-9a-f]{6}$/i);
  }
  const files = slack.all(flavors);
  assert.equal(files.length, unique.length);
  for (const f of unique) assert.ok(readme.includes(slackString(f)), f.id);
  assert.doesNotMatch(slack.install, /—/);
  assert.ok(readme.includes(slack.install));
});
