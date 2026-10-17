import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { inflateRawSync } from "node:zlib";
import { buildSublimePackage, crc32, zip } from "./package-sublime.mjs";
import { SCOPES, tmtheme } from "./ports/editors.mjs";
import { generate, groups } from "./ports/index.mjs";
import { SUBLIME_SCOPES, sublime } from "./ports/sublime.mjs";
import { resolveAll } from "./resolve.mjs";

const flavors = resolveAll();
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const schemePath = (f) => `extras/sublime/${f.slug}.sublime-color-scheme`;
const schemes = new Map(flavors.map((f) => [f.id, JSON.parse(sublime.files(f)[0].content)]));

// Contracts below come from https://www.sublimetext.com/docs/color_schemes.html
const GLOBAL_COLOR_KEYS = new Set([
  "background", "foreground", "invisibles", "caret", "block_caret", "block_caret_border", "block_caret_underline",
  "line_highlight", "misspelling", "fold_marker", "minimap_border", "accent",
  "gutter", "gutter_foreground", "gutter_foreground_highlight",
  "line_diff_added", "line_diff_modified", "line_diff_deleted",
  "selection", "selection_foreground", "selection_border", "inactive_selection", "inactive_selection_border", "inactive_selection_foreground",
  "highlight", "find_highlight", "find_highlight_foreground", "scroll_highlight", "scroll_selected_highlight",
  "rulers", "guide", "active_guide", "stack_guide",
  "brackets_foreground", "bracket_contents_foreground", "tags_foreground", "shadow",
]);
const GLOBAL_NUMBER_KEYS = new Set(["line_diff_width", "selection_border_width", "selection_corner_radius", "block_caret_corner_radius", "shadow_width"]);
const GLOBAL_STRING_KEYS = new Map([
  ["brackets_options", ["underline", "stippled_underline", "squiggly_underline", "foreground", "bold", "italic"]],
  ["bracket_contents_options", ["underline", "stippled_underline", "squiggly_underline", "foreground"]],
  ["tags_options", ["underline", "stippled_underline", "squiggly_underline", "foreground"]],
  ["selection_corner_style", ["round", "cut", "square"]],
  ["block_caret_corner_style", ["round", "cut", "square"]],
]);
const GLOBAL_OTHER_KEYS = new Set(["popup_css", "phantom_css", "sheet_css"]);
const RULE_KEYS = new Set(["name", "scope", "foreground", "background", "foreground_adjust", "selection_foreground", "font_style"]);
const FONT_STYLES = new Set(["bold", "italic", "glow", "underline", "stippled_underline", "squiggly_underline"]);

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const VAR = /^var\(([^()\s]+)\)$/;
const isColor = (value) =>
  HEX.test(value) ||
  VAR.test(value) ||
  /^(?:rgba?|hsla?|hwb)\([^()]*\)$/.test(value) ||
  /^color\(var\([^()\s]+\)(?: (?:blenda?|alpha|a|saturation|s|lightness|l|min-contrast)\([^()]*(?:\([^()]*\))?[^()]*\))*\)$/.test(value);

function resolve(value, variables) {
  const m = VAR.exec(value);
  return m ? variables[m[1]] : value;
}

test("Sublime port is registered in Editors and writes one scheme per flavor", async () => {
  assert.ok(groups.find((g) => g.title === "Editors").ports.includes(sublime));
  assert.equal(sublime.id, "sublime");
  assert.equal(sublime.name, "Sublime Text");
  assert.equal(sublime.homepage, "https://www.sublimetext.com");
  assert.equal("npm" in sublime, false);
  const files = generate(flavors).filter((file) => file.path.startsWith("extras/sublime/"));
  assert.deepEqual(files.map((file) => file.path), flavors.map(schemePath));
  for (const file of files) {
    assert.equal(typeof file.content, "string");
    assert.equal(await read(file.path), file.content, `${file.path} is stale; run node scripts/build.mjs`);
  }
});

