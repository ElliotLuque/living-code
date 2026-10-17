import { ANSI_ORDER } from "../resolve.mjs";
import { allFlavors, fence, rawUrl, rgbComma } from "./util.mjs";

// Windows Terminal color schemes use "purple" where ANSI says magenta.
const WT_NAMES = ["black", "red", "green", "yellow", "blue", "purple", "cyan", "white"];

export function windowsTerminalScheme(f) {
  const scheme = { name: f.name };
  WT_NAMES.forEach((n, i) => { scheme[n] = f.ansi.normal[i]; });
  WT_NAMES.forEach((n, i) => { scheme["bright" + n[0].toUpperCase() + n.slice(1)] = f.ansi.bright[i]; });
  scheme.background = f.r("bg");
  scheme.foreground = f.r("fg");
  scheme.cursorColor = f.r("cursor");
  scheme.selectionBackground = f.r("selection");
  return scheme;
}

export const windowsTerminal = {
  id: "windows-terminal",
  name: "Windows Terminal",
  homepage: "https://github.com/microsoft/terminal",
  files: (f) => [{ path: `extras/windows-terminal/${f.slug}.json`, content: JSON.stringify(windowsTerminalScheme(f), null, 2) + "\n" }],
  all: (fs) => [{ path: "extras/windows-terminal/living-code.json", content: JSON.stringify({ schemes: fs.map(windowsTerminalScheme) }, null, 2) + "\n" }],
  install: `Run this in PowerShell. It saves a [JSON fragment](https://learn.microsoft.com/en-us/windows/terminal/json-fragment-extensions) that Windows Terminal loads by itself, so nothing in \`settings.json\` is edited:

${fence("powershell", `$d = "$env:LOCALAPPDATA\\Microsoft\\Windows Terminal\\Fragments\\living-code"; New-Item -ItemType Directory -Force $d | Out-Null; Invoke-WebRequest ${rawUrl("extras/windows-terminal/living-code.json")} -OutFile "$d\\living-code.json" -UseBasicParsing`)}

Restart Windows Terminal. The four schemes appear in *Settings → Color schemes*; select one under a profile's *Appearance*, or set it in \`settings.json\`:

${fence("json", `"colorScheme": "Living Code Night"`)}

Fallback: paste the scheme objects from \`extras/windows-terminal/living-code-*.json\` into the \`schemes\` array of \`settings.json\`.`,
};

const plistColor = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const n = (v) => v.toFixed(6);
  return `\t<dict>
\t\t<key>Alpha Component</key>
\t\t<real>1</real>
\t\t<key>Blue Component</key>
\t\t<real>${n(b)}</real>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Green Component</key>
\t\t<real>${n(g)}</real>
\t\t<key>Red Component</key>
\t\t<real>${n(r)}</real>
\t</dict>`;
};

export const itermColorKeys = (f) => [
  ...[...f.ansi.normal, ...f.ansi.bright].map((c, i) => [`Ansi ${i} Color`, c]),
  ["Background Color", f.r("bg")],
  ["Foreground Color", f.r("fg")],
  ["Bold Color", f.r("fg")],
  ["Cursor Color", f.r("cursor")],
  ["Cursor Text Color", f.r("bg")],
  ["Selection Color", f.r("selection")],
  ["Selected Text Color", f.r("fg")],
  ["Link Color", f.r("link")],
];

export const itermPath = (f) => `extras/iterm2/${f.name.replaceAll(" ", "-")}.itermcolors`;

export const iterm2 = {
  id: "iterm2",
  name: "iTerm2",
  homepage: "https://iterm2.com",
  files: (f) => [{
    path: itermPath(f),
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
${itermColorKeys(f).map(([k, c]) => `\t<key>${k}</key>\n${plistColor(c)}`).join("\n")}
</dict>
</plist>
`,
  }],
  install: `Download a preset and \`open\` it; iTerm2 imports it and names it after the file (*Living Code Night*, *Living Code Frost*, *Living Code Paper*, *Living Code Signal*):

${fence("sh", `curl -fsSL --output-dir ~/Downloads -O "${rawUrl("extras/iterm2/Living-Code-{Night,Frost,Paper,Signal}.itermcolors")}" && open ~/Downloads/Living-Code-*.itermcolors`)}

Then pick one under *Settings → Profiles → Colors → Color Presets*. Fallback: in that same menu choose *Import...* and select the downloaded files.`,
};

export const warpTheme = (f) => `name: ${f.name}
accent: '${f.r("accent")}'
cursor: '${f.r("cursor")}'
background: '${f.r("bg")}'
foreground: '${f.r("fg")}'
details: ${f.light ? "lighter" : "darker"}
terminal_colors:
${["normal", "bright"].map((k) => `  ${k}:\n${ANSI_ORDER.map((n, i) => `    ${n}: '${f.ansi[k][i]}'`).join("\n")}`).join("\n")}
`;

export const warp = {
  id: "warp",
  name: "Warp",
  homepage: "https://www.warp.dev",
  files: (f) => [{ path: `extras/warp/${f.slug}.yaml`, content: warpTheme(f) }],
  install: `Download the themes into Warp's [custom themes folder](https://docs.warp.dev/terminal/appearance/custom-themes), then pick one under *Settings → Appearance → Themes*. macOS:

${fence("sh", `curl -fsSL --create-dirs --output-dir ~/.warp/themes -O "${rawUrl(allFlavors("extras/warp/living-code-*.yaml"))}"`)}

Linux:

${fence("sh", `curl -fsSL --create-dirs --output-dir "\${XDG_DATA_HOME:-$HOME/.local/share}/warp-terminal/themes" -O "${rawUrl(allFlavors("extras/warp/living-code-*.yaml"))}"`)}

On Windows the folder is \`%APPDATA%\\warp\\Warp\\data\\themes\\\`. If a theme does not show up straight away, restart Warp.`,
};

export const konsoleScheme = (f) => {
  const section = (name, hex, extra = "") => `[${name}]\nColor=${rgbComma(hex)}\n${extra}`;
  const out = [
    section("Background", f.r("bg")),
    section("BackgroundFaint", f.r("bg")),
    section("BackgroundIntense", f.r("bgDeep")),
    section("Foreground", f.r("fg")),
    section("ForegroundFaint", f.r("fgMuted")),
    section("ForegroundIntense", f.r("fg")),
  ];
  ANSI_ORDER.forEach((_, i) => {
    out.push(section(`Color${i}`, f.ansi.normal[i]));
    out.push(section(`Color${i}Faint`, f.ansi.normal[i]));
    out.push(section(`Color${i}Intense`, f.ansi.bright[i]));
  });
  out.push(`[General]\nBlur=false\nColorRandomization=false\nDescription=${f.name}\nOpacity=1\nWallpaper=\n`);
  return out.join("\n");
};

export const konsole = {
  id: "konsole",
  name: "Konsole",
  homepage: "https://konsole.kde.org",
  files: (f) => [{ path: `extras/konsole/${f.slug}.colorscheme`, content: konsoleScheme(f) }],
  install: `${fence("sh", `curl -fsSL --create-dirs --output-dir ~/.local/share/konsole -O "${rawUrl(allFlavors("extras/konsole/living-code-*.colorscheme"))}"`)}

Then open *Settings → Edit Current Profile → Appearance* and select the color scheme. Konsole picks up new files in that folder without a restart.`,
};
