# diogostilwell.com — Claude Code Notes

## Project

Portfolio site for client Diogo Stilwell, built on Squarespace. No traditional build system — custom functionality is injected via Code Injection (header) and Code Blocks.

## Structure

- `/src/css`, `/src/js` — Source files. Edit here.
- `/squarespace` — Production assets: `compiled.css`, `compiled-less.css`, `compiled.js`, `code-injection-header.html`
- `/blocks` — Squarespace Code Block snippets (e.g. `intro.html`)
- `/icons` — UI assets
- `/.github/prompts` — Detailed workflow prompts (see below)
- `/tests` — Prototypes and experiments

## Compile workflow

When asked to "compile the js and css", follow `.github/prompts/compile-workflow.prompt.md`.

Summary:
1. Concatenate `src/css/*.css` → `squarespace/compiled.css`
2. Concatenate `src/js/*.js` → `squarespace/compiled.js`
3. Duplicate `compiled.css` → `compiled-less.css`, then apply LESS escaping (see below)

## LESS compatibility

Squarespace uses LESS v1.3.1. Modern CSS values must be escaped in `compiled-less.css`.

Full rules in `.github/prompts/escapeLessValues.prompt.md`. Key rules:
- Wrap `calc()`, `clamp()`, `min()`, `max()` in `~"..."` — e.g. `width: ~"min(80vw, 900px)"`
- Wrap viewport units `dvh`, `dvw`, `svh`, `svw`, `lvh`, `lvw`
- Wrap grid slash syntax — e.g. `grid-column: ~"1 / -1"`
- Wrap space-separated or slash-alpha `rgb()`/`hsl()`
- Flatten nested `:is()`, `:has()`, `:where()` selectors before escaping
- Never escape standalone `var(--foo)` or comma-separated `rgb(255, 0, 0)`

## Key conventions

- JS functions are namespaced under `DS` (e.g. `DSThemeModeToggle`, `DSCountdown`)
- SVG letter IDs follow `ds-logo-letter-{s,t,i,l1,w,e,l2,l3}` + `ds-logo-letter-i-dot`
- Theme toggle uses `data-theme` on `<html>` and `localStorage` key `"theme"`
- CSS custom properties use `--ds-` prefix
