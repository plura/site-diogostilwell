# site-diogostilwell

Custom development layer for the **Diogo Stilwell Squarespace site**, built with a clean separation between modern source code and Squarespace-compatible output.

This repository acts as a **canonical source of truth** for all custom CSS, JavaScript, animations, and reusable blocks, while accounting for Squarespace's platform constraints.

---

## Repository Structure

```
src/
    Canonical source code
    - Modern CSS (design tokens, theming, grids)
    - Modular JavaScript

blocks/
    Reusable HTML snippets
    - For Squarespace Code Blocks
    - Kept platform-agnostic where possible

squarespace/
    Platform-ready output
    - compiled.css — standard CSS (for reference / non-Squarespace use)
    - compiled-less.css — LESS-escaped CSS (paste into Squarespace Custom CSS)
    - compiled.js — concatenated JS (paste into Code Injection header)
    - Files safe to copy/paste into Squarespace

tests/anim/
    Isolated animation playground
    - GSAP logo animation experiments
    - No Squarespace dependencies
```

---

## Compile Workflow

Run both commands from the project root:

```bash
php /path/to/code-export/src/code-export.php --mode=concat --source "src/css" --output "squarespace/compiled.css" --ext=css
php /path/to/code-export/src/code-export.php --mode=concat --source "src/js" --output "squarespace/compiled.js" --ext=js
```

The tool writes `compiled1.css` / `compiled1.js` — delete old compiled files and rename the outputs. Then duplicate `compiled.css` → `compiled-less.css` and apply LESS escaping per `.github/prompts/escapeLessValues.prompt.md`.

---

## Workflow & Philosophy

* **All development happens in `src/`**
* Code is written as **modern, readable CSS & JS**
* Squarespace-specific constraints are handled **only at the output stage**
* No business logic, animation logic, or layout logic lives directly in Squarespace editors

This keeps the codebase:

* Testable
* Maintainable
* Portable outside Squarespace if needed

---

## Squarespace Custom CSS: LESS Parsing Constraints

Squarespace **does not treat Custom CSS as plain CSS**.

All Custom CSS is parsed through an **old LESS compiler (LESS v1.3.1)**, which predates modern CSS features.
This behaviour is undocumented but widely confirmed by community reports and real-world debugging.

As a result, **valid modern CSS may fail silently**.

### Typical Failure Modes

When the LESS parser breaks, Squarespace may:

* Ignore individual properties
* Drop entire rule blocks
* Stop parsing the stylesheet further down
* Cause unrelated styles (layout, typography, animation) to disappear

These failures often appear disconnected from the actual rule that caused them.

---

## Syntax That Requires Escaping

The following must be escaped in Squarespace-ready CSS:

* `calc(...)`
* `clamp(...)`
* `min()` / `max()` **when used as functions**
* CSS variables inside calculations (`var(--token)`)
* Modern viewport units (`dvh`, `dvw`, `svh`, `svw`, etc.)
* Slash syntax such as:

  * `grid-column: 1 / -1`
* Modern colour syntax with slash alpha:

  * `rgb()` / `hsl()` using **space-separated channels and `/` opacity**
    (e.g. `rgb(0 0 0 / 0.5)`, `hsl(120 30% 40% / 0.6)`)
* `filter` values containing `saturate()`

Nested `:is()`, `:has()`, `:where()` selectors must also be **flattened** into explicit comma-separated lists before escaping.

Full rules: `.github/prompts/escapeLessValues.prompt.md`

---

## LESS Literal Escaping Strategy

LESS supports literal output via:

```css
property: ~"value";
```

### Example

Instead of:

```css
max-height: calc(100vh - var(--header-height));
```

Use:

```css
max-height: ~"calc(100vh - var(--header-height))";
```

---

## CSS Strategy & Theming

* Token-driven design using `:root`
* Semantic tokens:

  * `--ds-bg`, `--ds-fg`
  * overlays
  * text-on-media
* Olive-based palette with **inverted logic**:

  * light background → dark foreground
  * dark background → light foreground

### Dark Mode

* Default via `prefers-color-scheme`
* Manual toggle via `data-theme` attribute on `<html>`
* Persistence via `localStorage` key `"theme"`
* Toggle triggered by `DSThemeModeToggle()` — wired to any `a[href="#thememode"]` in the header
* Intro section forces its own dark theme regardless of global state

---

## Layout & Grids

* Custom **Projects / Videos grid**

  * Replaces native Squarespace layout
  * Uses `display: contents` to flatten wrappers
  * Responsive grid logic based on item count
  * All edge cases handled, including LESS escaping

---

## Intro & Logo Animation

* Powered by **GSAP**
* Animation: sequential letter reveal (slide + fade) → dot drop → hold → timeline reverses to hidden state
* Lifecycle:
  1. Timeline reverses → `ds-animation-done` class added to SVG
  2. CSS fades out the intro section (`opacity: 0; visibility: hidden`)
  3. GSAP fades SVG opacity to 0, then removes it from the DOM
  4. `ds-intro-done` class added to `<html>` — available for downstream CSS/JS hooks
* Initial flash prevented by scoping intro theme via CSS before GSAP initialises
* SVG is centered and width-constrained (`min(80vw, 900px)`)

---

## JavaScript Architecture

All functions are namespaced under `DS`.

### `DSIntroInit(svg, animation, options)`

Centralised animation lifecycle handler for the intro.

Options:

* `delay` — start delay in seconds
* `paused` — start paused
* `key` — keyboard key code to toggle play/pause
* `onEnd` — callback on forward complete
* `onReverseEnd` — callback on reverse complete
* `onTurnaround` — callback fired at the moment of reversal
* `removeOnComplete` — fade and remove SVG after reverse completes
* `onRemoved` — callback fired after SVG is removed from DOM

Callbacks are **chained**, never overwritten.

### `DSAnimIntroSVG(svg, options)`

The intro animation factory. Builds the GSAP timeline: letters appear → dot drops → hold → rewind. Adds `ds-animation-done` to the SVG on reverse complete.

### `DSThemeModeToggle(options)`

Initialises the dark/light mode toggle. Reads and writes `localStorage` key `"theme"`. Applies `data-theme` to `<html>` and `ds-theme-light` / `ds-theme-dark` class to the trigger element.

### `DSCountdown(options)`

Animated countdown to a target date. Supports animated digit strips.

### `DSHeroBanner(options)`

Manages hero banner H1 height synchronisation.

### Debug Logging

`DS_DEBUG` constant in `utils.js` (default `false`). When `true`, `dsLog()` calls output to the console. Flip to `true` locally for debugging — never commit as `true`.
