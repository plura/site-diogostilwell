---
name: escapeLessValues
description: Convert CSS property values to LESS-compatible format using proper escape literals.
argument-hint: CSS file path or source, and any specific escape scope (e.g., all functions, specific units, grid syntax)
---

# Escape CSS Values for LESS Compatibility

**Quick summary:** Flatten nested `:is()`, `:has()`, `:where()` selectors into explicit comma-separated lists, then escape modern CSS values using LESS `~"..."` literals.

**Two-step process: (1) Flatten nested selectors, (2) Escape modern CSS values.**

---

## Step 1: Flatten Nested Functional Selectors

### Rule: Flatten nested functional selectors

**Core Rule:** If you see `:is()`, `:has()`, or `:where()` with **any** `:is()`, `:has()`, or `:where()` inside it (in any form), flatten it.

This includes:
- `:is()`, `:has()`, `:where()` appearing **alone** inside another functional selector: `:is(:is(...))`, `:is(:has(...))`, `:has(:where(...))`
- `:is()`, `:has()`, `:where()` **with a preceding selector**: `:is(.element:has(...))`, `:is(section:is(...))`, `:has(.class:where(...))`
- `:is()`, `:has()`, `:where()` **with a pseudo-class/pseudo-element**: `:is(:root:has(...))`, `:is(:root[data-theme]:where(...))`, `:has(:not(:is(...)))`
- Any mix of nested functional selectors in operands: `:is(...:has(...):where(...))`, `:is(section:is(...), footer:has(...))`
- Multiple operands with nested selectors: `:is(section[id^="ds-project-"]:has(.video), footer section:is(#contact):has(.html))`

**Examples of patterns that MUST be flattened:**
- `:is(:root:has(#hero-banner))` ← `:has()` inside `:is()` with pseudo-class
- `:is(:root:not([data-theme="light"]), :root:has(#banner))` ← Multiple operands, one with `:has()` 
- `:is(section[id]:has(.video, .image))` ← `:has()` with element and attribute selector preceding it
- `:root:has(:is(.el, .other))` ← `:is()` inside `:has()` with pseudo-class
- `.el:has(:is(.child))` ← `:is()` inside `:has()` with element selector
- `:root:has(.nested:is(...))` ← `:is()` with selector inside `:has()` 
- `.el:has(:where(.a, .b))` ← `:where()` inside `:has()` with element selector

**Key point:** Any functional selector (`:is()`, `:has()`, `:where()`) containing ANY other functional selector, in ANY direction or form, must be flattened.

**DO NOT FLATTEN: Selectors separated by descendant combinators (spaces)** — these are already optimal:
- `:is(...) :is(...)` / `:has(...) :where(...)` / etc. → Leave unchanged

### How to Flatten

**Strategy:** Distribute outer selectors across all inner targets, preserve identical behavior

**Example 1: Simple nesting**
```css
/* BEFORE */
:is(:is(.header-title-text, .header-nav), .logo) {
  color: var(--ds-fg-dark);
}

/* AFTER */
.header-title-text,
.header-nav,
.logo {
  color: var(--ds-fg-dark);
}
```

**Example 2: With preceding selector**
```css
/* BEFORE */
:is(
  section[id^="ds-project-"]:has(.sqs-block-video),
  section:is(#contact, #ds-footer-copyright-author)
) {
  margin: 0 auto var(--ds-pad-lr);
}

/* AFTER */
section[id^="ds-project-"]:has(.sqs-block-video),
section:is(#contact),
section:is(#ds-footer-copyright-author) {
  margin: 0 auto var(--ds-pad-lr);
}
```

**Example 3: Complex nesting with multiple nested selectors**
```css
/* BEFORE - Multiple nested :has() and :is() in operands */
:is(
  section[id^="ds-project-"]:has(.sqs-block-video, .sqs-block-image),
  footer section:is(#contact, #ds-footer-copyright-author):has(.sqs-block-html)
) {
  display: grid;
}

/* AFTER - Flatten all nested selectors into explicit comma-separated list */
section[id^="ds-project-"]:has(.sqs-block-video),
section[id^="ds-project-"]:has(.sqs-block-image),
footer section:is(#contact),
footer section:is(#ds-footer-copyright-author) {
  display: grid;
}
```

### ✓ Flattening Complete? Verify Before Step 2

- No nested `:is()`, `:has()`, `:where()` remain
- All adjacent selectors (with descendant combinators) preserved unchanged
- All nested selectors expanded into explicit comma-separated lists

---

---

## Step 2: Escape Modern CSS Values

**After flattening is 100% complete**, escape property values using LESS literals: `property: ~"VALUE";`

### Critical Rule: Replace Entire Multi-line Values

⚠️ When collapsing multi-line CSS values, **replace the entire property from name to semicolon** with exact whitespace/indentation. This prevents orphaned line remnants.

### What to Escape

| Category | Examples | Escape? |
|----------|----------|---------|
| **CSS functions** | `calc()`, `clamp()`, `min()`, `max()` | ✓ Always |
| **Viewport units** | `dvh`, `dvw`, `svh`, `svw`, `lvh`, `lvw` | ✓ Always |
| **Grid slash syntax** | `grid-column: 1 / -1` | ✓ Always |
| **Modern RGB/HSL** | `rgb(20 26 20 / 0.6)` (space-separated or slash alpha) | ✓ Always |
| **Legacy RGB/HSL** | `rgb(255, 0, 0)` (comma-separated) | ✗ Never |
| **Filter with saturate** | `filter: ... saturate(...) ...` | ✓ Always |
| **Filter without saturate** | `filter: grayscale(50%)` | ✗ Never |
| **Standalone vars** | `var(--ds-pad-lr)` | ✗ Never |

### Example: Collapsing Multi-line Values

```css
/* BEFORE */
--ts-award: calc(
  var(--ts) +
  (var(--ds-trans-lvl2-delay-step) * (var(--ds-trans-lvl2-delay-step-n, 1) - 1))
);

/* AFTER - Replace entire property, not just the value */
--ts-award: ~"calc(var(--ts) + (var(--ds-trans-lvl2-delay-step) * (var(--ds-trans-lvl2-delay-step-n, 1) - 1)))";
```

---

## Final Verification Checklist

After completing **both steps**, verify:

**Step 1 - Flattening Complete:**
- ✓ No nested `:is()`, `:has()`, `:where()` selectors remain
- ✓ All adjacent selectors preserved
- ✓ All nested selectors properly distributed into comma-separated lists

**Step 2 - Escaping Complete:**
- ✓ `calc()`, `clamp()`, `min()`, `max()` (including when containing `var()`) are escaped
- ✓ Space-separated or slash-alpha `rgb()` / `hsl()` are escaped
- ✓ `filter` property values containing `saturate()` are escaped
- ✓ `dvh`, `dvw`, `svh`, `svw`, `lvh`, `lvw` are escaped
- ✓ Grid slash syntax: `grid-column: 1 / -1` is escaped
- ✓ Comments, formatting, and property order are preserved
