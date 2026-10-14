import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { buildPackages } from "./npm-packages.mjs";

const json = async (path) => JSON.parse(await readFile(path, "utf8"));

test("scoped npm packages contain only their own port and support public imports", async (t) => {
  const temp = await mkdtemp(join(tmpdir(), "living-code-packages-"));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const out = join(temp, "packages");
  const packages = await buildPackages(out);
  const byId = new Map(packages.map((pkg) => [pkg.id, pkg]));
  assert.deepEqual([...byId.keys()].sort(), [
    "alacritty", "base16", "btop", "css", "expressive-code", "firefox", "foot", "fzf",
    "ghostty", "helix", "kitty", "lazygit", "neovim", "palette", "starship", "tailwind",
    "tmtheme", "tmux", "vscode", "wezterm", "zed",
  ]);
  const rootMeta = await json(new URL("../package.json", import.meta.url));
  assert.equal(rootMeta.private, true);
  for (const pkg of packages) {
    const meta = await json(join(pkg.dir, "package.json"));
    assert.equal(meta.name, `@living-code/${pkg.id}`);
    assert.equal(meta.version, rootMeta.version);
    assert.equal(meta.publishConfig.access, "public");
    assert.equal(meta.dependencies, undefined);
    assert.deepEqual(meta.files, pkg.payload);
    for (const path of pkg.payload) {
      assert.ok(!path.startsWith("extras/"));
      assert.ok(!path.startsWith("scripts/"));
      assert.ok(!path.includes("node_modules"));
      assert.ok((await readFile(join(pkg.dir, path))).length);
      assert.equal(meta.exports[`./${path}`], `./${path}`);
    }
    assert.ok((await readFile(join(pkg.dir, "LICENSE"), "utf8")).includes("MIT"));
    const readme = await readFile(join(pkg.dir, "README.md"), "utf8");
    assert.ok(readme.includes(`pnpm add ${pkg.name}`));
    assert.doesNotMatch(readme, /\b(?:npm|npx)\s+(?:install|run|exec|pack|publish|add|dlx)\b/);
  }

  const ec = byId.get("expressive-code");
  assert.deepEqual(ec.payload, ["frost", "night", "paper", "signal"].map((f) => `living-code-${f}.json`));
  const packed = JSON.parse(execFileSync("pnpm", ["pack", "--dry-run", "--json"], { cwd: ec.dir, encoding: "utf8" }));
  assert.deepEqual(packed.files.map((file) => file.path).sort(), ["LICENSE", "README.md", "package.json", ...ec.payload].sort());
  assert.ok(byId.get("neovim").payload.includes("lua/living-code/init.lua"));
  assert.ok(byId.get("neovim").payload.includes("lua/living-code/highlights.lua"));
  assert.ok(byId.get("neovim").payload.includes("lua/lualine/themes/living-code.lua"));
  const vscode = await json(join(byId.get("vscode").dir, "extension/package.json"));
  assert.equal(vscode.name, "living-code");
  for (const theme of vscode.contributes.themes) {
    await readFile(join(byId.get("vscode").dir, "extension", theme.path));
  }
  const firefox = byId.get("firefox");
  assert.ok(!firefox.payload.some((path) => /frost|signal/.test(path)));
  for (const variant of ["night", "paper"]) {
    const dir = join(firefox.dir, `living-code-${variant}`);
    const manifest = await json(join(dir, "manifest.json"));
    for (const path of Object.values(manifest.icons)) await readFile(join(dir, path));
  }

  // Install the actual tarballs, not the staging directories, to test exports and isolation.
  const consumer = join(temp, "consumer");
  await mkdir(consumer);
  await writeFile(join(consumer, "package.json"), '{"private":true,"type":"module"}\n');
  const tarballs = [];
  for (const id of ["expressive-code", "palette", "css", "tailwind"]) {
    const pkg = byId.get(id);
    const pack = JSON.parse(execFileSync("pnpm", ["pack", "--json"], { cwd: pkg.dir, encoding: "utf8" }));
    tarballs.push(join(pkg.dir, pack.filename));
  }
  execFileSync("pnpm", ["add", "--ignore-scripts", "--offline", ...tarballs], { cwd: consumer });
  const result = execFileSync(process.execPath, ["--input-type=module", "-e", `
    import { palette } from '@living-code/palette';
    import { createRequire } from 'node:module';
    import { readFileSync } from 'node:fs';
    const require = createRequire(import.meta.url);
    const night = JSON.parse(readFileSync(require.resolve('@living-code/expressive-code/living-code-night.json'), 'utf8'));
    const css = readFileSync(require.resolve('@living-code/css/living-code.css'), 'utf8');
    const tailwind = readFileSync(require.resolve('@living-code/tailwind/living-code.css'), 'utf8');
    console.log(JSON.stringify([palette.night.name, night.name, css.includes('--lc-teal'), tailwind.includes('@theme inline')]));
  `], { cwd: consumer, encoding: "utf8" });
  assert.deepEqual(JSON.parse(result), ["Living Code Night", "Living Code Night", true, true]);

  // A second build removes stale files and retired packages instead of publishing them.
  await writeFile(join(ec.dir, "obsolete.json"), "{}");
  await mkdir(join(out, "retired"));
  await writeFile(join(out, "retired/package.json"), "{}");
  await buildPackages(out);
  await assert.rejects(readFile(join(ec.dir, "obsolete.json")), { code: "ENOENT" });
  await assert.rejects(readFile(join(out, "retired/package.json")), { code: "ENOENT" });
});
