import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveAll } from "./resolve.mjs";
import { zed } from "./ports/editors.mjs";

const flavors = resolveAll();
const read = (path) => readFile(new URL(`../extras/zed/${path}`, import.meta.url), "utf8");
const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const theme = JSON.parse(await read("themes/living-code.json"));
const toml = await read("extension.toml");
const field = (key) => toml.match(new RegExp(`^${key} = (.+)$`, "m"))?.[1];

test("extension.toml has every field Zed requires", () => {
  for (const key of ["id", "name", "version", "schema_version", "authors", "description", "repository"]) {
    assert.ok(field(key), `${key} is missing`);
  }
  assert.equal(field("schema_version"), "1");
  assert.equal(field("version"), JSON.stringify(pkg.version));
  assert.equal(field("repository"), JSON.stringify("https://github.com/ElliotLuque/living-code"));
});

test("extension id follows the registry rules for theme extensions", () => {
  const id = JSON.parse(field("id"));
  assert.match(id, /^[a-z0-9-]+-theme$/);
  assert.ok(!id.includes("zed"));
});

test("the extension directory ships an MIT license", async () => {
  assert.match(await read("LICENSE"), /^MIT License/);
});

test("theme family has one theme per flavor with the right appearance", () => {
  assert.equal(theme.$schema, "https://zed.dev/schema/themes/v0.2.0.json");
  assert.equal(theme.name, "Living Code");
  assert.deepEqual(theme.themes.map((t) => t.name), flavors.map((f) => f.name));
  for (const f of flavors) {
    assert.equal(theme.themes.find((t) => t.name === f.name).appearance, f.light ? "light" : "dark", f.id);
  }
});

test("every theme colors the editor, syntax and terminal", () => {
  const color = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;
  for (const t of theme.themes) {
    for (const key of ["background", "editor.background", "text", "border", "terminal.background", "terminal.ansi.red"]) {
      assert.match(t.style[key], color, `${t.name} ${key}`);
    }
    for (const key of ["keyword", "string", "comment", "function"]) {
      assert.match(t.style.syntax[key].color, color, `${t.name} syntax.${key}`);
    }
    assert.equal(t.style.players.length > 0, true, t.name);
  }
});

test("committed files match the generator", async () => {
  const files = [...flavors.flatMap((f) => zed.files(f)), ...zed.all(flavors)];
  assert.deepEqual(files.map((f) => f.path).sort(), ["extras/zed/LICENSE", "extras/zed/extension.toml", "extras/zed/themes/living-code.json"]);
  for (const file of files) {
    assert.equal(await readFile(new URL(`../${file.path}`, import.meta.url), "utf8"), file.content, file.path);
  }
});
