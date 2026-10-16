import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

export const { version } = JSON.parse(read("package.json"));
export const license = read("LICENSE");
export const changelog = read("CHANGELOG.md");
export const REPO = "https://github.com/ElliotLuque/living-code";
