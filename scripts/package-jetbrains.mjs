#!/usr/bin/env node
// Builds dist/jetbrains/living-code-jetbrains-<version>.zip, the plugin archive for JetBrains Marketplace and
// "Install Plugin from Disk". Layout:  living-code/lib/living-code.jar  (the jar holds META-INF/plugin.xml,
// the plugin icons and themes/*). Inputs come from the generator functions, never from the committed tree.
// Zero dependencies and deterministic: sorted entries, fixed DOS timestamps, fixed attributes, raw deflate level 9.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";
import { resolveAll } from "./resolve.mjs";
import { pluginFiles, pluginVersion } from "./ports/jetbrains.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
export const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

// 1980-01-01 00:00:00, the earliest value a DOS timestamp can hold.
const DOS_TIME = 0;
const DOS_DATE = (0 << 9) | (1 << 5) | 1;
const UTF8_FLAG = 0x0800;
const VERSION = 20;
const UNIX_MADE_BY = (3 << 8) | VERSION;

const u16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0); return b; };

// entries: [{ path, content: string | Buffer }] -> Buffer. A path ending in "/" is a directory entry.
export function zip(entries) {
  const sorted = [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const local = [], central = [];
  let offset = 0;
  for (const e of sorted) {
    const name = Buffer.from(e.path, "utf8");
    const dir = e.path.endsWith("/");
    const data = dir ? Buffer.alloc(0) : Buffer.from(e.content);
    const packed = dir ? data : deflateRawSync(data, { level: 9 });
    const method = dir ? 0 : 8;
    const crc = crc32(data);
    const attrs = ((dir ? 0o40755 : 0o100644) << 16) | (dir ? 0x10 : 0);
    const head = Buffer.concat([
      u32(0x04034b50), u16(VERSION), u16(UTF8_FLAG), u16(method), u16(DOS_TIME), u16(DOS_DATE),
      u32(crc), u32(packed.length), u32(data.length), u16(name.length), u16(0), name,
    ]);
    local.push(head, packed);
    central.push(Buffer.concat([
      u32(0x02014b50), u16(UNIX_MADE_BY), u16(VERSION), u16(UTF8_FLAG), u16(method), u16(DOS_TIME), u16(DOS_DATE),
      u32(crc), u32(packed.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0),
      u32(attrs), u32(offset), name,
    ]));
    offset += head.length + packed.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(sorted.length), u16(sorted.length), u32(cd.length), u32(offset), u16(0)]);
  return Buffer.concat([...local, cd, end]);
}

const dirsOf = (paths) => {
  const set = new Set();
  for (const p of paths) for (let i = p.indexOf("/"); i !== -1; i = p.indexOf("/", i + 1)) set.add(p.slice(0, i + 1));
  return [...set].map((path) => ({ path }));
};

export const JAR_NAME = "living-code.jar";
export const PLUGIN_DIR = "living-code";

export function buildJar(files) {
  const manifest = { path: "META-INF/MANIFEST.MF", content: "Manifest-Version: 1.0\r\nCreated-By: living-code scripts/package-jetbrains.mjs\r\n\r\n" };
  const all = [manifest, ...files];
  return zip([...dirsOf(all.map((e) => e.path)), ...all]);
}

export function buildPluginZip(flavors = resolveAll()) {
  const jar = buildJar(pluginFiles(flavors));
  const entries = [{ path: `${PLUGIN_DIR}/lib/${JAR_NAME}`, content: jar }];
  return zip([...dirsOf(entries.map((e) => e.path)), ...entries]);
}

export const zipName = (version = pluginVersion()) => `living-code-jetbrains-${version}.zip`;

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = join(root, "dist/jetbrains");
  mkdirSync(out, { recursive: true });
  const file = join(out, zipName());
  const buf = buildPluginZip();
  writeFileSync(file, buf);
  console.log(`Wrote ${file} (${buf.length} bytes)`);
}
