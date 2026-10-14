#!/usr/bin/env node
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPackages } from "./npm-packages.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packages = await buildPackages(join(root, "dist/npm"));
for (const pkg of packages) console.log(`${pkg.name}: ${pkg.payload.length} files`);
console.log(`Built ${packages.length} packages in dist/npm/`);
