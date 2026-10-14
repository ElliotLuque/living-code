export const supportsFirefox = (f) => f.id === "night" || f.id === "paper";

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
  files: (f) => supportsFirefox(f) ? [
    {
      path: `extras/firefox/${f.slug}/manifest.json`,
      content: JSON.stringify(firefoxTheme(f), null, 2) + "\n",
    },
  ] : [],
  install: `Choose **Night** for a dark browser or **Paper** for a light one.

1. Find [Living Code Night](https://addons.mozilla.org/en-US/firefox/search/?q=Living%20Code%20Night&type=statictheme) or [Living Code Paper](https://addons.mozilla.org/en-US/firefox/search/?q=Living%20Code%20Paper&type=statictheme) on Firefox Add-ons.
2. Open the theme’s listing and click **Install Theme**.

To switch themes, open **Add-ons and themes → Themes** (\`about:addons\`) and enable your preferred variant.`, 
};
