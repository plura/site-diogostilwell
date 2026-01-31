# site-diogostilwell

Custom development layer for the **Diogo Stilwell Squarespace site**, built with a clean separation between modern source code and Squarespace-compatible output.

This repository acts as a **canonical source of truth** for all custom CSS, JavaScript, animations, and reusable blocks, while accounting for Squarespace’s platform constraints.

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
	- LESS-escaped CSS
	- Header / footer injection code
	- Files safe to copy/paste into Squarespace

tests/anim/
	Isolated animation playground
	- GSAP logo animation experiments
	- No Squarespace dependencies
```

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
* Modern viewport units (`dvh`, `dvw`, etc.)
* Slash syntax such as:

  * `grid-column: 1 / -1`

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

## LESS-ready CSS conversion rule

Use the following prompt **as-is** when converting modern CSS into Squarespace-ready CSS (manually or using any AI assistant):

> Rewrite the active CSS file to be Squarespace LESS-compatible. Escape ONLY property values using LESS literals in the exact form property: ~"VALUE"; when the value contains calc(), clamp(), or min()/max() as functions (including when they contain var(--…)), modern viewport units (dvh, dvw, svh, svw, lvh, lvw), or slash grid syntax (e.g. 1 / -1). If an escaped value spans multiple lines (esp. CSS custom properties), collapse it into a single-line string inside ~"...". Do NOT escape plain var(--…) unless it’s inside those functions. Keep selectors, formatting, order, and comments unchanged, then quickly scan to ensure no required escapes remain.

### Saving for reuse (VS Code / Copilot)

To reuse this prompt consistently:

* Open **Copilot Chat** in VS Code
* Paste the prompt above
* Save it as a named prompt (e.g. using `/saveprompt`, if available)

Suggested name:

```
Squarespace LESS – CSS escape pass
```

This allows running a strict, mechanical “LESS-ready” conversion without re-explaining the rules each time.

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
* Squarespace core colour variables (`--paragraphMediumColor`, etc.)

  * deliberately **not overridden yet**

### Dark Mode (Planned)

* Default via `prefers-color-scheme`
* Future manual toggle via `data-theme`
* Persistence via `localStorage`
* Intro section forces its own theme regardless of global state

---

## Layout & Grids

* Custom **Home section**

  * Dynamic vertical padding via JS-injected CSS variables
* Custom **Projects / Videos grid**

  * Replaces native Squarespace layout
  * Uses `display: contents` to flatten wrappers
  * Responsive grid logic based on item count
  * All edge cases handled, including LESS escaping

---

## Intro & Logo Animation

* Powered by **GSAP**
* Chosen animation: **anim3**

  * Sequential letter reveal (slide + fade)
  * Dot appears last
  * Hold on final state
  * Timeline reverses back to a deterministic hidden state
* Old stroke / drawing animation fully removed
* Initial flash prevented by:

  * Forcing intro theme via CSS
  * Hiding letters until GSAP initialises
* SVG is:

  * Centered
  * Width-constrained (`min(80vw, 900px)`)
  * Protected from Squarespace auto-stretching

---

## JavaScript Architecture

### animinit()

Centralised animation lifecycle handler.

Responsibilities:

* Initialisation
* Delays / paused state
* Safe callback chaining

Supported options:

* `delay`
* `paused`
* `key`
* `onEnd` – forward animation end
* `onReverseEnd` – rewind complete

Callbacks are **chained**, never overwritten.

### Animations

* `anim1`, `anim2`, `anim3`
* Do **not** call user callbacks directly
* Own their internal logic only
* `anim3` owns its rewind behaviour
* `animinit` owns external hooks