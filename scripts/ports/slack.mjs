// Slack: the legacy theme string, eight colors separated by commas, pasted into Preferences > Themes >
// Import theme > "Paste your legacy theme colors" (https://slack.com/help/articles/205166337).
// Slack only colors its own UI, so a flavor whose string equals another flavor's is not shipped twice.
import { resolveAll } from "../resolve.mjs";

export const SLACK_SLOTS = ["Column background", "Menu background hover", "Active item", "Active item text", "Hover item", "Text color", "Active presence", "Mention badge"];

export const slackColors = (f) => [f.r("bgDeep"), f.c("surface0"), f.r("accent"), f.r("bg"), f.c("surface0"), f.r("fg"), f.r("success"), f.r("error")];
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
    return `Open *Preferences → Themes*, choose *Import theme*, paste one of these strings under *Paste your legacy theme colors* and apply it:

${unique.map((f) => `- **${f.name.replace("Living Code ", "")}**: \`${slackString(f)}\``).join("\n")}

The eight colors are: ${SLACK_SLOTS.join(", ").toLowerCase()}.${dup ? ` ${dup}` : ""} Slack colors only its own interface, not code. These strings follow Slack's [help article](https://slack.com/help/articles/205166337-Change-your-Slack-theme) and have not been tested in a Slack client.`;
  },
};
