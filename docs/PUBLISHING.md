# Publishing npm packages

The repository is a private build project. Do not publish its root package. Each registered port is published independently as `@living-code/<port>`; the JSON/JavaScript palette is `@living-code/palette`.

All packages share the version in the root `package.json`. They contain only their own port files, a package README, and the MIT license. There are no runtime dependencies. The VS Code extension keeps its original marketplace manifest inside `extension/`, and the Neovim package includes its runtime files. Firefox packages distribute source themes, not signed add-ons; Firefox Add-ons remains the recommended installation route.

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

   Or publish all ports after reviewing them:

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
