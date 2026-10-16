import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { inflateRawSync } from "node:zlib";
import { buildPluginZip, crc32, zip, zipName } from "./package-jetbrains.mjs";
import { editorScheme, namedColors, pluginFiles, pluginVersion, pluginXml, themeJson, SINCE_BUILD } from "./ports/jetbrains.mjs";
import { resolveAll } from "./resolve.mjs";

const flavors = resolveAll();
const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

// Minimal independent zip reader (central directory), enough to check what the packager wrote.
function unzip(buf) {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(eocd >= 0, "end of central directory record");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out = new Map();
  for (let i = 0; i < count; i++) {
    assert.equal(buf.readUInt32LE(p), 0x02014b50);
    const method = buf.readUInt16LE(p + 10), crc = buf.readUInt32LE(p + 16);
    const csize = buf.readUInt32LE(p + 20), size = buf.readUInt32LE(p + 24);
    const n = buf.readUInt16LE(p + 28), m = buf.readUInt16LE(p + 30), k = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + n);
    const dataAt = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(dataAt, dataAt + csize);
    const data = method === 8 ? inflateRawSync(raw) : raw;
    assert.equal(data.length, size, `${name} size`);
    assert.equal(crc32(data), crc, `${name} crc`);
    out.set(name, data);
    p += 46 + n + m + k;
  }
  return out;
}

test("crc32 matches the standard check value", () => {
  assert.equal(crc32(Buffer.from("123456789")), 0xcbf43926);
});

test("zip() is order independent and round-trips", () => {
  const a = [{ path: "b.txt", content: "two" }, { path: "a/", }, { path: "a/x.txt", content: "one" }];
  const z1 = zip(a), z2 = zip([...a].reverse());
  assert.ok(z1.equals(z2));
  const files = unzip(z1);
  assert.deepEqual([...files.keys()], ["a/", "a/x.txt", "b.txt"]);
  assert.equal(files.get("a/x.txt").toString(), "one");
});

test("plugin.xml carries the required Marketplace fields", () => {
  const xml = pluginXml(flavors);
  assert.match(xml, /<id>com\.elliotluque\.livingcode<\/id>/);
  assert.match(xml, /<name>Living Code<\/name>/);
  assert.match(xml, /<version>[^<]+<\/version>/);
  assert.equal(pluginVersion(), pkg.version);
  assert.ok(xml.includes(`<version>${pkg.version}</version>`));
  assert.match(xml, /<vendor url="https:\/\/github\.com\/ElliotLuque\/living-code">Elliot Luque<\/vendor>/);
  assert.match(xml, /<depends>com\.intellij\.modules\.platform<\/depends>/);
  assert.match(xml, new RegExp(`<idea-version since-build="${SINCE_BUILD}"\\s*/>`));
  assert.doesNotMatch(xml, /until-build/);
  const desc = xml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1].trim();
  assert.ok(desc && desc.length >= 40, "description is at least 40 characters");
  assert.match(desc, /^[A-Z][^<]*\./, "description starts with a sentence");
  assert.ok(!desc.includes("]]>"));
});

