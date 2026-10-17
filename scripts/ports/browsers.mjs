// Browser themes only colour backgrounds, borders and one accent. In those slots Signal is identical to Night and
// Frost is nearly so, and both stores reject duplicate themes, so Firefox and Chrome ship Night and Paper only.
export const supportsBrowserTheme = (f) => f.id === "night" || f.id === "paper";
const rgbArray = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export function firefoxTheme(f) {
  const r = f.r, c = f.c;
  return {
    manifest_version: 2,
    name: f.name,
    version: "0.1.0",
    description: f.description,
    author: "Elliot Luque",
    homepage_url: "https://github.com/ElliotLuque/living-code",
    icons: { "48": "icons/icon-48.png", "96": "icons/icon-96.png" },
    browser_specific_settings: {
      gecko: { id: `${f.slug}@elliotluque`, strict_min_version: "106.0" },
    },
    theme: {
      colors: {
        frame: r("bgDeep"),
        frame_inactive: r("bgDeep"),
        tab_background_text: r("fgMuted"),
        tab_background_separator: r("border"),
        tab_selected: r("bg"),
        tab_text: r("fg"),
        tab_line: r("accent"),
        tab_loading: r("accent"),
        toolbar: r("bg"),
        toolbar_text: r("fg"),
        toolbar_top_separator: r("bgDeep"),
        toolbar_bottom_separator: r("border"),
        toolbar_vertical_separator: r("border"),
        toolbar_field: r("bgDeep"),
        toolbar_field_text: r("fg"),
        toolbar_field_border: r("border"),
        toolbar_field_focus: r("bgAlt"),
        toolbar_field_text_focus: r("fg"),
        toolbar_field_border_focus: r("accent"),
        toolbar_field_highlight: r("selection"),
        toolbar_field_highlight_text: r("fg"),
        bookmark_text: r("fgAlt"),
        button_background_hover: c("surface0"),
        button_background_active: c("surface1"),
        icons: r("fgMuted"),
        icons_attention: r("accent"),
        popup: r("bgAlt"),
        popup_text: r("fg"),
        popup_border: r("border"),
        popup_highlight: c("surface0"),
        popup_highlight_text: r("fg"),
        sidebar: r("bgDeep"),
        sidebar_text: r("fgAlt"),
        sidebar_border: r("border"),
        sidebar_highlight: c("surface0"),
        sidebar_highlight_text: r("fg"),
        ntp_background: r("bg"),
        ntp_text: r("fg"),
        ntp_card_background: r("bgAlt"),
      },
      properties: {
        color_scheme: f.light ? "light" : "dark",
      },
    },
  };
}

export const firefox = {
  id: "firefox",
  name: "Firefox",
  homepage: "https://www.firefox.com",
  files: (f) => supportsBrowserTheme(f) ? [
    {
      path: `extras/firefox/${f.slug}/manifest.json`,
      content: JSON.stringify(firefoxTheme(f), null, 2) + "\n",
    },
  ] : [],
  install: `Choose **Night** for a dark browser or **Paper** for a light one.

1. Open [Living Code Night](https://addons.mozilla.org/firefox/addon/living-code-night/) or [Living Code Paper](https://addons.mozilla.org/firefox/addon/living-code-paper/) on Firefox Add-ons.
2. Click **Install Theme**.

To switch themes, open **Add-ons and themes → Themes** (\`about:addons\`) and enable your preferred variant.`,
};

export const CHROME_DESCRIPTIONS = {
  night: "Dark slate ground, teal structure and gray comments. The default Living Code flavor.",
  paper: "Warm light paper ground with teal structure. The light Living Code flavor.",
};

// Chrome keeps its theme colours as RGB arrays. Icons are the Firefox theme icons, copied byte for byte.
export function chromeTheme(f) {
  const r = (role) => rgbArray(f.r(role));
  return {
    manifest_version: 3,
    name: f.name,
    version: "0.1.0",
    description: CHROME_DESCRIPTIONS[f.id],
    icons: { "48": "icons/icon-48.png", "128": "icons/icon-128.png" },
    theme: {
      colors: {
        frame: r("bgDeep"),
        frame_inactive: r("bgDeep"),
        frame_incognito: r("bgDeep"),
        frame_incognito_inactive: r("bgDeep"),
        toolbar: r("bg"),
        tab_text: r("fg"),
        tab_background_text: r("fgMuted"),
        bookmark_text: r("fgAlt"),
        toolbar_button_icon: r("fgMuted"),
        button_background: rgbArray(f.c("surface0")),
        omnibox_background: r("bgDeep"),
        omnibox_text: r("fg"),
        ntp_background: r("bg"),
        ntp_text: r("fg"),
        ntp_link: r("accent"),
        ntp_section: r("bgAlt"),
        ntp_section_text: r("fg"),
        ntp_section_link: r("accent"),
      },
      tints: { buttons: [-1, -1, -1] },
      properties: { ntp_background_alignment: "center" },
    },
  };
}

export const chrome = {
  id: "chrome",
  name: "Chrome, Brave and Chromium",
  homepage: "https://chromewebstore.google.com/category/themes",
  files: (f) => supportsBrowserTheme(f) ? [
    { path: `extras/chrome/${f.slug}/manifest.json`, content: JSON.stringify(chromeTheme(f), null, 2) + "\n" },
  ] : [],
  install: `Choose **Night** for a dark browser or **Paper** for a light one. They are Manifest V3 themes for Chrome and Chromium; Brave installs Chrome Web Store themes too. Vivaldi does not apply Chrome themes, and Edge, Opera and Arc have not been tested.

1. **Chrome Web Store:** search for **Living Code Night** or **Living Code Paper** and click **Add to Chrome**. This README assumes both themes are published to the Chrome Web Store.
2. **Without the store:** download \`living-code-chrome-night.zip\` or \`living-code-chrome-paper.zip\` from the latest [GitHub release](https://github.com/ElliotLuque/living-code/releases/latest) and unzip it. Open \`chrome://extensions\`, turn on **Developer mode**, click **Load unpacked** and select the folder. (From a checkout, select \`extras/chrome/living-code-night\` or \`extras/chrome/living-code-paper\`.)

To switch themes, install the other one, or use **Settings → Appearance → Reset to default**.`,
};
