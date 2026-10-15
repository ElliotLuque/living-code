import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { contrast, oklabToOklch, rgbToOklab } from "./color.mjs";
import { SCOPES } from "./ports/editors.mjs";
import { delta, hunk, hunkTheme } from "./ports/git.mjs";
import { generate, groups } from "./ports/index.mjs";
import { resolveAll, resolveFlavor } from "./resolve.mjs";

const flavors = resolveAll();
const color = (hex) => oklabToOklch(rgbToOklab(hex.slice(1).match(/../g).map((x) => parseInt(x, 16))));

test("diff ports are registered in CLI & TUI and generate current files", async () => {
  const cli = groups.find((g) => g.title === "CLI & TUI").ports;
  assert.ok(cli.includes(delta));
  assert.ok(cli.includes(hunk));
  const files = generate(flavors).filter((f) => /^extras\/(delta|hunk)\//.test(f.path));
  assert.equal(files.length, 6);
  assert.equal(new Set(files.map((f) => f.path)).size, files.length);
  for (const file of files) {
    assert.equal(await readFile(new URL(`../${file.path}`, import.meta.url), "utf8"), file.content);
  }
});

test("delta features parse as gitconfig without losing hex colors to comments", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "living-code-delta-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const path = join(dir, "theme.gitconfig");
  await writeFile(path, delta.all(flavors)[0].content);
  const raw = execFileSync("git", ["config", "--file", path, "--null", "--list"], { encoding: "utf8" });
  const config = new Map(raw.split("\0").filter(Boolean).map((entry) => {
    const sep = entry.indexOf("\n");
    return [entry.slice(0, sep), entry.slice(sep + 1)];
  }));
  for (const f of flavors) {
    const get = (key) => config.get(`delta.${f.slug}.${key}`);
    assert.equal(get(f.light ? "light" : "dark"), "true");
    assert.equal(get(f.light ? "dark" : "light"), undefined);
    assert.equal(get("syntax-theme"), f.slug);
    for (const [sign, role] of [["minus", "removed"], ["plus", "added"]]) {
      assert.equal(get(`${sign}-style`), `syntax ${f.mix("bg", role, 0.12)}`);
      assert.equal(get(`${sign}-non-emph-style`), get(`${sign}-style`));
      assert.equal(get(`${sign}-emph-style`), `bold syntax ${f.mix("bg", role, 0.26)}`);
      assert.equal(get(`line-numbers-${sign}-style`), f.r(role));
    }
    assert.equal(get("zero-style"), "syntax");
    assert.equal(get("file-style"), `bold ${f.r("fg")}`);
    assert.equal(get("commit-style"), `bold ${f.r("accent")}`);
    assert.equal(get("hunk-header-file-style"), f.r("info"));
    assert.equal(get("hunk-header-line-number-style"), f.r("lineNumberActive"));
    assert.equal(get("line-numbers-zero-style"), f.r("lineNumber"));
    assert.equal(get("whitespace-error-style"), `reverse ${f.r("error")}`);
    assert.equal(get("blame-palette"), ["bg", "bgAlt", "lineHighlight", "border"].map(f.r).join(" "));
    assert.equal(get("grep-match-word-style"), `bold ${f.r("bg")} ${f.r("match")}`);
  }
});

for (const f of flavors) {
  test(`${f.id}: Hunk uses semantic UI colors and the shared syntax scope map`, () => {
    const { id, label, base, syntaxScopes, ...colors } = hunkTheme(f);
    assert.equal(id, f.slug);
    assert.equal(label, f.name);
    assert.equal(base, f.light ? "github-light-default" : "github-dark-default");
    const roles = {
      background: "bg", text: "fg", panel: "bgAlt", panelAlt: "lineHighlight",
      border: "border", accent: "accent", muted: "fgMuted", selectedHunk: "lineHighlight",
      addedSignColor: "added", removedSignColor: "removed", lineNumberFg: "lineNumber",
      fileNew: "added", fileDeleted: "removed", fileRenamed: "info", fileModified: "modified",
      contextBg: "bg", contextContentBg: "bg", noteTitleText: "fg",
    };
    for (const [key, role] of Object.entries(roles)) assert.equal(colors[key], f.r(role));
    for (const value of Object.values(colors)) assert.match(value, /^#[0-9a-f]{6}$/);
    for (const { role, scope } of SCOPES) {
      for (const s of scope) assert.equal(syntaxScopes[s], role ? f.r(role) : undefined);
    }
    assert.equal(Object.keys(syntaxScopes).length, SCOPES.filter((s) => s.role).flatMap((s) => s.scope).length);
    for (const bg of ["addedBg", "removedBg", "addedContentBg", "removedContentBg", "noteTitleBackground"]) {
      assert.ok(contrast(color(colors.text), color(colors[bg])) >= 4.5, `${id}: text on ${bg}`);
    }
    assert.notEqual(colors.addedBg, colors.addedContentBg);
    assert.notEqual(colors.removedBg, colors.removedContentBg);
  });

  test(`${f.id}: Hunk config includes exact quoted scope keys and the same colors as the extension`, () => {
    const { id, syntaxScopes, ...colors } = hunkTheme(f);
    const [file] = hunk.files(f);
    assert.equal(file.path, `extras/hunk/${id}.toml`);
    assert.ok(file.content.startsWith(`[themes.${id}]\n`));
    assert.ok(file.content.includes(`\n[themes.${id}.syntax_scopes]\n`));
    for (const [key, value] of Object.entries(colors)) {
      assert.ok(file.content.includes(`\n${key} = ${JSON.stringify(value)}\n`));
    }
    for (const [scope, value] of Object.entries(syntaxScopes)) {
      assert.ok(file.content.includes(`\n${JSON.stringify(scope)} = ${JSON.stringify(value)}\n`));
    }
  });
}

test("the generated Hunk extension registers all four flavors with no dependencies", async () => {
  const extension = await import(new URL("../extras/hunk/living-code.mjs", import.meta.url));
  const themes = [];
  extension.default({ registerTheme: (theme) => themes.push(theme) });
  assert.deepEqual(themes, flavors.map(hunkTheme));
});

test("diff ports respond to live palette adjustments instead of embedding fixed colors", () => {
  const f = resolveFlavor("night", { chroma: 0.7, light: 0.03, hue: 10 });
  const theme = hunkTheme(f);
  assert.equal(theme.accent, f.r("accent"));
  assert.equal(theme.syntaxScopes.string, f.r("string"));
  assert.notEqual(theme.accent, hunkTheme(resolveFlavor("night")).accent);
  const content = delta.all([f])[0].content;
  assert.ok(content.includes(`minus-style = "syntax ${f.mix("bg", "removed", 0.12)}"`));
  assert.ok(content.includes(`plus-emph-style = "bold syntax ${f.mix("bg", "added", 0.26)}"`));
});
