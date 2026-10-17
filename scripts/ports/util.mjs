export const RAW = "https://raw.githubusercontent.com/ElliotLuque/living-code/main";
export const FLAVOR_IDS = ["night", "frost", "paper", "signal"];

// Raw URL for a generated file; `{night,frost,paper,signal}` is curl's own URL globbing, so one -O fetches all four.
export const rawUrl = (path) => `${RAW}/${path}`;
export const allFlavors = (pattern) => pattern.replace("*", `{${FLAVOR_IDS.join(",")}}`);

export const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const rgbSpace = (hex) => rgbOf(hex).join(" ");
export const rgbComma = (hex) => rgbOf(hex).join(",");
export const fence = (lang, body) => "```" + lang + "\n" + body + "\n```";

// One-line install helpers. `$flavor` stays a literal shell variable in the output, so a user switches flavor by editing one line.
export const XDG_CONFIG = "${XDG_CONFIG_HOME:-$HOME/.config}";
export const FLAVOR_LINE = "flavor=night";
export const sh = (...lines) => fence("sh", lines.join("\n"));
// `curl` that downloads one repo file into `dir` under its own name.
export const getFile = (dir, path) => `curl -fsSL --create-dirs -o "${dir}/${path.split("/").pop()}" "${rawUrl(path)}"`;
