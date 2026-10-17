import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, readlinkSync } from "node:fs";
import { chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { QUICK, groups, ports } from "./ports/index.mjs";
import { RAW } from "./ports/util.mjs";
import { tmux, starship, lazygit } from "./ports/cli.mjs";
import { alacritty, foot } from "./ports/terminals.mjs";

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const root = new URL("../", import.meta.url);

// Ports whose primary route is not a marketplace or a download command, each with the reason. Nothing else is exempt.
const EXEMPT = {
  neovim: "installed by a plugin manager",
  "expressive-code": "npm package",
  css: "npm package",
  tailwind: "npm package",
  json: "npm package",
  base16: "Nix flake input (Stylix)",
};

// A marketplace or built-in route: what the app itself offers, so nothing needs downloading by hand.
const ROUTES = [
  /code --install-extension/, /Settings \| Plugins \| Marketplace/, /Extensions panel/, /Package Control: Install Package/,
  /addons\.mozilla\.org/, /Chrome Web Store/, /Appearance → Themes → Manage/, /Custom theme/,
];
const DOWNLOAD = /(?:curl|Invoke-WebRequest) [^\n]*raw\.githubusercontent\.com\/ElliotLuque\/living-code\/main\/extras\//;
const RELEASE = /github\.com\/ElliotLuque\/living-code\/releases\/latest/;
const fences = (text) => [...text.matchAll(/```(\w*)\n([\s\S]*?)```/g)].map((m) => ({ lang: m[1], body: m[2] }));

// Ports whose marketplace listing is not live yet. Their route may be mentioned, but never as the way to install.
const PENDING = {
  chrome: "Chrome Web Store listing is pending",
  sublime: "Package Control needs a dedicated repository that does not exist yet",
};
const shellBlocks = (text) => fences(text).filter((b) => ["sh", "powershell", "fish"].includes(b.lang));
const indexOfMatch = (text, re) => { const m = re.exec(text); return m ? m.index : -1; };

test("every port leads with a live marketplace route or with a download one-liner", () => {
  for (const p of ports) {
    if (EXEMPT[p.id]) continue;
    const download = indexOfMatch(p.install, DOWNLOAD);
    const route = PENDING[p.id] ? -1 : Math.min(...ROUTES.map((r) => indexOfMatch(p.install, r)).filter((i) => i >= 0), Infinity);
    assert.ok(download >= 0 || route !== Infinity, p.id + " has neither a marketplace route nor a download one-liner");
    // A live route has to come before any download, so the first thing a user reads is the route.
    if (route !== Infinity && download >= 0) assert.ok(route < download, p.id + ": the marketplace route must come before the download");
  }
});

test("a port without a live marketplace route has its download command in the first code block", () => {
  for (const p of ports) {
    if (EXEMPT[p.id]) continue;
    if (!PENDING[p.id] && ROUTES.some((r) => r.test(p.install))) continue;
    if (p.id === "chrome") continue; // release zip, covered by the pending test below
    const [first] = shellBlocks(p.install);
    assert.ok(first, p.id + " has no shell block");
    assert.match(first.body, /curl|Invoke-WebRequest/, p.id + ": the first shell block must download the files");
  }
});

test("pending marketplace listings are not presented as the way to install", () => {
  for (const id of Object.keys(PENDING)) {
    const p = ports.find((x) => x.id === id);
    // Chrome's route is a release zip (no shell block); the others are curl one-liners.
    const download = Math.max(indexOfMatch(p.install, DOWNLOAD), indexOfMatch(p.install, RELEASE));
    assert.ok(download >= 0, id);
    for (const r of ROUTES) {
      const i = indexOfMatch(p.install, r);
      if (i >= 0) assert.ok(i > download, id + ": " + r + " appears before the download");
    }
    assert.doesNotMatch(QUICK[id], /^(Package Control|Chrome Web Store|Marketplace)/, id);
    assert.match(QUICK[id], /pending/, id + " QUICK row should say the listing is pending");
  }
  assert.doesNotMatch(readme, /This README assumes the package is published/);
});

test("no install text asks the user to clone the repository or copy from a checkout", () => {
  for (const p of ports) {
    assert.doesNotMatch(p.install, /git clone/, p.id);
    assert.doesNotMatch(p.install, /\bcp [^\n]*extras\//, `${p.id} copies from a checkout`);
    assert.doesNotMatch(p.install, /^Copy (the|a|to)\b/m, `${p.id} still opens with "Copy ..."`);
  }
});

test("the exemptions are real ports and each has a reason", () => {
  const ids = new Set(ports.map((p) => p.id));
  for (const [id, why] of Object.entries(EXEMPT)) {
    assert.ok(ids.has(id), id);
    assert.ok(why.length > 0);
  }
});

test("file ports keep the flavor in a shell variable", () => {
  for (const id of ["kitty", "alacritty", "foot", "tmux", "fzf", "btop", "helix", "lazygit", "eza", "starship"]) {
    const p = ports.find((x) => x.id === id);
    assert.match(p.install, /flavor=night/, id);
  }
});

test("the README table has one linked row per port", () => {
  assert.deepEqual(Object.keys(QUICK).sort(), ports.map((p) => p.id).sort());
  const section = readme.split("## Install in 30 seconds\n")[1].split("\n## ")[0];
  assert.match(section, /\| App \| How to install \|/);
  for (const p of ports) assert.ok(section.includes(`| [${p.name}](#${p.id}) | ${QUICK[p.id]} |`), p.id);
  assert.ok(readme.indexOf("## Install in 30 seconds") > readme.indexOf("## Choose a flavor"));
  assert.ok(readme.indexOf("## Install in 30 seconds") < readme.indexOf("## Design"));
  assert.ok(groups.length > 0);
});

// curl's {a,b} globs and the $flavor shell variable, expanded into every concrete path.
function expand(path) {
  const brace = path.match(/\{([^{}]+)\}/);
  if (brace) return brace[1].split(",").flatMap((alt) => expand(path.replace(brace[0], alt)));
  return path.includes("$flavor") ? ["night", "frost", "paper", "signal"].map((f) => path.replaceAll("$flavor", f)) : [path];
}

test("every raw URL in the README resolves to a file in extras/", () => {
  const urls = [...readme.matchAll(/https:\/\/raw\.githubusercontent\.com\/ElliotLuque\/living-code\/main\/([^\s"')`]+)/g)].map((m) => m[1]);
  assert.ok(urls.length > 20, "expected many raw URLs");
  for (const url of urls) {
    assert.match(url, /^extras\//, url);
    for (const path of expand(url)) assert.ok(existsSync(new URL(path, root)), `${path} does not exist`);
  }
  assert.ok(readme.includes(RAW));
});

test("fallback installs link to the latest GitHub release", () => {
  assert.doesNotMatch(readme, /from the GitHub release\b/);
  for (const id of ["vscode", "jetbrains", "chrome"]) {
    assert.match(ports.find((p) => p.id === id).install, /https:\/\/github\.com\/ElliotLuque\/living-code\/releases\/latest/, id);
  }
});

// ---- Run the one-liners against a temp HOME -------------------------------------------------------------------
// A stand-in `curl` serves the generated files from this tree instead of the network, and a stand-in `lazygit`
// answers --print-config-dir without creating the folder (as the real one does). Everything else is the real sh.
const sandbox = async () => {
  const dir = await mkdtemp(join(tmpdir(), "living-code-install-"));
  const home = join(dir, "home");
  const bin = join(dir, "bin");
  await mkdir(home);
  await mkdir(bin);
  await writeFile(join(bin, "curl"), `#!/bin/sh
out=; url=
while [ $# -gt 0 ]; do
  case "$1" in -o) out="$2"; shift ;; -*) ;; *) url="$1" ;; esac
  shift
done
src="${fileURLToPath(root)}\${url#${RAW}/}"
[ -f "$src" ] || { echo "curl: no such file $src" >&2; exit 22; }
if [ -n "$out" ]; then mkdir -p "$(dirname "$out")" && cat "$src" > "$out"; else cat "$src"; fi
`, { mode: 0o755 });
  await writeFile(join(bin, "lazygit"), `#!/bin/sh
[ "$1" = "--print-config-dir" ] && echo "$HOME/.config/lazygit"
`, { mode: 0o755 });
  const run = (script, extraEnv = {}) => {
    const r = spawnSync("sh", ["-c", script], { encoding: "utf8", env: { PATH: `${bin}:${process.env.PATH}`, HOME: home, ...extraEnv } });
    assert.equal(r.status, 0, `${script}\n${r.stderr}`);
    return r.stdout;
  };
  const runRaw = (script, extraEnv = {}) => spawnSync("sh", ["-c", script], { encoding: "utf8", env: { PATH: `${bin}:${process.env.PATH}`, HOME: home, ...extraEnv } });
  return { dir, home, run, runRaw, done: () => rm(dir, { recursive: true, force: true }) };
};
const shBlock = (port) => shellBlocks(port.install)[0].body;

// TOML subset used by starship.toml, rejecting a key defined twice in one table (what Starship itself rejects).
function parseToml(text) {
  const doc = { "": {} };
  let table = "";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const t = line.match(/^\[([\w.-]+)\]$/);
    if (t) { assert.ok(!(t[1] in doc), `duplicate table [${t[1]}]`); doc[table = t[1]] = {}; continue; }
    const kv = line.match(/^([\w.-]+)\s*=\s*(.+)$/);
    assert.ok(kv, `not TOML: ${line}`);
    assert.ok(!(kv[1] in doc[table]), `duplicate key ${kv[1]} in [${table}]`);
    doc[table][kv[1]] = kv[2];
  }
  return doc;
}

test("the Starship block is idempotent, switches flavor, keeps user settings and honors STARSHIP_CONFIG", async () => {
  const sb = await sandbox();
  try {
    const block = shBlock(starship);
    const cfg = join(sb.home, ".config", "starship.toml"); // ~/.config does not exist yet: the block must create it
    sb.run(block, { XDG_CONFIG_HOME: join(sb.home, "xdg") });
    assert.ok(!existsSync(join(sb.home, "xdg")), "Starship does not read XDG_CONFIG_HOME");
    let doc = parseToml(await readFile(cfg, "utf8"));
    assert.equal(doc[""].palette, '"living_code_night"');

    // User settings, then a second and third run with other flavors.
    await writeFile(cfg, `${await readFile(cfg, "utf8")}\n[character]\nsuccess_symbol = "[>](bold green)"\n\n[palettes.mine]\nred = "#ff0000"\n`);
    sb.run(block);
    sb.run(block.replace("flavor=night", "flavor=frost"));
    sb.run(block.replace("flavor=night", "flavor=signal"));
    const text = await readFile(cfg, "utf8");
    doc = parseToml(text);
    assert.equal(doc[""].palette, '"living_code_signal"');
    assert.equal(text.match(/^palette\s*=/gm).length, 1);
    assert.deepEqual(Object.keys(doc).filter((k) => k.startsWith("palettes.living_code_")), ["palettes.living_code_signal"]);
    assert.equal(doc.character.success_symbol, '"[>](bold green)"');
    assert.equal(doc["palettes.mine"].red, '"#ff0000"');
    assert.ok(text.trimStart().startsWith("palette = "), "palette must be a top-level key before any table");

    const custom = join(sb.dir, "custom", "s.toml");
    sb.run(block, { STARSHIP_CONFIG: custom });
    assert.equal(parseToml(await readFile(custom, "utf8"))[""].palette, '"living_code_night"');
  } finally { await sb.done(); }
});

test("the Starship block keeps a symlinked starship.toml and edits its target", async () => {
  const sb = await sandbox();
  try {
    const block = shBlock(starship);
    const cfg = join(sb.home, ".config", "starship.toml");
    const target = join(sb.dir, "dotfiles", "starship.toml");
    await mkdir(join(sb.home, ".config"), { recursive: true });
    await mkdir(join(sb.dir, "dotfiles"));
    await writeFile(target, '[character]\nsuccess_symbol = "[>](bold green)"\n');
    await symlink(target, cfg);
    sb.run(block);
    sb.run(block.replace("flavor=night", "flavor=frost"));
    assert.ok(lstatSync(cfg).isSymbolicLink(), "the link must survive");
    assert.equal(readlinkSync(cfg), target);
    const doc = parseToml(await readFile(target, "utf8"));
    assert.equal(doc[""].palette, '"living_code_frost"');
    assert.equal(doc.character.success_symbol, '"[>](bold green)"');
    assert.deepEqual(Object.keys(doc).filter((k) => k.startsWith("palettes.living_code_")), ["palettes.living_code_frost"]);
    assert.ok(!existsSync(`${target}.new`) && !existsSync(`${cfg}.new`), "no temp file left behind");

    // A chain of relative links.
    const rel = join(sb.dir, "rel.toml");
    await symlink("dotfiles/starship.toml", join(sb.dir, "hop.toml"));
    await symlink("hop.toml", rel);
    sb.run(block, { STARSHIP_CONFIG: rel });
    assert.ok(lstatSync(rel).isSymbolicLink());
    assert.equal(parseToml(await readFile(target, "utf8"))[""].palette, '"living_code_night"');

    // A link whose target does not exist yet is created through the link.
    const fresh = join(sb.dir, "dotfiles", "new.toml");
    const dangling = join(sb.dir, "dangling.toml");
    await symlink(fresh, dangling);
    sb.run(block, { STARSHIP_CONFIG: dangling });
    assert.ok(lstatSync(dangling).isSymbolicLink());
    assert.equal(parseToml(await readFile(fresh, "utf8"))[""].palette, '"living_code_night"');

    if (spawnSync("starship", ["--version"]).status === 0) {
      const r = spawnSync("starship", ["print-config"], { encoding: "utf8", env: { ...process.env, HOME: sb.home, STARSHIP_CONFIG: cfg } });
      assert.equal(r.status, 0, r.stderr);
      assert.doesNotMatch(r.stderr, /warn|error/i);
      assert.match(r.stdout, /palette = "living_code_night"/);
    }
  } finally { await sb.done(); }
});

test("the Starship block leaves a read-only target and its link untouched", async (t) => {
  if (process.getuid?.() === 0) return t.skip("root can write to read-only files");
  const sb = await sandbox();
  try {
    const block = shBlock(starship);
    const cfg = join(sb.home, ".config", "starship.toml");
    const target = join(sb.dir, "store", "starship.toml");
    await mkdir(join(sb.home, ".config"), { recursive: true });
    await mkdir(join(sb.dir, "store"));
    const original = '[character]\nsuccess_symbol = "[>](bold green)"\n';
    await writeFile(target, original);
    await chmod(target, 0o444);
    await symlink(target, cfg);
    const r = sb.runRaw(block);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /read-only, so it was left unchanged/);
    assert.equal(await readFile(target, "utf8"), original);
    assert.ok(lstatSync(cfg).isSymbolicLink());
    assert.ok(!existsSync(`${target}.new`));
  } finally { await sb.done(); }
});

test("the Starship block stops on a symlink loop instead of hanging", async () => {
  const sb = await sandbox();
  try {
    const a = join(sb.dir, "a.toml");
    const b = join(sb.dir, "b.toml");
    await symlink(b, a);
    await symlink(a, b);
    const r = sb.runRaw(shBlock(starship), { STARSHIP_CONFIG: a });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /symlink loop/);
    assert.ok(lstatSync(a).isSymbolicLink() && lstatSync(b).isSymbolicLink());
  } finally { await sb.done(); }
});

test("the lazygit block works on a machine where lazygit has never run", async () => {
  const sb = await sandbox();
  try {
    const block = shBlock(lazygit);
    const out = () => sb.run(`${block}\nprintf %s "$LG_CONFIG_FILE"`);
    const dir = join(sb.home, ".config", "lazygit");
    assert.ok(!existsSync(dir));
    const files = out();
    assert.ok(existsSync(join(dir, "config.yml")), "config.yml must exist or lazygit aborts on start");
    assert.ok(existsSync(join(dir, "living-code-night.yml")));
    assert.equal(files, `${dir}/config.yml,${dir}/living-code-night.yml`);
    await writeFile(join(dir, "config.yml"), "gui:\n  nerdFontsVersion: \"3\"\n");
    out();
    assert.match(await readFile(join(dir, "config.yml"), "utf8"), /nerdFontsVersion/, "an existing config.yml is left alone");
  } finally { await sb.done(); }
});

test("activation lines that cannot read XDG_CONFIG_HOME say so", () => {
  for (const p of [tmux, alacritty, foot]) {
    assert.match(p.install, /If you set `XDG_CONFIG_HOME`, use that path in the/, p.id);
  }
});
