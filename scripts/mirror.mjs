#!/usr/bin/env node
// Mirrors extras/obsidian/ and extras/sublime/ into the two repositories Obsidian and Package Control need
// (the files have to sit at a repository root). Nobody edits those repositories by hand: the release workflow
// calls `node scripts/mirror.mjs <obsidian|sublime>` after `node scripts/build.mjs`.
//
// Everything that decides something (which files, which tag, which release) is a pure function so the tests
// run without GitHub. The git and gh calls are thin and sit at the bottom.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { themeReadme } from "./ports/obsidian.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const MAIN_REPO = "ElliotLuque/living-code";
export const MIRRORS = {
  obsidian: { repo: "ElliotLuque/living-code-obsidian", dir: "extras/obsidian" },
  sublime: { repo: "ElliotLuque/living-code-sublime", dir: "extras/sublime" },
};
export const COMMITTER = { name: "ElliotLuque", email: "72250839+ElliotLuque@users.noreply.github.com" };

const notice = (target) => `> **Generated from [living-code](https://github.com/${MAIN_REPO}) — do not edit here.** Open issues and pull requests in [living-code](https://github.com/${MAIN_REPO}). This repository is overwritten on every release (${MIRRORS[target].repo}).
`;

export const obsidianReadme = () => `${notice("obsidian")}\n${themeReadme()}`;

export const sublimeReadme = () => `${notice("sublime")}
# Living Code for Sublime Text

Color schemes from [Living Code](https://github.com/${MAIN_REPO}), one \`.sublime-color-scheme\` file per flavor: Night, Frost, Paper and Signal. Targets Sublime Text 4.

## Install

**Package Control:** run *Package Control: Install Package* and choose **Living Code**. This works once the package is listed in the Package Control channel.

**Manual:** copy the four \`living-code-*.sublime-color-scheme\` files from this repository into your \`Packages/User\` folder (*Preferences → Browse Packages…*).

Then pick *Preferences → Select Color Scheme → Living Code Night* (or *UI: Select Color Scheme*).

## License

MIT
`;

const READMES = { obsidian: obsidianReadme, sublime: sublimeReadme };

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
}

/** The complete contents of a mirror repository: [{ path, content: Buffer }], sorted by path. */
export function mirrorFiles(target, base = root) {
  const { dir } = MIRRORS[target];
  const files = new Map();
  for (const file of walk(join(base, dir))) files.set(relative(join(base, dir), file).split("\\").join("/"), readFileSync(file));
  files.set("LICENSE", readFileSync(join(base, "LICENSE")));
  files.set("README.md", Buffer.from(READMES[target](), "utf8"));
  return [...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([path, content]) => ({ path, content }));
}

export const commitMessage = (version, sha) => `sync from living-code v${version} (${sha.slice(0, 7)})`;

/** Sublime: Package Control installs the archive of tag vX.Y.Z. Never move a tag that exists. */
export function planSublimeTag({ version, tags }) {
  const tag = `v${version}`;
  return tags.includes(tag) ? { action: "skip", tag, reason: `tag ${tag} already exists` } : { action: "create", tag };
}

const semver = (v) => v.split(".").map((n) => parseInt(n, 10) || 0);
export function compareVersions(a, b) {
  const [x, y] = [semver(a), semver(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
}

/**
 * Obsidian: the release tag is manifest.json's version, with no "v". `releases` are the existing release tags and
 * `releasedCss` is theme.css of the release for `version` (null when there is none). Obsidian never moves to a
 * lower version, so a version below the latest release is as unpublishable as a theme.css that changed under the
 * same version.
 */
export function planObsidianRelease({ version, releases, releasedCss, themeCss }) {
  if (releases.includes(version)) {
    return releasedCss === themeCss
      ? { action: "skip", version, reason: `release ${version} already exists` }
      : { action: "fail", version, reason: `theme.css changed but the version is still ${version}, so the change would never reach Obsidian users. Bump OBSIDIAN_VERSION in scripts/ports/obsidian.mjs, run node scripts/build.mjs and release again.` };
  }
  const latest = releases.reduce((best, r) => (best === null || compareVersions(r, best) > 0 ? r : best), null);
  if (latest !== null && compareVersions(version, latest) < 0) {
    return { action: "fail", version, reason: `version ${version} is lower than the latest release ${latest}; Obsidian does not update to a lower version. Raise OBSIDIAN_VERSION in scripts/ports/obsidian.mjs.` };
  }
  return { action: "create", version };
}

// ---- impure: git and gh ---------------------------------------------------------------------------------------

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], ...opts }).trim();
const gitEnv = { ...process.env, GIT_AUTHOR_NAME: COMMITTER.name, GIT_AUTHOR_EMAIL: COMMITTER.email, GIT_COMMITTER_NAME: COMMITTER.name, GIT_COMMITTER_EMAIL: COMMITTER.email };

