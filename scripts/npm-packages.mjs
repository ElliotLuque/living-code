import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { ports } from "./ports/index.mjs";
import { resolveAll } from "./resolve.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const packageId = (port) => port.id === "json" ? "palette" : port.id;

async function walk(dir) {
  const entries = await readdir(join(root, dir), { withFileTypes: true });
  const paths = await Promise.all(entries.map((entry) => {
    const path = `${dir}/${entry.name}`;
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return paths.flat().sort();
}

export async function buildPackages(outDir) {
  const meta = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const license = await readFile(join(root, "LICENSE"));
  const flavors = resolveAll();
  const packages = [];
  // This directory contains only build output; remove retired packages and stale files.
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const port of ports) {
    const id = packageId(port);
    const name = `@living-code/${id}`;
    const dir = join(outDir, id);
    await mkdir(dir, { recursive: true });
    const sources = new Set([
      ...flavors.flatMap((f) => port.files(f)),
      ...(port.all?.(flavors) ?? []),
    ].map((file) => file.path));
    if (port.id === "neovim") {
      for (const path of await walk("lua")) sources.add(path);
    }
    if (port.id === "firefox") {
      for (const file of [...sources]) {
        if (file.endsWith("/manifest.json")) {
          for (const path of await walk(`${dirname(file)}/icons`)) sources.add(path);
        }
      }
    }
    const payload = [];
    for (const source of [...sources].sort()) {
      const path = source.startsWith(`extras/${port.id}/`)
        ? `${port.id === "vscode" ? "extension/" : ""}${relative(`extras/${port.id}`, source)}`
        : source;
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
      .replaceAll(`extras/${port.id}/`, `node_modules/${name}/${port.id === "vscode" ? "extension/" : ""}`)
      .replaceAll("](#expressive-code)", "](https://github.com/ElliotLuque/living-code#expressive-code)");
    const readme = `# ${name}\n\n${manifest.description}\n\n## Installation\n\n\`\`\`sh\npnpm add ${name}\n\`\`\`\n\nTheme files are installed in \`node_modules/${name}/\`.\n\n${port.id === "neovim" ? "The installed package is a Neovim plugin. Add its directory to your runtime path, or use the repository with your plugin manager as shown below.\n\n" : ""}${install}\n\n## License\n\nMIT © Elliot Luque\n`;
    await writeFile(join(dir, "package.json"), JSON.stringify(manifest, null, 2) + "\n");
    await writeFile(join(dir, "README.md"), readme);
    await writeFile(join(dir, "LICENSE"), license);
    packages.push({ id, name, dir, payload });
  }
  return packages;
}
