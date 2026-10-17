import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { eza, ezaYaml, fish, fishTheme, k9s, k9sSkin, yazi, yaziFlavor, zellij, zellijTheme } from "./ports/cli-extra.mjs";
import { generate, groups } from "./ports/index.mjs";
import { itermColorKeys, iterm2, itermPath, konsole, konsoleScheme, warp, warpTheme, windowsTerminal, windowsTerminalScheme } from "./ports/terminals-extra.mjs";
import { tmtheme } from "./ports/editors.mjs";
import { ANSI_ORDER, resolveAll } from "./resolve.mjs";

const flavors = resolveAll();
const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const HEX = /^#[0-9a-f]{6}$/i;
const byId = (id) => groups.flatMap((g) => g.ports).find((p) => p.id === id);
const ports = [windowsTerminal, iterm2, warp, konsole, fish, zellij, yazi, k9s, eza];

// A deliberately small YAML reader for the subset the generators emit: nested maps, scalar values, "- item" lists.
function parseYaml(text) {
  const root = {}, stack = [{ indent: -1, node: root }];
  const lines = text.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  for (const [n, raw] of lines.entries()) {
    const indent = raw.match(/^ */)[0].length, line = raw.trim();
    while (stack.at(-1).indent >= indent) stack.pop();
    const parent = stack.at(-1).node;
    if (line.startsWith("- ")) { assert.ok(Array.isArray(parent), `list item outside a list: ${raw}`); parent.push(unquote(line.slice(2))); continue; }
    const m = line.match(/^([\w.-]+):(?: (.*))?$/);
    assert.ok(m, `not a YAML mapping line: ${raw}`);
    if (m[2] === undefined) {
      const next = lines[n + 1]?.trim().startsWith("- ") ? [] : {};
      parent[m[1]] = next;
      stack.push({ indent, node: next });
    } else parent[m[1]] = unquote(m[2]);
  }
  return root;
}
const unquote = (v) => v.replace(/^(['"])(.*)\1$/, "$2");

test("all nine ports are registered once, with a one-line install command and no em dash", () => {
  const all = groups.flatMap((g) => g.ports);
  for (const p of ports) {
    assert.equal(all.filter((x) => x.id === p.id).length, 1, p.id);
    assert.ok(readme.includes(p.install), p.id);
    assert.doesNotMatch(p.install, /—/);
    assert.match(p.install, /curl -fsSL|Invoke-WebRequest/, `${p.id} has a one-line download`);
    assert.ok(!/npm:/.test(JSON.stringify(Object.keys(p))), "no npm package for CLI/terminal ports");
  }
  assert.deepEqual(groups.find((g) => g.title === "Terminals").ports.slice(-4).map((p) => p.id), ["windows-terminal", "iterm2", "warp", "konsole"]);
  assert.deepEqual(groups.find((g) => g.title === "CLI & TUI").ports.slice(-5).map((p) => p.id), ["fish", "zellij", "yazi", "k9s", "eza"]);
});

test("every file is generated for all four flavors and matches the committed output", async () => {
  const files = generate(flavors);
  for (const p of ports) {
    const own = files.filter((f) => f.path.startsWith(`extras/${p.id}/`));
    assert.ok(own.length >= 4, `${p.id} ships at least one file per flavor`);
    for (const f of own) assert.equal(await readFile(new URL(`../${f.path}`, import.meta.url), "utf8"), f.content, f.path);
  }
  for (const f of flavors) {
    for (const p of [warp, konsole, fish, zellij, k9s, eza, windowsTerminal]) {
      assert.ok(files.some((x) => x.path.startsWith(`extras/${p.id}/`) && x.path.includes(f.slug)), `${p.id} ${f.id}`);
    }
    assert.ok(files.some((x) => x.path === itermPath(f)));
  }
});

test("Windows Terminal schemes carry all 16 ANSI slots and the fragment holds one scheme per flavor", () => {
  const names = ["black", "red", "green", "yellow", "blue", "purple", "cyan", "white"];
  for (const f of flavors) {
    const s = JSON.parse(windowsTerminal.files(f)[0].content);
    assert.deepEqual(s, windowsTerminalScheme(f));
    assert.equal(s.name, f.name);
    names.forEach((n, i) => {
      assert.equal(s[n], f.ansi.normal[i]);
      assert.equal(s["bright" + n[0].toUpperCase() + n.slice(1)], f.ansi.bright[i]);
    });
    for (const k of ["background", "foreground", "cursorColor", "selectionBackground"]) assert.match(s[k], HEX, k);
  }
  const fragment = JSON.parse(windowsTerminal.all(flavors)[0].content);
  assert.deepEqual(Object.keys(fragment), ["schemes"]);
  assert.deepEqual(fragment.schemes.map((s) => s.name), flavors.map((f) => f.name));
  assert.equal(windowsTerminal.all(flavors)[0].path, "extras/windows-terminal/living-code.json");
});

test("Windows Terminal install is a single PowerShell line that targets the Fragments folder", () => {
  const code = windowsTerminal.install.match(/```powershell\n([\s\S]*?)\n```/)[1];
  assert.equal(code.split("\n").length, 1);
  assert.match(code, /\$env:LOCALAPPDATA\\Microsoft\\Windows Terminal\\Fragments\\living-code/);
  assert.match(code, /Invoke-WebRequest https:\/\/raw\.githubusercontent\.com\/ElliotLuque\/living-code\/main\/extras\/windows-terminal\/living-code\.json/);
});

// Minimal plist reader: checks the XML is balanced and returns { key: [r, g, b] } for the color dicts.
function parsePlist(xml) {
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<!DOCTYPE plist PUBLIC/);
  const tags = [...xml.replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>/g, "").matchAll(/<(\/?)(\w+)([^>]*?)(\/?)>/g)];
  const open = [];
  for (const [, close, name, , self] of tags) {
    if (self) continue;
    if (close) assert.equal(open.pop(), name, "balanced tags");
    else open.push(name);
  }
  assert.equal(open.length, 0);
  const out = {};
  for (const m of xml.matchAll(/<key>([^<]+)<\/key>\s*<dict>([\s\S]*?)<\/dict>/g)) {
    const comp = (n) => Number(m[2].match(new RegExp(`<key>${n} Component</key>\\s*<real>([^<]+)</real>`))[1]);
    assert.match(m[2], /<key>Color Space<\/key>\s*<string>sRGB<\/string>/);
    out[m[1]] = [comp("Red"), comp("Green"), comp("Blue")].map((v) => Math.round(v * 255));
  }
  return out;
}

test("iTerm2 presets are valid plists with every required color key", () => {
  const required = [...Array.from({ length: 16 }, (_, i) => `Ansi ${i} Color`), "Background Color", "Foreground Color", "Bold Color", "Cursor Color", "Cursor Text Color", "Selection Color", "Selected Text Color", "Link Color"];
  const toRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  for (const f of flavors) {
    const file = iterm2.files(f)[0];
    assert.match(file.path, /^extras\/iterm2\/Living-Code-(Night|Frost|Paper|Signal)\.itermcolors$/);
    const colors = parsePlist(file.content);
    assert.deepEqual(Object.keys(colors).sort(), [...required].sort());
    for (const [k, hex] of itermColorKeys(f)) assert.deepEqual(colors[k], toRgb(hex), k);
    [...f.ansi.normal, ...f.ansi.bright].forEach((hex, i) => assert.deepEqual(colors[`Ansi ${i} Color`], toRgb(hex)));
    assert.deepEqual(colors["Background Color"], toRgb(f.r("bg")));
  }
  assert.match(iterm2.install, /Living Code #1\.itermcolors/);
  assert.match(iterm2.install, /open "\$HOME"\/Downloads\/Living\\ Code\\ \*\.itermcolors/);
});

test("Warp themes are YAML with the documented keys and the right ANSI slots", () => {
  for (const f of flavors) {
    const t = parseYaml(warpTheme(f));
    assert.equal(t.name, f.name);
    for (const k of ["accent", "cursor", "background", "foreground"]) assert.match(t[k], HEX, k);
    assert.equal(t.details, f.light ? "lighter" : "darker");
    for (const set of ["normal", "bright"]) ANSI_ORDER.forEach((n, i) => assert.equal(t.terminal_colors[set][n], f.ansi[set][i], `${set} ${n}`));
    assert.equal(warp.files(f)[0].path, `extras/warp/${f.slug}.yaml`);
  }
  assert.match(warp.install, /~\/\.warp\/themes/);
  assert.match(warp.install, /warp-terminal\/themes/);
});

test("Konsole schemes define Background, Foreground and all 8 colors in normal, faint and intense", () => {
  for (const f of flavors) {
    const sections = new Map();
    let cur;
    for (const line of konsoleScheme(f).split("\n")) {
      const h = line.match(/^\[(\w+)\]$/);
      if (h) { cur = {}; sections.set(h[1], cur); } else if (line.includes("=")) { const [k, ...v] = line.split("="); cur[k] = v.join("="); }
    }
    const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
    for (const s of ["Background", "BackgroundFaint", "BackgroundIntense", "Foreground", "ForegroundFaint", "ForegroundIntense"]) assert.match(sections.get(s).Color, /^\d+,\d+,\d+$/, s);
    ANSI_ORDER.forEach((_, i) => {
      assert.equal(sections.get(`Color${i}`).Color, rgb(f.ansi.normal[i]));
      assert.equal(sections.get(`Color${i}Intense`).Color, rgb(f.ansi.bright[i]));
      assert.ok(sections.has(`Color${i}Faint`));
    });
    assert.equal(sections.get("Background").Color, rgb(f.r("bg")));
    assert.equal(sections.get("General").Description, f.name);
  }
  assert.match(konsole.install, /~\/\.local\/share\/konsole/);
});

test("fish themes set the documented color variables as bare hex", () => {
  const required = ["normal", "command", "keyword", "quote", "redirection", "end", "error", "param", "option", "comment", "selection", "operator", "escape", "autosuggestion", "cwd", "cwd_root", "user", "host", "host_remote", "status", "valid_path", "history_current", "search_match", "cancel"].map((n) => `fish_color_${n}`);
  const pager = ["progress", "background", "prefix", "completion", "description", "selected_background", "selected_prefix", "selected_completion", "selected_description", "secondary_background", "secondary_prefix", "secondary_completion", "secondary_description"].map((n) => `fish_pager_color_${n}`);
  for (const f of flavors) {
    const text = fishTheme(f);
    assert.ok(text.startsWith(`# name: '${f.name}'\n`));
    const vars = new Map(text.split("\n").filter((l) => /^fish_/.test(l)).map((l) => [l.split(" ")[0], l.split(" ").slice(1).join(" ")]));
    for (const k of [...required, ...pager]) assert.ok(vars.has(k), k);
    assert.ok(!text.includes("#", text.indexOf("\n\n")), "colors are bare hex");
    assert.equal(vars.get("fish_color_normal"), f.r("fg").slice(1));
    assert.equal(vars.get("fish_color_error"), f.r("error").slice(1));
    assert.match(vars.get("fish_color_selection"), /--background=[0-9a-f]{6}$/);
  }
});

test("zellij themes are balanced KDL with every component and RGB triples", () => {
  const components = ["text_unselected", "text_selected", "ribbon_selected", "ribbon_unselected", "table_title", "table_cell_selected", "table_cell_unselected", "list_selected", "list_unselected", "frame_selected", "frame_unselected", "frame_highlight", "exit_code_success", "exit_code_error"];
  for (const f of flavors) {
    const kdl = zellijTheme(f);
    assert.equal([...kdl].filter((c) => c === "{").length, [...kdl].filter((c) => c === "}").length);
    assert.match(kdl, new RegExp(`^themes \\{\\n    ${f.slug} \\{\\n`, "m"));
    for (const c of components) {
      const body = kdl.match(new RegExp(`        ${c} \\{\\n([\\s\\S]*?)\\n        \\}`))?.[1];
      assert.ok(body, c);
      const attrs = Object.fromEntries(body.trim().split("\n").map((l) => l.trim().split(/ (.*)/s).slice(0, 2)));
      assert.deepEqual(Object.keys(attrs), ["base", "background", "emphasis_0", "emphasis_1", "emphasis_2", "emphasis_3"], c);
      for (const v of Object.values(attrs)) assert.match(v, /^\d{1,3} \d{1,3} \d{1,3}$/);
    }
    assert.equal([...kdl.matchAll(/player_(\d+) \d+ \d+ \d+/g)].length, 10);
    assert.ok(kdl.includes(`base ${[1, 3, 5].map((i) => parseInt(f.r("fg").slice(i, i + 2), 16)).join(" ")}`));
  }
});

// The subset of TOML the yazi flavor uses: [tables], key = value, and a multi-line `rules = [ ... ]` array.
function checkToml(text) {
  const tables = [];
  let inArray = false;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (inArray) { if (line === "]") inArray = false; else assert.match(line, /^\{.*\},?$/, line); continue; }
    const t = line.match(/^\[(\w+)\]$/);
    if (t) { tables.push(t[1]); continue; }
    assert.match(line, /^\w+ = (\{.*\}|"[^"]*"|\d+|\[.*\])$|^rules = \[$/, line);
    if (line.endsWith("= [")) inArray = true;
    for (const [hex] of line.matchAll(/#[0-9a-fA-F]+/g)) assert.match(hex, HEX, line);
  }
  assert.equal(inArray, false);
  return tables;
}

test("yazi flavors have a flavor.toml, a tmtheme.xml from the tmTheme port, and a license", () => {
  for (const f of flavors) {
    const files = yazi.files(f);
    assert.deepEqual(files.map((x) => x.path), ["flavor.toml", "tmtheme.xml", "LICENSE"].map((n) => `extras/yazi/${f.slug}.yazi/${n}`));
    const tables = checkToml(yaziFlavor(f));
    for (const t of ["mgr", "tabs", "mode", "status", "which", "confirm", "spot", "notify", "pick", "input", "cmp", "tasks", "help", "filetype"]) assert.ok(tables.includes(t), t);
    assert.equal(files[1].content, tmtheme.files(f)[0].content);
    assert.match(files[1].content, /<plist version="1\.0">/);
    assert.match(files[2].content, /MIT License/);
    const toml = yaziFlavor(f);
    assert.ok(tables.includes("indicator"));
    assert.ok(toml.includes(`current = { fg = "${f.r("fg")}", bg = "${f.r("selection")}" }`));
    assert.doesNotMatch(toml.split(/^\[indicator\]/m)[0], /^(preview_)?hovered\s*=/m, "hovered keys were removed from [mgr] in current yazi");
    assert.match(toml, /\[which\]\ncols = 3\nborder = /);
  }
});

test("yazi install explains why ya pkg is not used and keeps the repository root clean", async () => {
  assert.match(yazi.install, /ya pkg add/);
  assert.match(yazi.install, /root of the repository/);
  assert.match(yazi.install, /flavors\/living-code-#1\.yazi\/#2/);
  const root = await readFile(new URL("../.gitattributes", import.meta.url), "utf8").catch(() => "");
  assert.doesNotMatch(root, /\.yazi/);
  for (const f of generate(flavors)) assert.ok(!/^[^/]+\.yazi\//.test(f.path), f.path);
});

test("k9s skins are YAML with the skin sections and hex colors", () => {
  for (const f of flavors) {
    const y = parseYaml(k9sSkin(f));
    const s = y.k9s;
    for (const k of ["body", "prompt", "info", "dialog", "frame", "views"]) assert.ok(s[k], k);
    for (const k of ["border", "menu", "crumbs", "status", "title"]) assert.ok(s.frame[k], k);
    for (const k of ["charts", "table", "xray", "yaml", "logs"]) assert.ok(s.views[k], k);
    assert.equal(s.body.fgColor, f.r("fg"));
    assert.equal(s.body.bgColor, f.r("bg"));
    assert.equal(s.frame.status.errorColor, f.r("error"));
    const colors = [...k9sSkin(f).matchAll(/"(#[^"]+)"/g)].map((m) => m[1]);
    assert.ok(colors.length > 40);
    for (const c of colors) assert.match(c, HEX);
  }
  assert.match(k9s.install, /skin: living-code-night/);
  assert.match(k9s.install, /Library\/Application\\ Support\/k9s\/skins/);
});

test("eza themes are YAML using eza's section names and ANSI-independent hex colors", () => {
  const sections = ["filekinds", "perms", "size", "users", "links", "git", "git_repo", "security_context", "file_type", "punctuation", "date", "inode", "blocks", "header", "octal", "flags", "control_char", "broken_symlink", "broken_path_overlay"];
  for (const f of flavors) {
    const y = parseYaml(ezaYaml(f));
    for (const s of sections) assert.ok(y[s], s);
    assert.ok(y.security_context.selinux.role && y.security_context.none);
    assert.equal(y.filekinds.directory.foreground, f.r("accent"));
    assert.equal(y.filekinds.directory.is_bold, "true");
    assert.equal(y.git.modified.foreground, f.r("modified"));
    const colors = [...ezaYaml(f).matchAll(/foreground: "([^"]+)"/g)].map((m) => m[1]);
    assert.ok(colors.length > 60);
    for (const c of colors) assert.match(c, HEX);
  }
  assert.match(eza.install, /Library\/Application Support\/eza/);
  assert.match(eza.install, /XDG_CONFIG_HOME/);
});

test("Signal stays a single-accent flavor in the new ports", () => {
  const signal = flavors.find((f) => f.id === "signal");
  const text = zellijTheme(signal) + ezaYaml(signal) + k9sSkin(signal);
  assert.ok(!/#?f0be6d/i.test(text), "no Night amber");
  assert.ok(byId("eza"));
});
