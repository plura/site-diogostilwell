# Compilation Workflow

When compiling JS and CSS files for deployment to Squarespace, follow this process:

## JavaScript Compilation

1. Join all JavaScript files from `src/js/` into a single file:
   - `src/js/init.js`
   - `src/js/layout-banner.js`
   - `src/js/layout-countdown.js`
   - `src/js/layout-intro.js`
   - `src/js/squarespace.js`
   - `src/js/utils.js`

2. Output: `squarespace/compiled.js`

## CSS Compilation

1. Join all CSS files from `src/css/` into a single file:
   - `src/css/globals.css`
   - `src/css/layout-animations.css`
   - `src/css/layout-components.css`
   - `src/css/layout-cpt.css`
   - `src/css/layout-pages.css`
   - `src/css/layout-structure.css`

2. Output: `squarespace/compiled.css`

## LESS-Compatible CSS

1. Duplicate `squarespace/compiled.css`
2. Rename copy to `squarespace/compiled-less.css`
3. Use `escapeLessValues.prompt.md` to format and escape the contents
   - This handles LESS v1.3.1 parser constraints for Squarespace
   - Escapes: `calc()`, `clamp()`, `min()`, `max()`, CSS variables, viewport units, slash syntax, modern color syntax

## Squarespace Injection

After compilation:
- Use `squarespace/compiled.js` for custom JavaScript injection
- Use `squarespace/compiled-less.css` for Custom CSS injection