test("schemes parse as strict JSON with name, author, variables, globals and rules", () => {
  const names = new Set();
  for (const f of flavors) {
    const scheme = schemes.get(f.id);
    assert.deepEqual(Object.keys(scheme), ["name", "author", "variables", "globals", "rules"]);
    assert.equal(scheme.name, f.name);
    assert.equal(typeof scheme.author, "string");
    assert.ok(Array.isArray(scheme.rules) && scheme.rules.length > 0);
    names.add(scheme.name);
  }
  assert.equal(names.size, flavors.length);
  assert.deepEqual([...names], ["Living Code Night", "Living Code Frost", "Living Code Paper", "Living Code Signal"]);
});

test("every var() reference resolves and every value is a valid color or documented type", () => {
  for (const f of flavors) {
    const { variables, globals, rules } = schemes.get(f.id);
    for (const [name, value] of Object.entries(variables)) {
      assert.match(name, /^[A-Za-z0-9_]+$/);
      assert.match(value, HEX, `${f.id} variable ${name}`);
    }
    const used = new Set();
    const check = (where, value) => {
      assert.ok(isColor(value), `${f.id} ${where}: ${value}`);
      for (const [, ref] of value.matchAll(/var\(([^()\s]+)\)/g)) {
        used.add(ref);
        assert.ok(ref in variables, `${f.id} ${where}: undefined variable ${ref}`);
      }
    };
    for (const [key, value] of Object.entries(globals)) {
      if (GLOBAL_COLOR_KEYS.has(key)) check(`globals.${key}`, value);
      else if (GLOBAL_NUMBER_KEYS.has(key)) assert.equal(typeof value, "number", key);
      else if (GLOBAL_STRING_KEYS.has(key)) {
        for (const option of value.split(" ")) assert.ok(GLOBAL_STRING_KEYS.get(key).includes(option), `${key}: ${option}`);
      } else assert.ok(GLOBAL_OTHER_KEYS.has(key), `${f.id}: unknown global ${key}`);
    }
    for (const rule of rules) {
      assert.equal(typeof rule.scope, "string");
      assert.ok(rule.scope.length > 0);
      for (const key of Object.keys(rule)) assert.ok(RULE_KEYS.has(key), `${f.id}: unknown rule key ${key}`);
      for (const key of ["foreground", "background"]) if (key in rule) check(`${rule.scope}.${key}`, rule[key]);
      if ("foreground_adjust" in rule) assert.ok("background" in rule, "foreground_adjust needs background");
      if ("font_style" in rule) {
        for (const style of rule.font_style.split(" ")) assert.ok(FONT_STYLES.has(style), `${f.id} ${rule.scope}: ${style}`);
      }
      assert.ok("foreground" in rule || "background" in rule || "font_style" in rule, `${rule.scope} has no style`);
    }
    assert.ok(used.size > 0);
  }
});

test("globals include the documented essentials and equal the resolved roles", () => {
  for (const f of flavors) {
    const { variables, globals } = schemes.get(f.id);
    const g = (key) => resolve(globals[key], variables);
    for (const key of ["background", "foreground", "caret", "selection", "line_highlight", "gutter", "gutter_foreground", "find_highlight", "guide", "active_guide", "stack_guide", "misspelling", "shadow", "accent"]) {
      assert.ok(key in globals, `${f.id}: missing global ${key}`);
    }
    assert.equal(g("background"), f.r("bg"));
    assert.equal(g("foreground"), f.r("fg"));
    assert.equal(g("caret"), f.r("cursor"));
    assert.equal(g("line_highlight"), f.r("lineHighlight"));
    assert.equal(g("selection"), f.r("selection"));
    assert.equal(g("gutter"), f.r("bg"));
    assert.equal(g("gutter_foreground"), f.r("lineNumber"));
    assert.equal(g("gutter_foreground_highlight"), f.r("lineNumberActive"));
    assert.equal(g("find_highlight"), f.r("match"));
    assert.equal(g("brackets_foreground"), f.r("accent"));
    assert.equal(g("accent"), f.r("accent"));
    assert.equal(g("misspelling"), f.r("error"));
    assert.equal(g("line_diff_added"), f.r("added"));
    assert.equal(g("line_diff_modified"), f.r("modified"));
    assert.equal(g("line_diff_deleted"), f.r("removed"));
    assert.equal(g("guide"), f.c("surface0"));
    assert.equal(g("active_guide"), f.c("surface2"));
    // Palette and role variables match the flavor exactly.
    for (const name of Object.keys(f.colors)) assert.equal(variables[name], f.c(name), `${f.id} ${name}`);
    for (const role of Object.keys(f.roles)) assert.equal(variables[`role_${role}`], f.r(role), `${f.id} role_${role}`);
  }
});

