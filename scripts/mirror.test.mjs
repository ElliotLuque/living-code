import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { COMMITTER, commitMessage, mirrorFiles, planObsidianRelease, planSublimeTag, syncRepo } from "./mirror.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const paths = (target) => mirrorFiles(target).map((f) => f.path);
const pkg = JSON.parse(read("package.json"));

test("obsidian mirror holds the theme files at the root, with the generated README", () => {
  assert.deepEqual(paths("obsidian"), ["LICENSE", "README.md", "manifest.json", "screenshot.png", "snippets/living-code-frost.css", "snippets/living-code-signal.css", "theme.css"]);
});

test("sublime mirror holds the four schemes, LICENSE and the generated README", () => {
  assert.deepEqual(paths("sublime"), [
    "LICENSE", "README.md",
    "living-code-frost.sublime-color-scheme", "living-code-night.sublime-color-scheme",
    "living-code-paper.sublime-color-scheme", "living-code-signal.sublime-color-scheme",
  ]);
});

test("mirror files are the build output, byte for byte", () => {
  for (const f of mirrorFiles("obsidian").filter((f) => f.path !== "README.md")) {
    const src = f.path === "LICENSE" ? "LICENSE" : `extras/obsidian/${f.path}`;
    assert.ok(f.content.equals(Buffer.from(readFileSync(new URL(`../${src}`, import.meta.url)))), f.path);
  }
});

test("each mirror README says it is generated, links to living-code and keeps the install steps", () => {
  for (const target of ["obsidian", "sublime"]) {
    const readme = mirrorFiles(target).find((f) => f.path === "README.md").content.toString("utf8");
    assert.match(readme, /Generated from \[living-code\]\(https:\/\/github\.com\/ElliotLuque\/living-code\) — do not edit here/);
    assert.match(readme, /Open issues and pull requests in \[living-code\]/);
    assert.match(readme, /^## Install$/m);
  }
  assert.match(mirrorFiles("obsidian").find((f) => f.path === "README.md").content.toString(), /Manage\*, search for \*\*Living Code\*\*/);
  assert.match(mirrorFiles("sublime").find((f) => f.path === "README.md").content.toString(), /Package Control: Install Package/);
});

test("the mirror README does not leak into the committed tree or the .sublime-package", async () => {
  assert.doesNotMatch(read("extras/obsidian/README.md"), /do not edit here/);
  const { packageEntries } = await import("./package-sublime.mjs");
  assert.ok(!(await packageEntries()).some((e) => /README/i.test(e.name)));
});

test("commit message is `sync from living-code vX.Y.Z (<short sha>)`", () => {
  assert.equal(commitMessage("0.1.1", "6f3855e1234567890"), "sync from living-code v0.1.1 (6f3855e)");
  assert.equal(COMMITTER.name, "ElliotLuque");
});

test("sublime: creates the version tag, skips one that exists", () => {
  assert.deepEqual(planSublimeTag({ version: "0.1.2", tags: ["v0.1.1"] }), { action: "create", tag: "v0.1.2" });
  assert.equal(planSublimeTag({ version: "0.1.1", tags: ["v0.1.1"] }).action, "skip");
  assert.equal(planSublimeTag({ version: "0.1.1", tags: [] }).tag, "v0.1.1");
});

test("obsidian: creates a new release without a v prefix, skips an identical one", () => {
  assert.deepEqual(planObsidianRelease({ version: "1.0.1", releases: ["1.0.0"], releasedCss: null, themeCss: "b" }), { action: "create", version: "1.0.1" });
  assert.equal(planObsidianRelease({ version: "1.0.0", releases: [], releasedCss: null, themeCss: "a" }).action, "create");
  assert.equal(planObsidianRelease({ version: "1.0.0", releases: ["1.0.0"], releasedCss: "a", themeCss: "a" }).action, "skip");
});

test("obsidian: fails with a clear message when theme.css changed but the version did not", () => {
  const plan = planObsidianRelease({ version: "1.0.0", releases: ["1.0.0"], releasedCss: "old", themeCss: "new" });
  assert.equal(plan.action, "fail");
  assert.match(plan.reason, /theme\.css changed/);
  assert.match(plan.reason, /OBSIDIAN_VERSION/);
});

test("obsidian: refuses a version below the latest release", () => {
  const plan = planObsidianRelease({ version: "0.1.1", releases: ["1.0.0", "0.9.0"], releasedCss: null, themeCss: "a" });
  assert.equal(plan.action, "fail");
  assert.match(plan.reason, /lower/);
  assert.equal(planObsidianRelease({ version: "1.10.0", releases: ["1.9.0"], releasedCss: null, themeCss: "a" }).action, "create");
});

test("without MIRROR_TOKEN the script warns and exits 0", () => {
  for (const target of ["obsidian", "sublime"]) {
    const env = { ...process.env };
    delete env.MIRROR_TOKEN;
    const r = spawnSync(process.execPath, [new URL("./mirror.mjs", import.meta.url).pathname, target], { encoding: "utf8", env });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /^::warning title=Mirror skipped::MIRROR_TOKEN is not set/);
  }
});