/** Clones `remote`, replaces everything but .git with `files`, commits and pushes if anything changed. */
export function syncRepo({ remote, files, message, dir }) {
  const git = (...a) => run("git", a, { cwd: dir, env: gitEnv });
  run("git", ["clone", "--quiet", remote, dir], { env: gitEnv });
  for (const name of readdirSync(dir)) if (name !== ".git") rmSync(join(dir, name), { recursive: true, force: true });
  for (const { path, content } of files) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  git("add", "-A");
  const changed = git("status", "--porcelain") !== "";
  if (changed) {
    git("commit", "--quiet", "-m", message);
    git("push", "--quiet", "origin", "HEAD");
  }
  return { changed, sha: git("rev-parse", "HEAD") };
}

export function remoteTags({ remote, dir }) {
  return run("git", ["ls-remote", "--tags", remote], { cwd: dir, env: gitEnv }).split("\n").filter(Boolean).map((l) => l.split("refs/tags/")[1]).filter((t) => t && !t.endsWith("^{}"));
}

export function mirror(target, { token, version, sha, work = mkdtempSync(join(tmpdir(), `mirror-${target}-`)) }) {
  const { repo } = MIRRORS[target];
  const remote = `https://x-access-token:${token}@github.com/${repo}.git`;
  const dir = join(work, "repo");
  const files = mirrorFiles(target);
  const message = commitMessage(version, sha);
  const say = (m) => console.log(`${target}: ${m}`);

  if (target === "obsidian") {
    const manifest = JSON.parse(files.find((f) => f.path === "manifest.json").content.toString("utf8"));
    const themeCss = files.find((f) => f.path === "theme.css").content.toString("utf8");
    const gh = (...a) => run("gh", a, { env: { ...process.env, GH_TOKEN: token } });
    const releases = JSON.parse(gh("release", "list", "--repo", repo, "--limit", "200", "--json", "tagName")).map((r) => r.tagName);
    let releasedCss = null;
    if (releases.includes(manifest.version)) {
      const out = join(work, "released");
      gh("release", "download", manifest.version, "--repo", repo, "--pattern", "theme.css", "--dir", out);
      releasedCss = readFileSync(join(out, "theme.css"), "utf8");
    }
    const plan = planObsidianRelease({ version: manifest.version, releases, releasedCss, themeCss });
    if (plan.action === "fail") {
      console.log(`::error title=Obsidian theme changed without a version bump::${plan.reason}`);
      throw new Error(plan.reason);
    }
    const { changed, sha: head } = syncRepo({ remote, files, message, dir });
    say(changed ? "pushed a sync commit" : "nothing changed, no commit");
    if (plan.action === "create") {
      gh("release", "create", plan.version, "--repo", repo, "--title", plan.version, "--notes", `Synced from ${MAIN_REPO} v${version}.`, "--target", head, join(dir, "manifest.json"), join(dir, "theme.css"));
      say(`created release ${plan.version}`);
    } else say(plan.reason);
    return;
  }

  const { changed } = syncRepo({ remote, files, message, dir });
  say(changed ? "pushed a sync commit" : "nothing changed, no commit");
  const plan = planSublimeTag({ version, tags: remoteTags({ remote, dir }) });
  if (plan.action === "create") {
    run("git", ["tag", plan.tag], { cwd: dir, env: gitEnv });
    run("git", ["push", "--quiet", "origin", `refs/tags/${plan.tag}`], { cwd: dir, env: gitEnv });
    say(`created tag ${plan.tag}`);
  } else say(plan.reason);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const target = process.argv[2];
  if (!MIRRORS[target]) {
    console.error("usage: node scripts/mirror.mjs <obsidian|sublime>");
    process.exit(2);
  }
  const token = process.env.MIRROR_TOKEN;
  if (!token) {
    console.log("::warning title=Mirror skipped::MIRROR_TOKEN is not set, so the mirror repositories were not updated. See docs/DISTRIBUTION.md, Mirror repos.");
    process.exit(0);
  }
  const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
  mirror(target, { token, version, sha: process.env.GITHUB_SHA ?? run("git", ["rev-parse", "HEAD"], { cwd: root }) });
}
