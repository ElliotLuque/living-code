#!/usr/bin/env node
// Builds dist/sublime/Living Code.sublime-package.
//
// A .sublime-package is a plain zip archive. Sublime Text loads resources from it
// directly, so the four .sublime-color-scheme files sit at the archive root and
// nothing needs unpacking. The scheme files come from the Sublime port generator,
// not from the committed tree, so the archive is always current.
//
// The zip writer is hand-rolled (zero dependencies) and deterministic: entries are
// sorted, timestamps are fixed and compression is deflate level 9, so two builds
// of the same inputs are byte-identical.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { deflateRawSync } from "node:zlib";
import { sublime } from "./ports/sublime.mjs";
import { resolveAll } from "./resolve.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const PACKAGE_NAME = "Living Code";
export const PACKAGE_FILE = `${PACKAGE_NAME}.sublime-package`;
export const OUT_DIR = join(root, "dist", "sublime");

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// 1980-01-01 00:00:00, the earliest timestamp the zip format can express.
const DOS_TIME = 0;
const DOS_DATE = (0 << 9) | (1 << 5) | 1;
const VERSION_NEEDED = 20;
const VERSION_MADE_BY = (3 << 8) | 20; // Unix host, zip spec 2.0
const FLAG_UTF8 = 0x0800;
const METHOD_DEFLATE = 8;
const FILE_MODE = 0o100644;

/** @param {{ name: string, data: Buffer }[]} entries */
export function zip(entries) {
  const sorted = [...entries].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  if (new Set(sorted.map((e) => e.name)).size !== sorted.length) throw new Error("duplicate zip entry name");
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const { name, data } of sorted) {
    const nameBuf = Buffer.from(name, "utf8");
    const body = deflateRawSync(data, { level: 9 });
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(VERSION_NEEDED, 4);
    local.writeUInt16LE(FLAG_UTF8, 6);
    local.writeUInt16LE(METHOD_DEFLATE, 8);
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuf, body);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(VERSION_MADE_BY, 4);
    entry.writeUInt16LE(VERSION_NEEDED, 6);
    entry.writeUInt16LE(FLAG_UTF8, 8);
    entry.writeUInt16LE(METHOD_DEFLATE, 10);
    entry.writeUInt16LE(DOS_TIME, 12);
    entry.writeUInt16LE(DOS_DATE, 14);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(body.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(nameBuf.length, 28);
    entry.writeUInt16LE(0, 30); // extra field length
    entry.writeUInt16LE(0, 32); // comment length
    entry.writeUInt16LE(0, 34); // disk number start
    entry.writeUInt16LE(0, 36); // internal attributes
    entry.writeUInt32LE((FILE_MODE << 16) >>> 0, 38);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, nameBuf);

    offset += local.length + nameBuf.length + body.length;
  }
  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(sorted.length, 8);
  end.writeUInt16LE(sorted.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, centralBuf, end]);
}

/** Entries of the package: scheme files from the generator, plus the license. */
export async function packageEntries() {
  const schemes = resolveAll().flatMap((f) => sublime.files(f));
  const license = await readFile(join(root, "LICENSE"));
  return [
    ...schemes.map(({ path, content }) => ({ name: basename(path), data: Buffer.from(content, "utf8") })),
    { name: "LICENSE", data: license },
  ];
}

export async function buildSublimePackage() {
  const entries = await packageEntries();
  return { entries, buffer: zip(entries) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { entries, buffer } = await buildSublimePackage();
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, PACKAGE_FILE), buffer);
  console.log(`wrote dist/sublime/${PACKAGE_FILE} (${entries.length} files, ${buffer.length} bytes)`);
}
