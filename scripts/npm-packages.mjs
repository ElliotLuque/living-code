import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { ports } from "./ports/index.mjs";
import { resolveAll } from "./resolve.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Only ports consumed from JavaScript or CSS build tooling ship as npm packages.
// Native apps (editors, terminals, Firefox, ...) install from their own files or stores.
export const npmPorts = ports.filter((port) => port.npm);

export async function buildPackages(outDir) {
  const meta = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const license = await readFile(join(root, "LICENSE"));
  const flavors = resolveAll();
  const packages = [];
  // This directory contains only build output; remove retired packages and stale files.
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const port of npmPorts) {
    const id = port.npm;
    const name = `@living-code/${id}`;
    const dir = join(outDir, id);
    await mkdir(dir, { recursive: true });
    const sources = new Set([
      ...flavors.flatMap((f) => port.files(f)),
      ...(port.all?.(flavors) ?? []),
    ].map((file) => file.path));
    const payload = [];
    for (const source of [...sources].sort()) {
      const path = source.startsWith(`extras/${port.id}/`) ? relative(`extras/${port.id}`, source) : source;
      const target = join(dir, path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, await readFile(join(root, source)));
      payload.push(path);
    }
    const exports = Object.fromEntries(payload.map((path) => [`./${path}`, `./${path}`]));
    if (id === "palette") exports["."] = "./palette.mjs";
    const manifest = {
      name,
      version: meta.version,
      description: `Living Code themes for ${port.name}.`,
      type: "module",
      license: meta.license,
      author: meta.author,
      repository: meta.repository,
      homepage: "https://github.com/ElliotLuque/living-code",
      keywords: [...new Set([...meta.keywords, id])],
      publishConfig: { access: "public" },
      files: payload,
      exports,
      ...(id === "palette" ? { main: "./palette.mjs" } : {}),
      ...(["css", "tailwind"].includes(id) ? { sideEffects: true } : {}),
    };
    const install = port.install
      .replaceAll(`extras/${port.id}/`, `node_modules/${name}/`)
      .replaceAll("](#", "](https://github.com/ElliotLuque/living-code#");
    const readme = `# ${name}\n\n${manifest.description}\n\n## Installation\n\n\`\`\`sh\npnpm add ${name}\n\`\`\`\n\n${install}\n\n## License\n\nMIT © Elliot Luque\n`;
    await writeFile(join(dir, "package.json"), JSON.stringify(manifest, null, 2) + "\n");
    await writeFile(join(dir, "README.md"), readme);
    await writeFile(join(dir, "LICENSE"), license);
    packages.push({ id, name, dir, payload });
  }
  return packages;
}
