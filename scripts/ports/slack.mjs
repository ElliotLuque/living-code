// Slack: the legacy theme string, eight colors separated by commas, pasted into Preferences > Appearance >
// Custom theme > Import theme > "Paste your legacy theme colors" (https://slack.com/help/articles/205166337).
// Slack only colors its own UI, so a flavor whose string equals another flavor's is not shipped twice.
import { resolveAll } from "../resolve.mjs";

export const SLACK_SLOTS = ["Column background", "Menu background hover", "Active item", "Active item text", "Hover item", "Text color", "Active presence", "Mention badge"];

// Slack draws the mention count in white, so the badge needs at least 3:1 against #ffffff.
export const hexContrastWithWhite = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05);
};
const mentionBadge = (f) => [f.r("error"), f.r("accent")].find((c) => hexContrastWithWhite(c) >= 3) ?? f.c("surface2");

export const slackColors = (f) => [f.r("bgDeep"), f.c("surface0"), f.r("accent"), f.r("bg"), f.c("surface0"), f.r("fg"), f.r("success"), mentionBadge(f)];
export const slackString = (f) => slackColors(f).join(",");

// Flavors that get their own string, plus { flavor, sameAs } for the ones dropped as duplicates.
export function slackFlavors(flavors) {
  const seen = new Map(), unique = [], duplicates = [];
  for (const f of flavors) {
    const key = slackString(f);
    if (seen.has(key)) duplicates.push({ flavor: f, sameAs: seen.get(key) });
    else { seen.set(key, f); unique.push(f); }
  }
  return { unique, duplicates };
}

export const slack = {
  id: "slack",
  name: "Slack",
  homepage: "https://slack.com",
  files: () => [],
  all: (fs) => slackFlavors(fs).unique.map((f) => ({ path: `extras/slack/${f.slug}.txt`, content: slackString(f) + "\n" })),
  get install() {
    const { unique, duplicates } = slackFlavors(resolveAll());
    const dup = duplicates.map(({ flavor, sameAs }) => `**${flavor.name.replace("Living Code ", "")}** is not listed because Slack only colors its own interface, where it comes out identical to **${sameAs.name.replace("Living Code ", "")}**.`).join(" ");
    return `Open your profile picture menu → *Preferences → Appearance → Custom theme*, click *Import theme* next to *Theme Colors*, choose *Paste your legacy theme colors*, paste one of these strings and click *Apply*:

${unique.map((f) => `- **${f.name.replace("Living Code ", "")}**: \`${slackString(f)}\``).join("\n")}

The eight colors are: ${SLACK_SLOTS.join(", ").toLowerCase()}.${dup ? ` ${dup}` : ""} Slack colors only its own interface, not code. These strings follow Slack's [help article](https://slack.com/help/articles/205166337-Change-your-Slack-theme) and have not been tested in a Slack client.`;
  },
};