function tmThemeRules(xml) {
  const unescape = (s) => s.replace(/&lt;/g, "<").replace(/&amp;/g, "&");
  const dicts = xml.split("<key>scope</key>").slice(1);
  return dicts.map((chunk) => {
    const scope = unescape(/<string>([\s\S]*?)<\/string>/.exec(chunk)[1]);
    const settings = Object.fromEntries([...chunk.split("<key>settings</key>")[1].matchAll(/<key>(\w+)<\/key>\s*<string>([^<]*)<\/string>/g)].map((m) => [m[1], m[2]]));
    return { scopes: scope.split(", "), settings };
  });
}

test("rules cover the same scopes, colors and styles as the tmTheme", async () => {
  for (const f of flavors) {
    const { variables, rules } = schemes.get(f.id);
    const byScope = new Map();
    for (const rule of rules) for (const scope of rule.scope.split(", ")) if (!byScope.has(scope)) byScope.set(scope, rule);
    const tm = tmThemeRules(await read(`extras/tmtheme/${f.slug}.tmTheme`));
    assert.equal(tm.length, SCOPES.length);
    for (const { scopes, settings } of tm) {
      // Sublime font_style has no strikethrough, so that one rule has nothing to carry.
      if (settings.fontStyle === "strikethrough") {
        assert.deepEqual(scopes, ["markup.strikethrough"]);
        assert.equal(byScope.has("markup.strikethrough"), false);
        continue;
      }
      for (const scope of scopes) {
        const rule = byScope.get(scope);
        assert.ok(rule, `${f.id}: tmTheme scope ${scope} missing from Sublime scheme`);
        assert.equal(rule.foreground && resolve(rule.foreground, variables), settings.foreground, `${f.id} ${scope} foreground`);
        assert.equal(rule.font_style, settings.fontStyle, `${f.id} ${scope} font_style`);
      }
    }
    // Sublime-specific scopes and diff backgrounds.
    for (const { scope } of SUBLIME_SCOPES) for (const s of scope) assert.ok(byScope.has(s), s);
    for (const [kind, role, mix] of [["inserted", "added", 0.14], ["deleted", "removed", 0.14], ["changed", "modified", 0.12]]) {
      const rule = byScope.get(`markup.${kind}.diff`);
      assert.ok(rule, kind);
      assert.equal(resolve(rule.foreground, variables), f.r(role));
      assert.equal(resolve(rule.background, variables), f.mix("bg", role, mix));
    }
  }
});

// Minimal zip reader that trusts only the central directory, like unzip does.
function readZip(buf) {
  const eocd = buf.length - 22;
  assert.equal(buf.readUInt32LE(eocd), 0x06054b50, "end of central directory");
  assert.equal(buf.readUInt16LE(eocd + 20), 0, "no archive comment");
  const count = buf.readUInt16LE(eocd + 10);
  assert.equal(buf.readUInt16LE(eocd + 8), count);
  let pos = buf.readUInt32LE(eocd + 16);
  assert.equal(pos + buf.readUInt32LE(eocd + 12), eocd, "central directory ends at EOCD");
  const entries = [];
  for (let i = 0; i < count; i++) {
    assert.equal(buf.readUInt32LE(pos), 0x02014b50);
    const method = buf.readUInt16LE(pos + 10);
    const crc = buf.readUInt32LE(pos + 16);
    const csize = buf.readUInt32LE(pos + 20);
    const usize = buf.readUInt32LE(pos + 24);
    const nameLen = buf.readUInt16LE(pos + 28);
    const skip = buf.readUInt16LE(pos + 30) + buf.readUInt16LE(pos + 32);
    const local = buf.readUInt32LE(pos + 42);
    const name = buf.toString("utf8", pos + 46, pos + 46 + nameLen);
    assert.equal(buf.readUInt32LE(local), 0x04034b50);
    assert.equal(buf.toString("utf8", local + 30, local + 30 + buf.readUInt16LE(local + 26)), name);
    assert.equal(buf.readUInt32LE(local + 14), crc);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    assert.equal(method, 8);
    const data = inflateRawSync(buf.subarray(start, start + csize));
    assert.equal(data.length, usize);
    assert.equal(crc32(data), crc, `${name} crc`);
    entries.push({ name, data, dosTime: buf.readUInt16LE(pos + 12), dosDate: buf.readUInt16LE(pos + 14) });
    pos += 46 + nameLen + skip;
  }
  assert.equal(pos, eocd);
  return entries;
}

