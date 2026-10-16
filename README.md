<h1 align="center">Living Code</h1>

<p align="center"><b>Calm slate. Living color.</b><br>
A color scheme where the background stays quiet and the code comes alive.<br>
For editors, terminals, browsers and the web.</p>

<p align="center">
<img src="assets/preview-night.png" width="49%" alt="Living Code Night">
<img src="assets/preview-frost.png" width="49%" alt="Living Code Frost">
<img src="assets/preview-paper.png" width="49%" alt="Living Code Paper">
<img src="assets/preview-signal.png" width="49%" alt="Living Code Signal">
</p>

## Choose a flavor

Every flavor shares the same slate foundation and semantic roles. Night is the default.

| Flavor | Appearance | Syntax and accents |
|---|---|---|
| [Night](#living-code-night) | Dark slate, full palette | Cool structure, green strings, copper numbers and amber warnings. The default. |
| [Frost](#living-code-frost) | Lifted, bluer slate | Lower-chroma accents with amber strings and copper numbers. |
| [Paper](#living-code-paper) | Near-white slate | Darker accents with amber strings and copper numbers. |
| [Signal](#living-code-signal) | Dark slate, one accent | Minimal variant of Night: teal keywords and tags, everything else neutral. |

## Design

- **The ground stays calm.** Backgrounds, panels, selections, punctuation and comments live on one slate ramp, so the eye goes to the code, not the chrome.
- **Cool for structure, warm for data.** <img src="assets/swatches/00a692.svg" width="18" height="18" alt="#00a692"> Teal, aqua and steel mark keywords, functions and types; <img src="assets/swatches/8acb83.svg" width="18" height="18" alt="#8acb83"> moss, <img src="assets/swatches/f0be6d.svg" width="18" height="18" alt="#f0be6d"> amber and <img src="assets/swatches/e18c5f.svg" width="18" height="18" alt="#e18c5f"> copper mark strings, numbers and warnings.
- **Same roles everywhere.** Each port maps the same semantic roles (keyword, string, error, border...), so a theme feels the same in your editor, terminal and browser.
- **Built in OKLCH.** Every palette value is defined in OKLCH; hex and RGB are derived. The build checks text roles for WCAG AA contrast (≥ 4.5:1) against each flavor's background.

## Flavors

### Living Code Night

The default. Dark slate ground, teal structure, green strings and gray comments. Amber warnings and copper numbers keep their warm contrast.

<img src="assets/preview-night.png" width="100%" alt="Living Code Night: editor syntax, terminal output and ANSI palette">

<details open>
<summary>Palette</summary>

**Neutrals**

| | Name | Hex | OKLCH | Used for |
|:-:|---|---|---|---|
| <img src="assets/swatches/020405.svg" width="18" height="18" alt="#020405"> | `crust` | `#020405` | `oklch(0.1 0.01 240)` | sidebars, tab bars, status lines |
| <img src="assets/swatches/05080b.svg" width="18" height="18" alt="#05080b"> | `base` | `#05080b` | `oklch(0.13 0.01 240)` | background |
| <img src="assets/swatches/090e11.svg" width="18" height="18" alt="#090e11"> | `mantle` | `#090e11` | `oklch(0.16 0.01 240)` | floats, cards, popups |
| <img src="assets/swatches/12171a.svg" width="18" height="18" alt="#12171a"> | `surface0` | `#12171a` | `oklch(0.2 0.01 240)` | line highlight, inactive tabs |
| <img src="assets/swatches/1d2226.svg" width="18" height="18" alt="#1d2226"> | `surface1` | `#1d2226` | `oklch(0.25 0.01 240)` | borders, ANSI black |
| <img src="assets/swatches/2d3438.svg" width="18" height="18" alt="#2d3438"> | `surface2` | `#2d3438` | `oklch(0.32 0.012 240)` | selection |
| <img src="assets/swatches/50565b.svg" width="18" height="18" alt="#50565b"> | `overlay` | `#50565b` | `oklch(0.45 0.012 240)` | line numbers, punctuation |
| <img src="assets/swatches/747c80.svg" width="18" height="18" alt="#747c80"> | `comment` | `#747c80` | `oklch(0.58 0.012 235)` | comments, operators |
| <img src="assets/swatches/9ba0a2.svg" width="18" height="18" alt="#9ba0a2"> | `subtext` | `#9ba0a2` | `oklch(0.7023 0.0065 223.49)` | muted text, ANSI white |
| <img src="assets/swatches/c8cfd4.svg" width="18" height="18" alt="#c8cfd4"> | `text2` | `#c8cfd4` | `oklch(0.85 0.01 240)` | properties, parameters |
| <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> | `text` | `#e2e9ee` | `oklch(0.93 0.01 240)` | foreground |

**Accents**

| | Name | Hex | OKLCH | Used for |
|:-:|---|---|---|---|
| <img src="assets/swatches/00a692.svg" width="18" height="18" alt="#00a692"> | `teal` | `#00a692` | `oklch(0.65 0.15 180)` | accent · cursor · borderActive · heading |
| <img src="assets/swatches/52d7c1.svg" width="18" height="18" alt="#52d7c1"> | `mint` | `#52d7c1` | `oklch(0.8 0.12 180)` | hint · keyword · builtin |
| <img src="assets/swatches/9ae0dd.svg" width="18" height="18" alt="#9ae0dd"> | `aqua` | `#9ae0dd` | `oklch(0.86 0.07 192)` | function · link |
| <img src="assets/swatches/80b6d3.svg" width="18" height="18" alt="#80b6d3"> | `steel` | `#80b6d3` | `oklch(0.75 0.07 232)` | info · type · namespace |
| <img src="assets/swatches/f0be6d.svg" width="18" height="18" alt="#f0be6d"> | `amber` | `#f0be6d` | `oklch(0.83 0.115 78)` | lineNumberActive · match · warning · modified · code |
| <img src="assets/swatches/e18c5f.svg" width="18" height="18" alt="#e18c5f"> | `copper` | `#e18c5f` | `oklch(0.72 0.12 48)` | number · constant · escape |
| <img src="assets/swatches/e96560.svg" width="18" height="18" alt="#e96560"> | `flare` | `#e96560` | `oklch(0.67 0.165 25)` | error · removed |
| <img src="assets/swatches/8acb83.svg" width="18" height="18" alt="#8acb83"> | `moss` | `#8acb83` | `oklch(0.78 0.12 142)` | success · added · string |
| <img src="assets/swatches/bf91cd.svg" width="18" height="18" alt="#bf91cd"> | `orchid` | `#bf91cd` | `oklch(0.72 0.1 318)` | regex · decorator · tag |
| <img src="assets/swatches/ddaec3.svg" width="18" height="18" alt="#ddaec3"> | `rose` | `#ddaec3` | `oklch(0.8 0.06 350)` | Available for custom accents |

**ANSI**

| | black | red | green | yellow | blue | magenta | cyan | white |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| normal | <img src="assets/swatches/1d2226.svg" width="18" height="18" alt="#1d2226"> | <img src="assets/swatches/e96560.svg" width="18" height="18" alt="#e96560"> | <img src="assets/swatches/8acb83.svg" width="18" height="18" alt="#8acb83"> | <img src="assets/swatches/f0be6d.svg" width="18" height="18" alt="#f0be6d"> | <img src="assets/swatches/80b6d3.svg" width="18" height="18" alt="#80b6d3"> | <img src="assets/swatches/bf91cd.svg" width="18" height="18" alt="#bf91cd"> | <img src="assets/swatches/00a692.svg" width="18" height="18" alt="#00a692"> | <img src="assets/swatches/9ba0a2.svg" width="18" height="18" alt="#9ba0a2"> |
| bright | <img src="assets/swatches/50565b.svg" width="18" height="18" alt="#50565b"> | <img src="assets/swatches/fa8880.svg" width="18" height="18" alt="#fa8880"> | <img src="assets/swatches/abe2a4.svg" width="18" height="18" alt="#abe2a4"> | <img src="assets/swatches/ffdba5.svg" width="18" height="18" alt="#ffdba5"> | <img src="assets/swatches/a1cfe8.svg" width="18" height="18" alt="#a1cfe8"> | <img src="assets/swatches/d5ade2.svg" width="18" height="18" alt="#d5ade2"> | <img src="assets/swatches/1fc1ab.svg" width="18" height="18" alt="#1fc1ab"> | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> |

</details>

### Living Code Frost

Night on a lifted, bluer slate with a third less chroma. Calmer for long sessions; the warm/cool split survives at low saturation.

<img src="assets/preview-frost.png" width="100%" alt="Living Code Frost: editor syntax, terminal output and ANSI palette">

<details>
<summary>Palette</summary>

**Neutrals**

| | Name | Hex | OKLCH | Used for |
|:-:|---|---|---|---|
| <img src="assets/swatches/050a0f.svg" width="18" height="18" alt="#050a0f"> | `crust` | `#050a0f` | `oklch(0.14 0.015 245)` | sidebars, tab bars, status lines |
| <img src="assets/swatches/0a1016.svg" width="18" height="18" alt="#0a1016"> | `base` | `#0a1016` | `oklch(0.17 0.015 245)` | background |
| <img src="assets/swatches/10171c.svg" width="18" height="18" alt="#10171c"> | `mantle` | `#10171c` | `oklch(0.2 0.015 245)` | floats, cards, popups |
| <img src="assets/swatches/171e24.svg" width="18" height="18" alt="#171e24"> | `surface0` | `#171e24` | `oklch(0.23 0.015 245)` | line highlight, inactive tabs |
| <img src="assets/swatches/232a30.svg" width="18" height="18" alt="#232a30"> | `surface1` | `#232a30` | `oklch(0.28 0.015 245)` | borders, ANSI black |
| <img src="assets/swatches/333c43.svg" width="18" height="18" alt="#333c43"> | `surface2` | `#333c43` | `oklch(0.35 0.018 245)` | selection |
| <img src="assets/swatches/50565b.svg" width="18" height="18" alt="#50565b"> | `overlay` | `#50565b` | `oklch(0.45 0.012 240)` | line numbers, punctuation |
| <img src="assets/swatches/7d8489.svg" width="18" height="18" alt="#7d8489"> | `comment` | `#7d8489` | `oklch(0.61 0.012 235)` | comments, operators |
| <img src="assets/swatches/9ba0a2.svg" width="18" height="18" alt="#9ba0a2"> | `subtext` | `#9ba0a2` | `oklch(0.7023 0.0065 223.49)` | muted text, ANSI white |
| <img src="assets/swatches/c8cfd4.svg" width="18" height="18" alt="#c8cfd4"> | `text2` | `#c8cfd4` | `oklch(0.85 0.01 240)` | properties, parameters |
| <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> | `text` | `#e2e9ee` | `oklch(0.93 0.01 240)` | foreground |

**Accents**

| | Name | Hex | OKLCH | Used for |
|:-:|---|---|---|---|
| <img src="assets/swatches/43a997.svg" width="18" height="18" alt="#43a997"> | `teal` | `#43a997` | `oklch(0.67 0.0975 180)` | accent · cursor · borderActive · heading |
| <img src="assets/swatches/8ad5c6.svg" width="18" height="18" alt="#8ad5c6"> | `mint` | `#8ad5c6` | `oklch(0.82 0.078 180)` | hint · keyword · builtin |
| <img src="assets/swatches/b6e2df.svg" width="18" height="18" alt="#b6e2df"> | `aqua` | `#b6e2df` | `oklch(0.88 0.0455 192)` | function · link |
| <img src="assets/swatches/98bacd.svg" width="18" height="18" alt="#98bacd"> | `steel` | `#98bacd` | `oklch(0.77 0.0455 232)` | info · type · namespace |
| <img src="assets/swatches/e9c897.svg" width="18" height="18" alt="#e9c897"> | `amber` | `#e9c897` | `oklch(0.85 0.0748 78)` | lineNumberActive · match · warning · modified · string · code |
| <img src="assets/swatches/d49c80.svg" width="18" height="18" alt="#d49c80"> | `copper` | `#d49c80` | `oklch(0.74 0.078 48)` | number · constant · escape |
| <img src="assets/swatches/d68079.svg" width="18" height="18" alt="#d68079"> | `flare` | `#d68079` | `oklch(0.69 0.1073 25)` | error · removed |
| <img src="assets/swatches/a2cb9d.svg" width="18" height="18" alt="#a2cb9d"> | `moss` | `#a2cb9d` | `oklch(0.8 0.078 142)` | success · added |
| <img src="assets/swatches/bc9ec6.svg" width="18" height="18" alt="#bc9ec6"> | `orchid` | `#bc9ec6` | `oklch(0.74 0.065 318)` | regex · decorator · tag |
| <img src="assets/swatches/d9bac8.svg" width="18" height="18" alt="#d9bac8"> | `rose` | `#d9bac8` | `oklch(0.82 0.039 350)` | Available for custom accents |

**ANSI**

| | black | red | green | yellow | blue | magenta | cyan | white |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| normal | <img src="assets/swatches/232a30.svg" width="18" height="18" alt="#232a30"> | <img src="assets/swatches/d68079.svg" width="18" height="18" alt="#d68079"> | <img src="assets/swatches/a2cb9d.svg" width="18" height="18" alt="#a2cb9d"> | <img src="assets/swatches/e9c897.svg" width="18" height="18" alt="#e9c897"> | <img src="assets/swatches/98bacd.svg" width="18" height="18" alt="#98bacd"> | <img src="assets/swatches/bc9ec6.svg" width="18" height="18" alt="#bc9ec6"> | <img src="assets/swatches/43a997.svg" width="18" height="18" alt="#43a997"> | <img src="assets/swatches/9ba0a2.svg" width="18" height="18" alt="#9ba0a2"> |
| bright | <img src="assets/swatches/50565b.svg" width="18" height="18" alt="#50565b"> | <img src="assets/swatches/e99e97.svg" width="18" height="18" alt="#e99e97"> | <img src="assets/swatches/bfe3bb.svg" width="18" height="18" alt="#bfe3bb"> | <img src="assets/swatches/fce0b6.svg" width="18" height="18" alt="#fce0b6"> | <img src="assets/swatches/b6d3e3.svg" width="18" height="18" alt="#b6d3e3"> | <img src="assets/swatches/d4b9dc.svg" width="18" height="18" alt="#d4b9dc"> | <img src="assets/swatches/6fbfb0.svg" width="18" height="18" alt="#6fbfb0"> | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> |

</details>

### Living Code Paper

Daylight. Same two temperatures on near-white slate, lightness inverted so every syntax color keeps WCAG AA contrast.

<img src="assets/preview-paper.png" width="100%" alt="Living Code Paper: editor syntax, terminal output and ANSI palette">

<details>
<summary>Palette</summary>

**Neutrals**

| | Name | Hex | OKLCH | Used for |
|:-:|---|---|---|---|
| <img src="assets/swatches/e0e5e9.svg" width="18" height="18" alt="#e0e5e9"> | `crust` | `#e0e5e9` | `oklch(0.92 0.008 240)` | sidebars, tab bars, status lines |
| <img src="assets/swatches/f4f7f9.svg" width="18" height="18" alt="#f4f7f9"> | `base` | `#f4f7f9` | `oklch(0.975 0.004 240)` | background |
| <img src="assets/swatches/ebeff2.svg" width="18" height="18" alt="#ebeff2"> | `mantle` | `#ebeff2` | `oklch(0.95 0.006 240)` | floats, cards, popups |
| <img src="assets/swatches/e3e9ed.svg" width="18" height="18" alt="#e3e9ed"> | `surface0` | `#e3e9ed` | `oklch(0.93 0.008 240)` | line highlight, inactive tabs |
| <img src="assets/swatches/d2d8dd.svg" width="18" height="18" alt="#d2d8dd"> | `surface1` | `#d2d8dd` | `oklch(0.88 0.01 240)` | borders, ANSI black |
| <img src="assets/swatches/c2ccd3.svg" width="18" height="18" alt="#c2ccd3"> | `surface2` | `#c2ccd3` | `oklch(0.84 0.015 240)` | selection |
| <img src="assets/swatches/92999f.svg" width="18" height="18" alt="#92999f"> | `overlay` | `#92999f` | `oklch(0.68 0.012 240)` | line numbers, punctuation |
| <img src="assets/swatches/6b7378.svg" width="18" height="18" alt="#6b7378"> | `comment` | `#6b7378` | `oklch(0.55 0.012 235)` | comments, operators |
| <img src="assets/swatches/50565a.svg" width="18" height="18" alt="#50565a"> | `subtext` | `#50565a` | `oklch(0.45 0.01 240)` | muted text, ANSI white |
| <img src="assets/swatches/2e3437.svg" width="18" height="18" alt="#2e3437"> | `text2` | `#2e3437` | `oklch(0.32 0.01 240)` | properties, parameters |
| <img src="assets/swatches/12171a.svg" width="18" height="18" alt="#12171a"> | `text` | `#12171a` | `oklch(0.2 0.01 240)` | foreground |

**Accents**

| | Name | Hex | OKLCH | Used for |
|:-:|---|---|---|---|
| <img src="assets/swatches/187d6e.svg" width="18" height="18" alt="#187d6e"> | `teal` | `#187d6e` | `oklch(0.53 0.09 180)` | accent · cursor · borderActive · heading |
| <img src="assets/swatches/0f695e.svg" width="18" height="18" alt="#0f695e"> | `mint` | `#0f695e` | `oklch(0.47 0.08 182)` | hint · keyword · builtin |
| <img src="assets/swatches/1f7074.svg" width="18" height="18" alt="#1f7074"> | `aqua` | `#1f7074` | `oklch(0.5 0.075 200)` | function · link |
| <img src="assets/swatches/2b6991.svg" width="18" height="18" alt="#2b6991"> | `steel` | `#2b6991` | `oklch(0.5 0.09 240)` | info · type · namespace |
| <img src="assets/swatches/8f6213.svg" width="18" height="18" alt="#8f6213"> | `amber` | `#8f6213` | `oklch(0.53 0.105 75)` | lineNumberActive · match · warning · modified · string · code |
| <img src="assets/swatches/a04f27.svg" width="18" height="18" alt="#a04f27"> | `copper` | `#a04f27` | `oklch(0.52 0.12 45)` | number · constant · escape |
| <img src="assets/swatches/a74541.svg" width="18" height="18" alt="#a74541"> | `flare` | `#a74541` | `oklch(0.52 0.13 25)` | error · removed |
| <img src="assets/swatches/3b7a35.svg" width="18" height="18" alt="#3b7a35"> | `moss` | `#3b7a35` | `oklch(0.52 0.12 142)` | success · added |
| <img src="assets/swatches/81558e.svg" width="18" height="18" alt="#81558e"> | `orchid` | `#81558e` | `oklch(0.52 0.1 318)` | regex · decorator · tag |
| <img src="assets/swatches/845b6e.svg" width="18" height="18" alt="#845b6e"> | `rose` | `#845b6e` | `oklch(0.52 0.06 350)` | Available for custom accents |

**ANSI**

| | black | red | green | yellow | blue | magenta | cyan | white |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| normal | <img src="assets/swatches/d2d8dd.svg" width="18" height="18" alt="#d2d8dd"> | <img src="assets/swatches/a74541.svg" width="18" height="18" alt="#a74541"> | <img src="assets/swatches/3b7a35.svg" width="18" height="18" alt="#3b7a35"> | <img src="assets/swatches/8f6213.svg" width="18" height="18" alt="#8f6213"> | <img src="assets/swatches/2b6991.svg" width="18" height="18" alt="#2b6991"> | <img src="assets/swatches/81558e.svg" width="18" height="18" alt="#81558e"> | <img src="assets/swatches/187d6e.svg" width="18" height="18" alt="#187d6e"> | <img src="assets/swatches/50565a.svg" width="18" height="18" alt="#50565a"> |
| bright | <img src="assets/swatches/92999f.svg" width="18" height="18" alt="#92999f"> | <img src="assets/swatches/853532.svg" width="18" height="18" alt="#853532"> | <img src="assets/swatches/2d6029.svg" width="18" height="18" alt="#2d6029"> | <img src="assets/swatches/724d0d.svg" width="18" height="18" alt="#724d0d"> | <img src="assets/swatches/1f5272.svg" width="18" height="18" alt="#1f5272"> | <img src="assets/swatches/664371.svg" width="18" height="18" alt="#664371"> | <img src="assets/swatches/116357.svg" width="18" height="18" alt="#116357"> | <img src="assets/swatches/12171a.svg" width="18" height="18" alt="#12171a"> |

</details>

### Living Code Signal

A minimal variant of Night with a single accent. Teal marks keywords, tags and focus; everything else stays on the slate ramp. No warm literals or multicolor diagnostics.

<img src="assets/preview-signal.png" width="100%" alt="Living Code Signal: editor syntax, terminal output and ANSI palette">

Accent names such as `amber`, `copper` and `moss` remain available for port compatibility,
but in Signal they are aliases of teal or neutral colors. Diagnostics are told apart by labels, signs and underlines instead of hue.

<details>
<summary>Palette</summary>

**Neutrals**

| | Name | Hex | OKLCH | Used for |
|:-:|---|---|---|---|
| <img src="assets/swatches/020405.svg" width="18" height="18" alt="#020405"> | `crust` | `#020405` | `oklch(0.1 0.01 240)` | sidebars, tab bars, status lines |
| <img src="assets/swatches/05080b.svg" width="18" height="18" alt="#05080b"> | `base` | `#05080b` | `oklch(0.13 0.01 240)` | background |
| <img src="assets/swatches/090e11.svg" width="18" height="18" alt="#090e11"> | `mantle` | `#090e11` | `oklch(0.16 0.01 240)` | floats, cards, popups |
| <img src="assets/swatches/12171a.svg" width="18" height="18" alt="#12171a"> | `surface0` | `#12171a` | `oklch(0.2 0.01 240)` | line highlight, inactive tabs |
| <img src="assets/swatches/1d2226.svg" width="18" height="18" alt="#1d2226"> | `surface1` | `#1d2226` | `oklch(0.25 0.01 240)` | borders, ANSI black |
| <img src="assets/swatches/2d3438.svg" width="18" height="18" alt="#2d3438"> | `surface2` | `#2d3438` | `oklch(0.32 0.012 240)` | selection |
| <img src="assets/swatches/50565b.svg" width="18" height="18" alt="#50565b"> | `overlay` | `#50565b` | `oklch(0.45 0.012 240)` | line numbers, punctuation |
| <img src="assets/swatches/747c80.svg" width="18" height="18" alt="#747c80"> | `comment` | `#747c80` | `oklch(0.58 0.012 235)` | comments, operators |
| <img src="assets/swatches/9ba0a2.svg" width="18" height="18" alt="#9ba0a2"> | `subtext` | `#9ba0a2` | `oklch(0.7023 0.0065 223.49)` | muted text, ANSI white |
| <img src="assets/swatches/c8cfd4.svg" width="18" height="18" alt="#c8cfd4"> | `text2` | `#c8cfd4` | `oklch(0.85 0.01 240)` | properties, parameters |
| <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> | `text` | `#e2e9ee` | `oklch(0.93 0.01 240)` | foreground |

**Accent**

| | Name | Hex | OKLCH | Used for |
|:-:|---|---|---|---|
| <img src="assets/swatches/00a692.svg" width="18" height="18" alt="#00a692"> | `teal` | `#00a692` | `oklch(0.65 0.15 180)` | accent · cursor · borderActive · match · modified · keyword · builtin · decorator · tag · heading · link |

**ANSI**

| | black | red | green | yellow | blue | magenta | cyan | white |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| normal | <img src="assets/swatches/1d2226.svg" width="18" height="18" alt="#1d2226"> | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> | <img src="assets/swatches/c8cfd4.svg" width="18" height="18" alt="#c8cfd4"> | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> | <img src="assets/swatches/c8cfd4.svg" width="18" height="18" alt="#c8cfd4"> | <img src="assets/swatches/c8cfd4.svg" width="18" height="18" alt="#c8cfd4"> | <img src="assets/swatches/00a692.svg" width="18" height="18" alt="#00a692"> | <img src="assets/swatches/9ba0a2.svg" width="18" height="18" alt="#9ba0a2"> |
| bright | <img src="assets/swatches/50565b.svg" width="18" height="18" alt="#50565b"> | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> | <img src="assets/swatches/00a692.svg" width="18" height="18" alt="#00a692"> | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> |

</details>


### Syntax roles

| Role | Night | Frost | Paper | Signal |
|---|---|---|---|---|
| keyword | <img src="assets/swatches/52d7c1.svg" width="18" height="18" alt="#52d7c1"> `mint` | <img src="assets/swatches/8ad5c6.svg" width="18" height="18" alt="#8ad5c6"> `mint` | <img src="assets/swatches/0f695e.svg" width="18" height="18" alt="#0f695e"> `mint` | <img src="assets/swatches/00a692.svg" width="18" height="18" alt="#00a692"> `teal` |
| function | <img src="assets/swatches/9ae0dd.svg" width="18" height="18" alt="#9ae0dd"> `aqua` | <img src="assets/swatches/b6e2df.svg" width="18" height="18" alt="#b6e2df"> `aqua` | <img src="assets/swatches/1f7074.svg" width="18" height="18" alt="#1f7074"> `aqua` | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> `text` |
| type | <img src="assets/swatches/80b6d3.svg" width="18" height="18" alt="#80b6d3"> `steel` | <img src="assets/swatches/98bacd.svg" width="18" height="18" alt="#98bacd"> `steel` | <img src="assets/swatches/2b6991.svg" width="18" height="18" alt="#2b6991"> `steel` | <img src="assets/swatches/c8cfd4.svg" width="18" height="18" alt="#c8cfd4"> `text2` |
| string | <img src="assets/swatches/8acb83.svg" width="18" height="18" alt="#8acb83"> `moss` | <img src="assets/swatches/e9c897.svg" width="18" height="18" alt="#e9c897"> `amber` | <img src="assets/swatches/8f6213.svg" width="18" height="18" alt="#8f6213"> `amber` | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> `text` |
| number | <img src="assets/swatches/e18c5f.svg" width="18" height="18" alt="#e18c5f"> `copper` | <img src="assets/swatches/d49c80.svg" width="18" height="18" alt="#d49c80"> `copper` | <img src="assets/swatches/a04f27.svg" width="18" height="18" alt="#a04f27"> `copper` | <img src="assets/swatches/e2e9ee.svg" width="18" height="18" alt="#e2e9ee"> `text` |
| decorator | <img src="assets/swatches/bf91cd.svg" width="18" height="18" alt="#bf91cd"> `orchid` | <img src="assets/swatches/bc9ec6.svg" width="18" height="18" alt="#bc9ec6"> `orchid` | <img src="assets/swatches/81558e.svg" width="18" height="18" alt="#81558e"> `orchid` | <img src="assets/swatches/00a692.svg" width="18" height="18" alt="#00a692"> `teal` |
| property | <img src="assets/swatches/c8cfd4.svg" width="18" height="18" alt="#c8cfd4"> `text2` | <img src="assets/swatches/c8cfd4.svg" width="18" height="18" alt="#c8cfd4"> `text2` | <img src="assets/swatches/2e3437.svg" width="18" height="18" alt="#2e3437"> `text2` | <img src="assets/swatches/c8cfd4.svg" width="18" height="18" alt="#c8cfd4"> `text2` |
| operator | <img src="assets/swatches/747c80.svg" width="18" height="18" alt="#747c80"> `comment` | <img src="assets/swatches/7d8489.svg" width="18" height="18" alt="#7d8489"> `comment` | <img src="assets/swatches/6b7378.svg" width="18" height="18" alt="#6b7378"> `comment` | <img src="assets/swatches/747c80.svg" width="18" height="18" alt="#747c80"> `comment` |
| comment | <img src="assets/swatches/747c80.svg" width="18" height="18" alt="#747c80"> `comment` | <img src="assets/swatches/7d8489.svg" width="18" height="18" alt="#7d8489"> `comment` | <img src="assets/swatches/6b7378.svg" width="18" height="18" alt="#6b7378"> `comment` | <img src="assets/swatches/747c80.svg" width="18" height="18" alt="#747c80"> `comment` |

The table shows resolved roles for every flavor. The full role map (UI, diagnostics, markup) is in
[`palette/flavors.mjs`](palette/flavors.mjs): `defaultRoles` plus each flavor's `roles` overrides.

Every port ships every flavor: pick the `living-code-<flavor>` file, or in Neovim use `:colorscheme living-code-frost`
or set `flavor = "frost"` in the [plugin setup](#neovim). Firefox currently provides Night and Paper only.

## Ports

**Editors:** [Neovim](#neovim) · [VS Code](#vscode) · [Zed](#zed) · [Helix](#helix) · [bat · delta · Sublime Text (tmTheme)](#tmtheme) · [JetBrains IDEs](#jetbrains)

**Terminals:** [kitty](#kitty) · [Ghostty](#ghostty) · [Alacritty](#alacritty) · [WezTerm](#wezterm) · [foot](#foot)

**CLI & TUI:** [tmux](#tmux) · [fzf](#fzf) · [Starship](#starship) · [btop](#btop) · [lazygit](#lazygit) · [delta](#delta) · [Hunk](#hunk)

**Browsers:** [Firefox](#firefox)

**Web & code:** [Expressive Code](#expressive-code) · [CSS variables](#css) · [Tailwind CSS v4](#tailwind) · [JSON / JavaScript](#json)

**Theme systems:** [base16 · Stylix · tinted-theming](#base16)

Every file in `extras/`, `colors/` and `lua/living-code/palettes/` is generated. Install instructions are below.

## Installation

### npm packages

Ports used from JavaScript or CSS tooling are published to npm. Each package contains only that port's files.

| Port | Package |
|---|---|
| [Expressive Code](#expressive-code) | `@living-code/expressive-code` |
| [CSS variables](#css) | `@living-code/css` |
| [Tailwind CSS v4](#tailwind) | `@living-code/tailwind` |
| [JSON / JavaScript](#json) | `@living-code/palette` |

Native apps (editors, terminals, CLI tools, Firefox) don't need a package: copy their files from [`extras/`](extras)
or use the app's own install route, as described below.

### Editors

<a id="neovim"></a>
#### [Neovim](https://neovim.io)

This repo is a Neovim plugin.

```lua
{
  "ElliotLuque/living-code",
  priority = 1000,
  config = function()
    require("living-code").setup({
      flavor = "night",
      transparent = false,
      italic_comments = true,
    })
    vim.cmd.colorscheme("living-code")
  end,
}
```

Or pick a flavor directly: `:colorscheme living-code-signal`. Covers Tree-sitter, LSP semantic tokens, diagnostics, gitsigns, telescope, nvim-cmp / blink.cmp, which-key, mini.*, lualine (`theme = "living-code"`).

<a id="vscode"></a>
#### [VS Code](https://code.visualstudio.com)

Local install: `cd extras/vscode && pnpm dlx @vscode/vsce package` and install the `.vsix`, or symlink the folder into `~/.vscode/extensions/living-code`. Then pick **Living Code Night** in *Preferences: Color Theme*.

The same JSON works with **Shiki** and **VSCodium**. For Astro and other Expressive Code integrations, use the dedicated [Expressive Code port](#expressive-code).

<a id="zed"></a>
#### [Zed](https://zed.dev)

Copy `living-code.json` to `~/.config/zed/themes/` and select it with *theme selector: toggle*.

<a id="helix"></a>
#### [Helix](https://helix-editor.com)

Copy to `~/.config/helix/themes/`, then `theme = "living-code-night"` in `config.toml`.

<a id="tmtheme"></a>
#### [bat · delta · Sublime Text (tmTheme)](https://github.com/sharkdp/bat)

**bat / delta**

```sh
mkdir -p "$(bat --config-dir)/themes"
cp extras/tmtheme/*.tmTheme "$(bat --config-dir)/themes/"
bat cache --build
bat --list-themes | grep living-code
```

Then `--theme="living-code-night"` in `$(bat --config-dir)/config`, and `syntax-theme = living-code-night` under `[delta]` in `~/.gitconfig`. For delta's diff backgrounds, headers and gutters, also use the dedicated [delta port](https://github.com/ElliotLuque/living-code#delta).

**Sublime Text:** copy the `.tmTheme` into `Packages/User/` and select it in *UI: Select Color Scheme*.

<a id="jetbrains"></a>
#### [JetBrains IDEs](https://www.jetbrains.com/ides/)

One plugin, four themes, for IntelliJ IDEA, PyCharm, WebStorm, GoLand, Rider, CLion, RubyMine, PhpStorm, DataGrip and Android Studio (2024.1 or newer).

Build the plugin and install it from disk:

```sh
pnpm run package:jetbrains
```

This writes `dist/jetbrains/living-code-jetbrains-0.1.0.zip`. In the IDE open *Settings | Plugins*, click the gear icon, choose *Install Plugin from Disk...* and pick the zip, then restart. Select **Living Code Night** (or Frost, Paper, Signal) in *Settings | Appearance & Behavior | Appearance | Theme*; the matching editor color scheme is applied with it.

The sources in `extras/jetbrains/` are the plugin's layout: `META-INF/plugin.xml`, one `themes/living-code-<flavor>.theme.json` UI theme and one `themes/living-code-<flavor>.xml` editor scheme per flavor. This port has not been tested in a JetBrains IDE yet.

### Terminals

<a id="kitty"></a>
#### [kitty](https://sw.kovidgoyal.net/kitty/)

Copy a theme into `~/.config/kitty/themes/` and run `kitten themes`, or include it directly:

```conf
include themes/living-code-night.conf
```

<a id="ghostty"></a>
#### [Ghostty](https://ghostty.org)

Copy the files to `~/.config/ghostty/themes/`, then:

```conf
theme = dark:living-code-night,light:living-code-paper
```

<a id="alacritty"></a>
#### [Alacritty](https://alacritty.org)

Copy the file to `~/.config/alacritty/themes/` and import it:

```toml
[general]
import = ["~/.config/alacritty/themes/living-code-night.toml"]
```

<a id="wezterm"></a>
#### [WezTerm](https://wezterm.org)

Copy the files to `~/.config/wezterm/colors/`, then:

```lua
config.color_scheme = "Living Code Night"
```

<a id="foot"></a>
#### [foot](https://codeberg.org/dnkl/foot)

```ini
[main]
include=~/.config/foot/living-code-night.ini
```

### CLI & TUI

<a id="tmux"></a>
#### [tmux](https://github.com/tmux/tmux)

```tmux
source-file ~/.config/tmux/living-code-night.conf
```

<a id="fzf"></a>
#### [fzf](https://github.com/junegunn/fzf)

Source the file for your shell from `~/.bashrc` / `~/.zshrc` (`.sh`) or `config.fish` (`.fish`).

<a id="starship"></a>
#### [Starship](https://starship.rs)

Append the palette to `~/.config/starship.toml`. Module styles can then use names like `"bold teal"` or `"amber"`.

<a id="btop"></a>
#### [btop](https://github.com/aristocratos/btop)

Copy to `~/.config/btop/themes/` and pick it under *Options → Color theme*.

<a id="lazygit"></a>
#### [lazygit](https://github.com/jesseduffield/lazygit)

Merge the file into `~/.config/lazygit/config.yml`, or point `LG_CONFIG_FILE` at it alongside your config.

<a id="delta"></a>
#### [delta](https://github.com/dandavison/delta)

First install the [tmTheme port](https://github.com/ElliotLuque/living-code#tmtheme) into bat's cache for syntax colors. This port adds delta's diff backgrounds, word highlights, headers and gutters.

```sh
mkdir -p ~/.config/delta
cp extras/delta/living-code.gitconfig ~/.config/delta/
```

Include it and select a flavor in `~/.gitconfig`:

```gitconfig
[include]
	path = ~/.config/delta/living-code.gitconfig

[core]
	pager = delta

[interactive]
	diffFilter = delta --color-only

[delta]
	features = living-code-night
```

Each flavor is a delta feature: `living-code-night`, `living-code-signal`, `living-code-frost`, `living-code-paper`.

<a id="hunk"></a>
#### [Hunk](https://github.com/modem-dev/hunk)

**Extension (all flavors):** install the generated extension:

```sh
mkdir -p ~/.config/hunk/extensions
cp extras/hunk/living-code.mjs ~/.config/hunk/extensions/
```

Set the top-level `theme` in `~/.config/hunk/config.toml` (before any TOML tables):

```toml
theme = "living-code-night"
```

Or try it without installing:

```sh
hunk diff --extension ./extras/hunk/living-code.mjs --theme living-code-night
```

**Config only:** instead of the extension, merge a flavor's `.toml` file into `~/.config/hunk/config.toml` (or a repo's `.hunk/config.toml`) and set the top-level `theme` as above. Do not add duplicate theme tables. Config themes take precedence over extension themes with the same name.

Available themes: `living-code-night`, `living-code-signal`, `living-code-frost`, `living-code-paper`. Syntax colors share the editor ports' scope map.

### Browsers

<a id="firefox"></a>
#### [Firefox](https://www.firefox.com)

Choose **Night** for a dark browser or **Paper** for a light one.

1. Find [Living Code Night](https://addons.mozilla.org/en-US/firefox/search/?q=Living%20Code%20Night&type=statictheme) or [Living Code Paper](https://addons.mozilla.org/en-US/firefox/search/?q=Living%20Code%20Paper&type=statictheme) on Firefox Add-ons.
2. Open the theme’s listing and click **Install Theme**.

To switch themes, open **Add-ons and themes → Themes** (`about:addons`) and enable your preferred variant.

### Web & code

<a id="expressive-code"></a>
#### [Expressive Code](https://expressive-code.com)

Use the dedicated themes for syntax highlighting, editor and terminal frames, copy buttons, line numbers, and highlighted or diff lines.

For Astro:

```sh
pnpm add @living-code/expressive-code astro-expressive-code
```

Add the integration to `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import night from "@living-code/expressive-code/living-code-night.json" with { type: "json" };
import paper from "@living-code/expressive-code/living-code-paper.json" with { type: "json" };

export default defineConfig({
  integrations: [expressiveCode({ themes: [night, paper] })],
});
```

Night and Paper follow the visitor’s dark/light preference by default. Replace Night with `living-code-frost.json` or `living-code-signal.json` for another dark flavor, or pass a single theme for a fixed appearance.

**Starlight:** pass the same `themes` array to `starlight({ expressiveCode: { themes: [night, paper] } })` instead of adding a separate integration. For other integrations, pass these JSON objects to their Expressive Code `themes` option. When using the `ExpressiveCode` JavaScript API directly, wrap each JSON object in `new ExpressiveCodeTheme(theme)` (imported from `expressive-code`).

<a id="css"></a>
#### [CSS variables](https://developer.mozilla.org/docs/Web/CSS/color_value/oklch)

```sh
pnpm add @living-code/css
```

Import the stylesheet in your app:

```css
@import "@living-code/css/living-code.css";
```

Or load it directly in HTML:

```html
<link rel="stylesheet" href="living-code.css" />
<html data-theme="living-code-night">
```

Use palette names (`var(--lc-teal)`) or semantic roles (`var(--lc-keyword)`, `var(--lc-bg)`, `var(--lc-border-active)`).

<a id="tailwind"></a>
#### [Tailwind CSS v4](https://tailwindcss.com)

```sh
pnpm add @living-code/css @living-code/tailwind
```

```css
@import "tailwindcss";
@import "@living-code/css/living-code.css";
@import "@living-code/tailwind/living-code.css";
```

Then `bg-lc-base text-lc-text border-lc-surface1`, `text-lc-keyword`, etc.

<a id="json"></a>
#### [JSON / JavaScript](https://github.com/ElliotLuque/living-code)

```sh
pnpm add @living-code/palette
```

```js
import { palette } from "@living-code/palette";
palette.night.colors.teal.hex;
palette.night.roles.keyword;
```

Or read `palette.json` from any language.

### Theme systems

<a id="base16"></a>
#### [base16 · Stylix · tinted-theming](https://github.com/tinted-theming/home)

**Stylix (NixOS / home-manager)**

```nix
inputs.living-code = { url = "github:ElliotLuque/living-code"; flake = false; };

stylix.base16Scheme = "${inputs.living-code}/extras/base16/living-code-night.yaml";
stylix.polarity = "dark";
```

base16 has 16 slots shared between ANSI and syntax, so Stylix-generated themes get Living Code *colors* with base16 *roles*
(teal accents, but strings green and keywords purple). For apps where the native port exists, disable the Stylix target and
use the port for exact Living Code syntax. For example, `stylix.targets.kitty.enable = false` + `programs.kitty.extraConfig = "include ${inputs.living-code}/extras/kitty/living-code-night.conf"`, and the same for `neovim`, `vscode`, `bat`, `helix`, `zed`.

Also works with **tinted-theming** tools (`tinty`, `flavours`, base16-shell): copy the YAML into their schemes directory.


## Using the palette in something else

Any app can follow the theme: read [`palette.json`](palette.json) (hex, OKLCH, RGB, roles and ANSI for every flavor),
or map these semantic roles onto the app's own color slots:

| Slot | Role | Night |
|---|---|---|
| background / foreground | `bg` / `fg` | `#05080b` / `#e2e9ee` |
| panels, sidebars | `bgDeep`, `bgAlt` | `#020405`, `#090e11` |
| accent, cursor, focus ring | `accent` | `#00a692` |
| selection | `selection` | `#2d3438` |
| borders | `border` / `borderActive` | `#1d2226` / `#00a692` |
| error / warning / info / success | `error` … | `#e96560` `#f0be6d` `#80b6d3` `#8acb83` |

## Recolor images

Turn any image, such as a wallpaper, into a Living Code version. Requires [ImageMagick 7](https://imagemagick.org).

```sh
node scripts/recolor.mjs wallpaper.jpg --flavor night --mode lut
```

| Mode | Result |
|---|---|
| `lut` | Starts with the theme's slate ramp. Shadows and muted areas stay neutral; colorful midtones receive the selected flavor's accents over that base. Lightness is fitted to the theme's range. Tune the accent amount with `--color` (default: 0.65). Core accents are teal, mint, aqua, steel, amber and copper; `--accents all` includes the remaining accents. |
| `gradient` | Maps brightness onto dark slate, an accent and light text. Pick the accent with `--accent amber`. |
| `remap` | Posterizes to the exact palette colors. Add `--no-dither` for flat areas. |
| `all` | Writes one file per mode. |

In `lut` mode, `--color 0` uses only the slate ramp; `--color 1` allows stronger accents while still protecting shadows and muted areas.
Unlike `--strength`, lowering `--color` does not bring back the original photo's colors. It controls accent blending, not a fixed percentage of the image's area.
Other controls are `--spread` (hue blending), `--keep-light` (brightness preservation) and `--smooth` (color-noise smoothing).
Use `--flavor signal` for slate and teal only; compatibility names such as `amber` do not add warm hues in Signal.

Output defaults to `<image>-<flavor>-<mode>.png` next to the input. Run with `--help` for every option.

## Contributing a port

1. Add a generator to `scripts/ports/`: a pure function from a resolved flavor to files.
2. Register it in `scripts/ports/index.mjs`.
3. `node scripts/build.mjs` regenerates everything, including this README.

If the port is consumed from JavaScript or CSS, set `npm: "<name>"` on it to publish it as `@living-code/<name>`.
Packages are built with `pnpm run build:packages`. Release instructions: [Publishing](docs/PUBLISHING.md).

Regenerate the README preview images with `pnpm run screenshots`. This uses headless Chrome (`google-chrome` by default;
set `CHROME_BIN` for another Chromium executable) and captures all four flavors from the live preview at 1280×720.
The scenes are illustrative editor and terminal previews, not screenshots of installed applications.

Live preview with sliders and every port's output: `node scripts/serve.mjs` → <http://localhost:4173/preview/>.

To change a color, edit [`palette/flavors.mjs`](palette/flavors.mjs) and rebuild. Do not edit generated files directly.

## License

[MIT](LICENSE) © Elliot Luque
