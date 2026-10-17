import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { QUICK, groups, ports } from "./ports/index.mjs";
import { RAW } from "./ports/util.mjs";

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
const fences = (text) => [...text.matchAll(/```(\w*)\n([\s\S]*?)```/g)].map((m) => ({ lang: m[1], body: m[2] }));

test("every port leads with a marketplace or built-in route, or with a download one-liner", () => {
  for (const p of ports) {
    if (EXEMPT[p.id]) continue;
    assert.ok(ROUTES.some((r) => r.test(p.install)) || DOWNLOAD.test(p.install), `${p.id} has neither a marketplace route nor a download one-liner`);
  }
});

test("a port without a marketplace route has its download command in the first code block", () => {
  for (const p of ports) {
    if (EXEMPT[p.id] || ROUTES.some((r) => r.test(p.install))) continue;
    const [first] = fences(p.install).filter((b) => ["sh", "powershell", "fish"].includes(b.lang));
    assert.ok(first, `${p.id} has no shell block`);
    assert.match(first.body, /curl|Invoke-WebRequest/, `${p.id}: the first shell block must download the files`);
  }
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