test("crc32 matches the standard check value", () => {
  assert.equal(crc32(Buffer.from("123456789")), 0xcbf43926);
});

test("packaged .sublime-package has exactly the expected entries and round-trips", async () => {
  const { buffer, entries } = await buildSublimePackage();
  const read = readZip(buffer);
  const expected = [...flavors.map((f) => `${f.slug}.sublime-color-scheme`), "LICENSE"].sort();
  assert.deepEqual(read.map((e) => e.name), expected);
  assert.deepEqual(entries.map((e) => e.name).sort(), expected);
  for (const f of flavors) {
    const entry = read.find((e) => e.name === `${f.slug}.sublime-color-scheme`);
    assert.equal(entry.data.toString("utf8"), sublime.files(f)[0].content);
  }
  assert.equal(read.find((e) => e.name === "LICENSE").data.toString("utf8"), await readFile(new URL("../LICENSE", import.meta.url), "utf8"));
  for (const e of read) assert.ok(!e.name.includes("/"), "entries sit at the archive root");
});

test("package build is deterministic: sorted entries, fixed timestamps, identical bytes", async () => {
  const a = (await buildSublimePackage()).buffer;
  const b = (await buildSublimePackage()).buffer;
  assert.ok(a.equals(b));
  const names = readZip(a).map((e) => e.name);
  assert.deepEqual(names, [...names].sort());
  for (const e of readZip(a)) {
    assert.equal(e.dosTime, 0);
    assert.equal(e.dosDate, 0x21); // 1980-01-01
  }
  // Input order must not matter.
  const entries = [{ name: "b", data: Buffer.from("two") }, { name: "a", data: Buffer.from("one") }];
  assert.ok(zip(entries).equals(zip([...entries].reverse())));
  assert.throws(() => zip([entries[0], entries[0]]), /duplicate/);
});

test("README Sublime install steps and tmTheme pointer are consistent", async () => {
  const readme = await read("README.md");
  assert.match(sublime.install, /Package Control: Install Package/);
  assert.match(sublime.install, /Living Code Night/);
  assert.match(sublime.install, /Packages\/User\//);
  assert.match(sublime.install, /assumes the package is published to Package Control/);
  assert.doesNotMatch(sublime.install, /—/);
  assert.doesNotMatch(tmtheme.install, /Packages\/User/);
  assert.match(tmtheme.install, /\(#sublime\)/);
  assert.match(readme, /<a id="sublime"><\/a>/);
  assert.ok(readme.includes(sublime.install));
});

const inGit = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: new URL("..", import.meta.url) }).stdout?.toString().trim() === "true";

test("Package Control archive of a tag contains the color schemes at their documented path", { skip: inGit ? false : "requires a git checkout" }, () => {
  const cwd = new URL("..", import.meta.url).pathname;
  const listing = execFileSync("sh", ["-c", "git archive --worktree-attributes HEAD | tar -t"], { cwd, encoding: "utf8" });
  const files = listing.split("\n").filter((line) => line && !line.endsWith("/"));
  for (const p of ["LICENSE", ...flavors.map(schemePath)]) assert.ok(files.includes(p), p);
});
