# Publishing npm packages

The repository is a private build project. Do not publish its root package. Only ports consumed from JavaScript or CSS tooling are published, each as its own package: `@living-code/expressive-code`, `@living-code/css`, `@living-code/tailwind` and `@living-code/palette` (JSON/JavaScript). A port opts in with an `npm: "<name>"` field. Native-app ports (editors, terminals, CLI tools, Firefox) are not published to npm.

All packages share the version in the root `package.json`. They contain only their own port files, a package README, and the MIT license. There are no runtime dependencies.

## First release

1. Create or obtain access to the `living-code` organization on [npm](https://www.npmjs.com). The GitHub repository name does not grant ownership of the npm scope. Ensure your npm account has permission to publish packages in that scope and enable two-factor authentication.
2. Log in:

   ```sh
   pnpm login
   pnpm whoami
   ```

3. Build and validate from the repository root:

   ```sh
   pnpm install --frozen-lockfile
   pnpm run build:packages
   pnpm run check
   pnpm test
   ```

4. Inspect the exact package contents before publishing:

   ```sh
   cd dist/npm/expressive-code
   pnpm pack --dry-run
   cd ../../..
   ```

5. Commit any source changes and make sure the working tree is clean; pnpm checks Git status before publishing. Publish a single package:

   ```sh
   pnpm publish ./dist/npm/expressive-code --access public
   ```

   Or publish all packages after reviewing them:

   ```sh
   for package in dist/npm/*/; do
     pnpm publish "$package" --access public || break
   done
   ```

   Complete npm’s authentication prompts as needed. The generated manifests also set `publishConfig.access` to `public`.

6. Verify the release:

   ```sh
   pnpm view @living-code/expressive-code version
   ```

## Subsequent releases

Commit your changes first. Bump the shared version, rebuild the packages, validate, and publish the packages you intend to release:

```sh
pnpm version patch
pnpm run build:packages
pnpm run check
pnpm test
pnpm publish ./dist/npm/expressive-code --access public
git push --follow-tags
```

Use `minor` or `major` instead of `patch` when appropriate. Published versions cannot be overwritten. If a multi-package release is interrupted, publish only the packages that did not succeed; do not attempt to republish successful versions.

Build output is in `dist/npm/` and is not committed. Building never publishes anything automatically.

# Publishing to editor marketplaces

Each editor port is built by CI (`package` workflow, artifacts on every push and PR) and published by hand. The generated README leads each install section with the marketplace route, so publish a channel before, or together with, merging a change that depends on it. Nothing here runs automatically: the `publish-*` workflows are `workflow_dispatch`-only and fail with a clear message when their secret is empty.

## VS Code Marketplace and Open VSX

Workflow: `publish-vscode.yml`. Secrets: `VSCE_PAT`, `OVSX_PAT`.

1. Marketplace: create an Azure DevOps organization, then a Personal Access Token with organization "All accessible organizations" and scope **Marketplace > Manage**. Create the publisher `elliotluque` at <https://marketplace.visualstudio.com/manage> (the ID must match `publisher` in `extras/vscode/package.json`). Add the token as the repository secret `VSCE_PAT`. Docs: <https://code.visualstudio.com/api/working-with-extensions/publishing-extension>.
2. Open VSX: create an Eclipse account with your GitHub username, log in at <https://open-vsx.org> with GitHub, link the Eclipse account and sign the Publisher Agreement, then generate a token under Settings > Access Tokens. Add it as `OVSX_PAT`. Create the namespace once, before the first publish: `npx ovsx create-namespace elliotluque -p <token>`. To get the verified badge, claim the namespace as described in the [Open VSX wiki](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions).
3. Run the **publish-vscode** workflow from the Actions tab. Both targets are on by default; untick one to skip it.

Local build: `pnpm run package:vscode` writes `dist/vscode/living-code-<version>.vsix`.

## Zed

Zed extensions are published by a pull request to <https://github.com/zed-industries/extensions>. There is no workflow and no secret. The extension lives in `extras/zed` (`extension.toml`, `themes/living-code.json`, `LICENSE`). The draft registry entry is in the pull request description that introduced it. Docs: <https://zed.dev/docs/extensions/developing-extensions>.

## Sublime Text (Package Control)

Package Control installs the GitHub archive of a semver tag, so publishing means tagging `v<version>`, then adding the entry to `repository/l.json` in <https://github.com/sublimehq/package_control_channel> through a pull request. The archive is the whole repository, because Package Control cannot select a subfolder of a tag archive. Restricting it with `export-ignore` in `.gitattributes` would also strip every other source archive of the repository (GitHub release "Source code" downloads, Nix and Homebrew tarballs), so that is deliberately not done. A dedicated package repository would fix it, and creating one needs Elliot's sign-off. `pnpm run package:sublime` builds `dist/sublime/Living Code.sublime-package`, which the `release` workflow attaches to the GitHub release for manual installs.

## GitHub releases

The `release` workflow runs only when Elliot pushes a `v*` tag. It builds the `.vsix`, the JetBrains plugin zip and the `.sublime-package` and attaches them to the GitHub release for that tag. The README fallback installs (VS Code `.vsix`, JetBrains zip) download from there, so they work once the first release exists. It needs no secrets beyond the built-in `GITHUB_TOKEN`.

## Chrome Web Store

Night and Paper are separate Manifest V3 themes in `extras/chrome/living-code-night` and `extras/chrome/living-code-paper`. There is no publishing workflow: the first upload is manual. CI (`package` workflow) builds `living-code-chrome-night.zip` and `living-code-chrome-paper.zip`, and the `release` workflow attaches them to the GitHub release. Locally: `pnpm run package:chrome` writes both to `dist/chrome/`.

1. Register a developer account at <https://chrome.google.com/webstore/devconsole> and pay the one-time $5 registration fee.
2. In the dashboard click **New item**, upload `living-code-chrome-night.zip`, and fill in the listing: category *Themes*, a short description, at least one screenshot, and the privacy fields (the theme collects no data). Repeat with the Paper zip as a second item. Each is its own listing, because a theme is one item.
3. Submit each for review. A theme has no code, so review is usually quick.
4. Docs: <https://developer.chrome.com/docs/webstore/publish> and <https://developer.chrome.com/docs/webstore/program-policies> (the repetitive-content policy is why Frost and Signal are not offered).

The manifests use the icons at 48 and 128 pixels; there is no 16 pixel icon. After the listings are live, the README's Chrome step can name them directly.

## Obsidian community themes

`extras/obsidian/` is laid out as the root of the theme's own repository: `manifest.json`, `theme.css`, `README.md`, `LICENSE`, `screenshot.png` (512x288, regenerate with `node scripts/obsidian-screenshot.mjs`) and `snippets/`. Obsidian requires that layout at a repository root, so the theme needs its own repository. Creating it needs Elliot's sign-off, so it has not been created.

1. Create a public GitHub repository for the theme (for example `ElliotLuque/obsidian-living-code`) and copy the contents of `extras/obsidian/` into its root.
2. Create the GitHub release `1.0.0`. The tag must equal `version` in `manifest.json`, and `manifest.json` and `theme.css` must be attached to the release as binary files.
3. Make sure `manifest.json` is committed on the default branch of that repository (the directory reads it from the HEAD of the default branch). Sign in at <https://community.obsidian.md>, link your GitHub account, and choose **Add your theme**.
4. Docs: <https://docs.obsidian.md/Themes/App+themes/Submit+your+theme>. The older route, a pull request to `obsidianmd/obsidian-releases` adding an entry to `community-css-themes.json`, is the legacy format and is no longer what the docs describe. Obsidian's review takes weeks, so the README keeps the manual route as the fallback.
5. Optional: `extras/obsidian/screenshot.png` is a generated mock-up, not a capture of Obsidian. Replace it with a real screenshot before submitting if the reviewers ask for one.
