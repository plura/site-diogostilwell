# Compilation Workflow

When user asks to "compile the js and css", follow this complete process:

## Execution Steps

### 1. Run Compilation Commands

Join all source files into single compiled outputs:

```bash
code-export --mode=concat --source "src/css" --output "squarespace/compiled.css" --ext=css
code-export --mode=concat --source "src/js" --output "squarespace/compiled.js" --ext=js
```

### 2. Create LESS-Compatible CSS

1. Duplicate `squarespace/compiled.css` 
2. Rename copy to `squarespace/compiled-less.css`
3. Run `escapeLessValues.prompt.md` on `compiled-less.css`
   - This escapes modern CSS syntax that LESS v1.3.1 cannot parse
   - Escapes: `calc()`, `clamp()`, `min()`, `max()`, viewport units (dvh, dvw, svh, svw, lvh, lvw), slash syntax, functions with `var(--...)`

## Output Files

- **JavaScript**: `squarespace/compiled.js` - Use for custom JS injection
- **CSS**: `squarespace/compiled.css` - Standard CSS version
- **LESS CSS**: `squarespace/compiled-less.css` - Squarespace-compatible version (use for Custom CSS injection)