test("syncing the same files twice commits once and the second run changes nothing", () => {
  const work = mkdtempSync(join(tmpdir(), "mirror-test-"));
  const remote = join(work, "remote.git");
  execFileSync("git", ["init", "--quiet", "--bare", "-b", "main", remote]);
  const seed = join(work, "seed");
  execFileSync("git", ["clone", "--quiet", remote, seed], { stdio: "ignore" });
  const env = { ...process.env, GIT_AUTHOR_NAME: "x", GIT_AUTHOR_EMAIL: "x@x", GIT_COMMITTER_NAME: "x", GIT_COMMITTER_EMAIL: "x@x" };
  execFileSync("git", ["-C", seed, "commit", "--quiet", "--allow-empty", "-m", "init"], { env });
  execFileSync("git", ["-C", seed, "push", "--quiet", "origin", "HEAD:main"], { env, stdio: "ignore" });

  const files = mirrorFiles("sublime");
  const first = syncRepo({ remote, files, message: commitMessage(pkg.version, "abcdef123456"), dir: join(work, "a") });
  const second = syncRepo({ remote, files, message: "should not exist", dir: join(work, "b") });
  assert.equal(first.changed, true);
  assert.equal(second.changed, false);
  assert.equal(second.sha, first.sha);
  const log = execFileSync("git", ["-C", join(work, "b"), "log", "--format=%an <%ae>|%cn|%s%n%b"], { encoding: "utf8" });
  assert.match(log, new RegExp(`ElliotLuque <${COMMITTER.email.replace(/[+.]/g, "\\$&")}>\\|ElliotLuque\\|sync from living-code v${pkg.version} \\(abcdef1\\)`));
  assert.doesNotMatch(log, /Co-Authored-By/i);
});

test("syncing deletes files that no longer exist in living-code", () => {
  const work = mkdtempSync(join(tmpdir(), "mirror-test-"));
  const remote = join(work, "remote.git");
  execFileSync("git", ["init", "--quiet", "--bare", "-b", "main", remote]);
  const files = mirrorFiles("sublime");
  syncRepo({ remote, files: [...files, { path: "stale.txt", content: Buffer.from("x") }], message: "one", dir: join(work, "a") });
  syncRepo({ remote, files, message: "two", dir: join(work, "b") });
  assert.ok(!readdirSync(join(work, "b")).includes("stale.txt"));
  assert.ok(readdirSync(join(work, "b")).includes("README.md"));
});

test("release.yml mirrors after the release job, with MIRROR_TOKEN as the only extra secret", () => {
  const wf = read(".github/workflows/release.yml");
  const job = wf.split(/^  mirror:\n/m)[1];
  assert.match(job, /needs: release/);
  assert.match(job, /node scripts\/build\.mjs/);
  assert.match(job, /node scripts\/mirror\.mjs obsidian/);
  assert.match(job, /node scripts\/mirror\.mjs sublime/);
  assert.doesNotMatch(job, /contents: write|git (tag|push)/);
});