test("plugin.xml declares one themeProvider per flavor with unique ids", () => {
  const xml = pluginXml(flavors);
  const providers = [...xml.matchAll(/<themeProvider id="([^"]+)" path="([^"]+)"\/>/g)];
  assert.equal(providers.length, flavors.length);
  assert.equal(new Set(providers.map((m) => m[1])).size, flavors.length);
  for (const m of providers) assert.match(m[1], /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  assert.deepEqual(providers.map((m) => m[2]), flavors.map((f) => `/themes/${f.slug}.theme.json`));
});

for (const f of flavors) {
  test(`${f.name}: theme.json is well formed and every color reference resolves`, () => {
    const t = JSON.parse(themeJson(f));
    assert.equal(t.name, f.name);
    assert.equal(t.dark, !f.light);
    assert.equal(t.editorScheme, `/themes/${f.slug}.xml`);
    assert.equal(t.parentTheme, undefined);
    const named = namedColors(f);
    for (const v of Object.values(named)) assert.match(v, /^#[0-9a-f]{6}([0-9a-f]{2})?$/i);
    const walk = (o, path) => {
      for (const [k, v] of Object.entries(o)) {
        if (v && typeof v === "object") walk(v, `${path}.${k}`);
        else if (typeof v === "string" && !path.startsWith("icons")) {
          assert.ok(/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(v) || v in t.colors, `${path}.${k} = ${v}`);
        }
      }
    };
    walk(t.ui, "ui");
    assert.deepEqual(Object.keys(t.colors).sort(), Object.keys(named).sort());
  });

  test(`${f.name}: editor scheme is escaped XML with hex colors and a parent scheme`, () => {
    const xml = editorScheme(f);
    assert.match(xml, new RegExp(`<scheme name="${f.name}" version="142" parent_scheme="${f.light ? "Default" : "Darcula"}">`));
    assert.ok(xml.trimEnd().endsWith("</scheme>"));
    const values = [...xml.matchAll(/<option name="(FOREGROUND|BACKGROUND|EFFECT_COLOR|ERROR_STRIPE_COLOR)" value="([^"]*)"/g)];
    assert.ok(values.length > 100);
    for (const [, k, v] of values) assert.match(v, /^[0-9a-f]{6}$/i, `${k}=${v}`);
    assert.doesNotMatch(xml, /#[0-9a-f]{6}/i, "no leading # in .icls colors");
    // Every attribute name is unique, or the later one silently wins.
    const names = [...xml.matchAll(/<option name="([A-Z_][^"]*)"(?: baseAttributes="[^"]*" \/>|>\n {6}<value>)/g)].map((m) => m[1]);
    assert.equal(new Set(names).size, names.length, "duplicate attribute names");
  });
}

test("pluginFiles() covers the jar layout the Marketplace expects", () => {
  const paths = pluginFiles(flavors).map((e) => e.path);
  assert.ok(paths.includes("META-INF/plugin.xml"));
  assert.ok(paths.includes("META-INF/pluginIcon.svg"));
  assert.ok(paths.includes("META-INF/pluginIcon_dark.svg"));
  for (const f of flavors) assert.ok(paths.includes(`themes/${f.slug}.theme.json`) && paths.includes(`themes/${f.slug}.xml`));
  assert.equal(new Set(paths).size, paths.length);
  for (const e of pluginFiles(flavors).filter((e) => e.path.endsWith(".svg"))) {
    assert.match(e.content, /^<svg [^>]*width="40" height="40"/);
  }
});

test("package zip is deterministic and holds living-code/lib/living-code.jar", () => {
  const a = buildPluginZip(), b = buildPluginZip();
  assert.ok(a.equals(b), "two builds are byte identical");
  assert.equal(zipName(), `living-code-jetbrains-${pkg.version}.zip`);
  const outer = unzip(a);
  assert.deepEqual([...outer.keys()], ["living-code/", "living-code/lib/", "living-code/lib/living-code.jar"]);
  const jar = unzip(outer.get("living-code/lib/living-code.jar"));
  for (const { path, content } of pluginFiles(flavors)) {
    assert.equal(jar.get(path)?.toString("utf8"), content, path);
  }
  assert.ok(jar.has("META-INF/MANIFEST.MF"));
  // The unzipped plugin.xml is the one for this version.
  assert.ok(jar.get("META-INF/plugin.xml").toString().includes(`<version>${pkg.version}</version>`));
});

test("README documents the JetBrains port without an em dash", () => {
  assert.match(readme, /#### \[JetBrains IDEs\]/);
  assert.match(readme, /package:jetbrains/);
  assert.doesNotMatch(readme, /\u2014/);
});

test("the port does not claim an npm package", async () => {
  const { jetbrains } = await import("./ports/jetbrains.mjs");
  assert.equal(jetbrains.npm, undefined);
});
