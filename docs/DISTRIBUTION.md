# Distribution

Where each Living Code port is (or will be) listed, and exactly what is left to do. Everything below is prepared up to the step only Elliot can do: creating accounts, adding secrets, pushing tags and submitting. The README already leads with these routes, so submit a channel before, or together with, merging a change that depends on it.

Packaging detail and the publish workflows are in [PUBLISHING.md](PUBLISHING.md). Every artifact below is also attached to the GitHub release when you push a `v*` tag (see [Releases](#releases)).

| Channel | Status | Cost | Credential |
|---|---|---|---|
| [VS Code Marketplace](#vs-code-marketplace) | ready | free | `VSCE_PAT` |
| [Open VSX](#open-vsx) | ready | free | `OVSX_PAT` |
| [JetBrains Marketplace](#jetbrains-marketplace) | ready | free | `JETBRAINS_MARKETPLACE_TOKEN` (later uploads only) |
| [Zed registry](#zed-registry) | ready | free | GitHub account |
| [Chrome Web Store](#chrome-web-store) | ready | $5 one-time | Google account |
| [Obsidian community themes](#obsidian-community-themes) | ready | free | GitHub account, new repo |
| [Sublime Package Control](#sublime-package-control) | needs a dedicated repo | free | GitHub account |

"Ready" means the package builds in CI and the install text in the README already assumes the listing exists. Nothing is live yet except the two Firefox themes.

## Releases

Push a version tag and the `release` workflow builds every artifact and attaches it to a GitHub release. It needs no secrets and runs only on `v*` tags.

1. Make sure `main` is green and `version` in the root `package.json` is the version to release (the tag must be `v` plus that version; the workflow fails with a clear message otherwise).
2. `git tag v0.1.0 && git push origin v0.1.0`.

Attached: `living-code-<version>.vsix`, `living-code-jetbrains-<version>.zip`, `Living Code.sublime-package`, `living-code-chrome-night.zip`, `living-code-chrome-paper.zip`, `living-code-firefox-night.xpi`, `living-code-firefox-paper.xpi` and `living-code-extras.zip` (all of `extras/`). The README fallbacks link to <https://github.com/ElliotLuque/living-code/releases/latest>.

## VS Code Marketplace

- **Status:** ready.
- **Submit:** `extras/vscode/` (packaged by `pnpm run package:vscode` into `dist/vscode/living-code-<version>.vsix`, or the `.vsix` from a release).
- **Rules:** <https://code.visualstudio.com/api/working-with-extensions/publishing-extension>
- **Account / secret:** an Azure DevOps organization, a publisher `elliotluque` (must match `publisher` in `extras/vscode/package.json`), and a Personal Access Token with scope *Marketplace > Manage*, stored as the repository secret `VSCE_PAT`.
- **Cost:** free.

1. Create the Azure DevOps organization and the PAT (organization: *All accessible organizations*, scope *Marketplace > Manage*).
2. Create the publisher `elliotluque` at <https://marketplace.visualstudio.com/manage>.
3. Add the PAT as the repository secret `VSCE_PAT` (Settings > Secrets and variables > Actions).
4. Run the **publish-vscode** workflow from the Actions tab with *VS Code Marketplace* ticked. It fails with a clear message if the secret is empty.

## Open VSX

Used by Cursor, VSCodium, Windsurf and other forks.

- **Status:** ready.
- **Submit:** the same `extras/vscode/` extension.
- **Rules:** <https://github.com/eclipse/openvsx/wiki/Publishing-Extensions>
- **Account / secret:** an Eclipse account with your GitHub username, a login at <https://open-vsx.org>, the signed Publisher Agreement, and an access token, stored as `OVSX_PAT`.
- **Cost:** free.

1. Create the Eclipse account, log in to open-vsx.org with GitHub, link the accounts and sign the Publisher Agreement.
2. Generate a token under *Settings > Access Tokens* and add it as the repository secret `OVSX_PAT`.
3. Create the namespace once: `npx ovsx create-namespace elliotluque -p <token>`.
4. Run the **publish-vscode** workflow with *Open VSX* ticked (both targets are on by default).
5. Optional: claim the namespace for the verified badge, as described in the wiki above.

## JetBrains Marketplace

- **Status:** ready. Untested in a JetBrains IDE.
- **Submit:** the plugin zip from `pnpm run package:jetbrains` (`dist/jetbrains/living-code-jetbrains-<version>.zip`, also a release asset). Its layout is in `extras/jetbrains/`; the plugin id is `com.elliotluque.livingcode`.
- **Rules:** <https://plugins.jetbrains.com/docs/intellij/publishing-plugin.html> and <https://plugins.jetbrains.com/docs/marketplace/uploading-a-new-plugin.html>
- **Account / secret:** a JetBrains account. The first upload is manual (the upload API cannot create a plugin). Later versions use a permanent token as `JETBRAINS_MARKETPLACE_TOKEN`.
- **Cost:** free.

1. Build or download the zip.
2. Upload it by hand at <https://plugins.jetbrains.com/plugin/add>. JetBrains reviews the first version.
3. Once the plugin exists, create a permanent token at <https://plugins.jetbrains.com/author/me/tokens> and add it as `JETBRAINS_MARKETPLACE_TOKEN`.
4. For later versions, bump `version` and run the **publish-jetbrains** workflow (Marketplace rejects a version it has already seen).

## Zed registry

- **Status:** ready.
- **Submit:** `extras/zed/` (`extension.toml`, `themes/living-code.json`, `LICENSE`), as a pull request to <https://github.com/zed-industries/extensions>.
- **Rules:** <https://zed.dev/docs/extensions/publishing/overview> (every submission is reviewed; the extension's `id` is `living-code-theme`)
- **Account / secret:** a GitHub account. No secret.
- **Cost:** free.

1. Fork `zed-industries/extensions`.
2. Add this repository as a submodule: `git submodule add https://github.com/ElliotLuque/living-code.git extensions/living-code-theme`, then `git add extensions/living-code-theme`.
3. Because the extension is not at the repository root, add `path = "extras/zed"` to its entry.
4. Add the entry to `extensions.toml`, then run `pnpm sort-extensions` in the fork:

   ```toml
   [living-code-theme]
   submodule = "extensions/living-code-theme"
   path = "extras/zed"
   version = "0.1.0"
   ```

5. Open the pull request and wait for review. The `version` must equal `version` in `extras/zed/extension.toml`.

## Chrome Web Store

- **Status:** ready. Night and Paper are separate themes, so there are two listings.
- **Submit:** `living-code-chrome-night.zip` and `living-code-chrome-paper.zip` (`pnpm run package:chrome` writes them to `dist/chrome/`; also release assets). Sources: `extras/chrome/living-code-night` and `extras/chrome/living-code-paper`.
- **Rules:** <https://developer.chrome.com/docs/webstore/publish> and <https://developer.chrome.com/docs/webstore/program-policies> (the repetitive-content policy is why Frost and Signal are not offered).
- **Account / secret:** a Google account registered as a Chrome Web Store developer. No secret; there is no publish workflow.
- **Cost:** **$5 one-time** developer registration fee.

1. Register at <https://chrome.google.com/webstore/devconsole> and pay the $5 fee.
2. Click **New item**, upload `living-code-chrome-night.zip`.
3. Fill in the listing: category *Themes*, a short description, at least one screenshot, and the privacy fields (the theme collects no data).
4. Submit for review. Repeat with the Paper zip as a second item.
5. When both are live, tell Coder to replace the "pending" step in the README's Chrome section with the listing links.

## Obsidian community themes

- **Status:** ready, but it needs its own repository first.
- **Submit:** the contents of `extras/obsidian/` (`manifest.json`, `theme.css`, `README.md`, `LICENSE`, `screenshot.png`, `snippets/`) as the root of a new public repository `living-code-obsidian`. Obsidian requires these at the repository root. `screenshot.png` is a generated mock-up (regenerate with `node scripts/obsidian-screenshot.mjs`); swap in a real capture if reviewers ask.
- **Rules:** <https://docs.obsidian.md/Themes/App+themes/Submit+your+theme>
- **Account / secret:** a GitHub account and an Obsidian account. No secret.
- **Cost:** free.

1. Create the public repository `ElliotLuque/living-code-obsidian` and copy the contents of `extras/obsidian/` into its root, committed on the default branch.
2. Create a GitHub release whose tag equals `version` in `manifest.json` (currently `1.0.0`, no `v` prefix), and attach `manifest.json` and `theme.css` to it as binary files.
3. Sign in at <https://community.obsidian.md>, link your GitHub account and choose **Add your theme**. The directory reads `manifest.json` from the default branch and runs an automated review; fix anything it reports with a new release and a higher version.

**The `community-css-themes.json` route.** The older route was a pull request to <https://github.com/obsidianmd/obsidian-releases> adding an entry to `community-css-themes.json`. Obsidian's current theme docs (above) describe only the web form, so use that. If a reviewer ever asks for the legacy entry, it is:

```json
{
  "name": "Living Code",
  "author": "Elliot Luque",
  "repo": "ElliotLuque/living-code-obsidian",
  "screenshot": "screenshot.png",
  "modes": ["dark", "light"]
}
```

## Sublime Package Control

- **Status:** the package builds, but Package Control's rules say the package must sit at the **repository root**, one package per repository. The color schemes live in `extras/sublime/` here, so a submission needs a dedicated repository (for example `ElliotLuque/living-code-sublime`) holding the four `.sublime-color-scheme` files at its root. Creating it needs your sign-off, so it has not been created. Decide this before step 1.
- **Submit:** the `Living Code` package, as an entry in the `repository/` folder of <https://github.com/sublimehq/package_control_channel> (the file is chosen by the first letter of the name: `l.json`) through a pull request. Package Control installs the GitHub archive of a semver tag, so the tag on the dedicated repository is the package version.
- **Rules:** <https://packagecontrol.io/docs/submitting_a_package> (semver tags only; the entry may not contain `version`, `url` or `date`)
- **Account / secret:** a GitHub account. No secret.
- **Cost:** free.

1. Elliot creates the public repository `ElliotLuque/living-code-sublime` first (same as `living-code-obsidian` above), with the files from `extras/sublime/` at its root, and pushes a semver tag (for example `v0.1.0`). The `details` URL below must point at this repository, never at `living-code`.
2. Fork `sublimehq/package_control_channel`.
3. Add an entry to `repository/l.json` (keep the file's alphabetical order):

   ```json
   {
     "name": "Living Code",
     "details": "https://github.com/ElliotLuque/living-code-sublime",
     "labels": ["color scheme"],
     "releases": [{ "sublime_text": "4000 - ", "tags": true }]
   }
   ```

4. Install the ChannelRepositoryTools package, run *ChannelRepositoryTools: Test Default Channel*, and open the pull request once the tests pass.

Until then the README's manual install (a one-line download into `Packages/User`) and the `Living Code.sublime-package` release asset work without Package Control.

## Firefox AMO

Living Code Night and Paper are live on Firefox Add-ons:

- <https://addons.mozilla.org/firefox/addon/living-code-night/>
- <https://addons.mozilla.org/firefox/addon/living-code-paper/>

Browser themes colour only backgrounds, borders and one accent, and in those slots Frost and Signal are identical to or barely different from Night. AMO rejects duplicate themes, so Frost and Signal are not shipped as Firefox themes at all (decision recorded in ELL-13). The release attaches unsigned `.xpi` files for Night and Paper only, for Firefox Developer Edition, Nightly and ESR with signature checks off. Release Firefox users should use the AMO listings.

## Not pursued

Elliot did not authorize these. This is only a record of what each would unlock, not a how-to.

- **iTerm2-Color-Schemes:** feeds Ghostty's and WezTerm's built-in theme lists, plus Windows Terminal, Alacritty and many other terminals' presets, so one submission would put Living Code in all of them.
- **kitty-themes:** the source of `kitten themes`, so kitty users could pick Living Code from the built-in browser.
- **alacritty-theme:** the community collection Alacritty's docs point to for ready-made themes.
- **Helix:** a theme merged upstream ships with Helix, so `:theme living-code-night` would work with no download.
- **btop:** themes merged upstream ship with btop's own theme folder.
- **tinted-theming:** the base16/base24 schemes repository; Stylix, `tinty` and base16-shell pull from it.
- **yazi flavors:** the official flavors list, which lets `ya pkg add` install a flavor by name.
