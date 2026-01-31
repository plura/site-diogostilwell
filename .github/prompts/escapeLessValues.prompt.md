---
name: escapeLessValues
description: Convert CSS property values to LESS-compatible format using proper escape literals.
argument-hint: CSS file path or source, and any specific escape scope (e.g., all functions, specific units, grid syntax)
---

# Escape CSS Values for LESS Compatibility

You are converting a CSS file to be Squarespace LESS-compatible by escaping modern CSS syntax that LESS might incorrectly parse as mathematical operations.

## Escape Requirements

Escape **only** property values using LESS literals in the exact form `property: ~"VALUE";` when the value contains:

- **Modern CSS functions**: `calc()`, `clamp()`, `min()`, `max()`
  - Also applies when these functions contain `var(--…)` e.g., `calc(var(...) * 2)`
- **Color functions with modern syntax**: `rgb()`, `hsl()`
  - **Escape only when using space-separated channels and/or slash alpha** e.g., `rgb(20 26 20 / 0.6)`
  - **Do NOT escape** comma-separated legacy syntax: `rgb(255, 0, 0)` or `hsl(120, 100%, 50%)`
- **Modern viewport units**: `dvh`, `dvw`, `svh`, `svw`, `lvh`, `lvw`
- **Slash syntax** in grid properties: e.g., `grid-column: 1 / -1`


## Rules

- **Collapse multi-line values** into single-line strings inside `~"..."`
- **Do NOT escape** standalone `var(--…)` outside of functions
- **Do NOT escape** comma-separated color syntax: `rgb(255, 0, 0)` or `hsl(120, 100%, 50%)`
- **Keep selectors, comments, formatting, and order unchanged**
- **Verify all required escapes are in place** after conversion

## Escape Pattern

```css
/* Before */
calc(100% - 20px);
clamp(1rem, 2vw, 3rem);
grid-column: 1 / -1;
min(80vw, 900px);
rgb(20 26 20 / 0.6);
rgb(255, 0, 0);

/* After */
~"calc(100% - 20px)";
~"clamp(1rem, 2vw, 3rem)";
grid-column: ~"1 / -1";
~"min(80vw, 900px)";
~"rgb(20 26 20 / 0.6)";
rgb(255, 0, 0);
```

Convert the specified CSS file systematically, then verify these patterns are all escaped:
- `calc()`, `clamp()`, `min()`, `max()` (including when containing `var()`)
- Space-separated or slash-alpha `rgb()` / `hsl()`
- `dvh`, `dvw`, `svh`, `svw`, `lvh`, `lvw`
- Grid slash syntax: `grid-column: 1 / -1`
