# site-diogostilwell

Custom development and intervention layer for the Diogo Stilwell Squarespace site.

This repository contains:
- Source CSS and JavaScript (modern, clean)
- Reusable HTML blocks for Squarespace Code blocks
- Squarespace-ready CSS and injection code
- Documentation of platform-specific constraints

---

## Squarespace Custom CSS: LESS Parsing Quirks

Squarespace **does not process Custom CSS as plain CSS**.

Internally, all Custom CSS is parsed through an **old LESS compiler (LESS v1.3.1)**.  
This is undocumented behaviour, but widely confirmed by community reports and real-world debugging. :contentReference[oaicite:0]{index=0}

Because this LESS version predates modern CSS features, **valid CSS can break silently**.

---

## Common Symptoms

When the parser fails, Squarespace may:

- Ignore individual properties
- Drop entire rule blocks
- Stop parsing the stylesheet further down
- Cause unrelated styles (typography, layout, animation) to disappear

These issues often appear unrelated to the rule being edited.

---

## Commonly Affected Syntax

The following are especially problematic in Squarespace Custom CSS:

- `calc(...)`
- `clamp(...)`
- CSS variables inside calculations (`var(--foo)`)
- Modern viewport units (`svh`, `dvh`, etc.)
- Arithmetic inside properties such as:
  - `transition-delay`
  - `max-height`
  - gradients
  - transforms

LESS attempts to evaluate expressions, but **does not understand CSS variables**, which leads to parsing failures.

---

## Workaround: LESS Literal Escaping

LESS supports literal output using:

```css
property: ~"value";
````

This forces LESS to output the value verbatim.

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

## Project Approach

* Development is done using **modern, unescaped CSS**
* Only at the final stage are problematic properties escaped
* A Squarespace-compatible version is generated for copy/paste

This keeps the source readable while ensuring platform compatibility.

---

## References

* Some valid CSS ignored by Squarespace
  [https://forum.squarespace.com/topic/287067-some-valid-css-seem-to-be-ignored-or-unvalidated-by-squarespace/#elComment_733596](https://forum.squarespace.com/topic/287067-some-valid-css-seem-to-be-ignored-or-unvalidated-by-squarespace/#elComment_733596)

* `calc()` inside gradients breaks the Custom CSS editor
  [https://forum.squarespace.com/topic/231299-custom-css-trying-to-use-calc-inside-a-gradient-breaks-editor-view/#elComment_590817](https://forum.squarespace.com/topic/231299-custom-css-trying-to-use-calc-inside-a-gradient-breaks-editor-view/#elComment_590817)

* Making `calc()` work in Squarespace Custom CSS
  [https://forum.squarespace.com/topic/163225-how-to-make-css-calc-function-work-on-custom-css-editor/#elComment_371502](https://forum.squarespace.com/topic/163225-how-to-make-css-calc-function-work-on-custom-css-editor/#elComment_371502)
