---
sidebar_position: 2
---

# React (Vite) Refactor

The React Vite refactor (`-t react-vite`) converts a Vite-bundled React application into human-readable ES module files with canonical library imports and recovered JSX syntax. It targets bundles produced by Vite's rolldown bundler — the standard output for `vite build` with React projects.

## Usage

```bash
js-recon refactor -t react-vite [options]
```

See the [Refactor command reference](../refactor.md) for the full options table.

## How it works

Unlike webpack, Vite already produces split ESM chunks — one file per route component or logical boundary. The refactor step does not split files; instead it removes bundler boilerplate and recovers readable code.

### Vite bundle structure

A Vite production build with rolldown typically produces:

| Chunk                          | Description                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `rolldown-runtime-*.js`        | Interop helper module exporting `__toESM` and `__commonJS`. Skipped by the refactor.                   |
| `vendor-react-*.js`            | CJS library wrappers for React, react-dom, react/jsx-runtime, and direct exports for react-router-dom. |
| `index-*.js`                   | App entry chunk. Uses `lazy(() => import('./RouteChunk-*.js'))` for route-based code splitting.        |
| `Home-*.js`, `Profile-*.js`, … | Route component chunks. Each contains a single default export.                                         |

A typical app chunk before refactoring:

```javascript
import { r as n, t, s as a, o as l } from "./vendor-react-CLFLfR9F.js";
import { n as p } from "./rolldown-runtime-Bh1tDfsg.js";

var i = p(t(), 1), // __toESM(React getter, 1)
    u = a(), // bare jsx-runtime getter
    d = l(); // bare react-dom/client getter

function s(props) {
    return (0, u.jsxs)(`div`, {
        children: [(0, u.jsx)(`h1`, { children: `Hello` }), (0, i.useState)(0)],
    });
}
export { s as default };
```

After refactoring:

```jsx
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";

function s(props) {
    return (
        <div>
            <h1>Hello</h1>
            {useState(0)}
        </div>
    );
}
export { s as default };
```

### Stage 1 — Vendor chunk analysis

The refactor parses every vendor chunk (`vendor-react-*.js`) and builds a classification map that links each short exported name (for example `r`, `n`, `t`) to its canonical library identity:

| Exported name | Library             | Canonical identity |
| ------------- | ------------------- | ------------------ |
| `r`           | `react`             | CJS module getter  |
| `t`           | `react/jsx-runtime` | CJS module getter  |
| `d`           | `react-dom/client`  | CJS module getter  |
| `n`           | `react-router-dom`  | `Link`             |
| `s`           | `react-router-dom`  | `BrowserRouter`    |
| …             | …                   | …                  |

CJS library wrappers are identified by inspecting the factory function body. react-router-dom exports are identified by their `.displayName` assignments (rolldown uses template literal syntax: `` Link.displayName = `Link` ``).

### Stage 2 — Interop var detection

In each app chunk, variable declarations of the form:

```javascript
var i = p(t(), 1); // __toESM(getter(), 1)
var u = a(); // bare getter call
```

are recognized as interop vars. They are linked to their library using the vendor export map, and their local names are recorded.

### Stage 3 — Library call rewriting

Indirect calls via interop vars are rewritten to bare canonical calls:

```javascript
// before
(0, u.jsxs)(`div`, { children: [...] })
(0, i.useState)(0)

// after
jsxs('div', { children: [...] })
useState(0)
```

### Stage 4 — Import statement rewriting

The vendor import statement is replaced with direct canonical library imports:

```javascript
// before
import { r as n, t, s as a } from "./vendor-react-CLFLfR9F.js";

// after
import { useState, useEffect } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
import { Link, BrowserRouter } from "react-router-dom";
```

Only the imports actually used in the chunk are emitted (Pass H prunes unused specifiers).

### Stage 5 — JSX recovery and cleanup

Shared cleanup passes from the webpack refactor run on each chunk:

- **slicedToArray collapse** — Recovers `const [a, b] = hook(...)` from Babel's compiled array-destructure pattern.
- **JSX recovery** — Converts `jsx(tag, props)` and `jsxs(tag, props)` calls to `<tag>` JSX elements. Handles rolldown's template literal tag names (`` `div` `` instead of `"div"`).
- **Babel helper removal** — Removes `_typeof`, `_defineProperty`, and similar Babel inline helpers.
- **Unused import pruning** — Drops `jsx`/`jsxs` named imports that become stale after JSX recovery.

## Output structure

```
output_refactored/
├── index-BpDs_mxk.jsx           ← app entry; contains createRoot and lazy() route declarations
├── Home-J6pOhRyO.jsx            ← route component chunks, one per lazy-loaded route
├── Post-Ck0sG56A.jsx
├── AdminDashboard-B6nYOFBr.jsx
└── …
```

Output files use the original Vite chunk basenames, so dynamic imports within the entry chunk (for example `lazy(() => import('./Home-J6pOhRyO.js'))`) resolve correctly.

## Build check

After writing the refactored files, the tool automatically scaffolds a minimal Vite project in the output directory and runs `vite build` to confirm the output compiles:

```
[i] Setting up Vite build check in output_refactored/ (entry: ./index-BpDs_mxk.jsx)
[i] Installing dependencies...
[i] Running Vite build check...
✓ 42 modules transformed.
[✓] Vite build check passed
```

If the build fails, the error output from Vite is printed directly above the failure message.

## Example

Build a Vite app, download its chunks, map them, then refactor:

```bash
# Download chunks
js-recon lazyload -u https://example.com

# Map (generates mapped.json)
js-recon map -t react

# Refactor
js-recon refactor -t react-vite -o output_vite_refactored
```

Inspect a route component:

```bash
cat output_vite_refactored/Home-J6pOhRyO.jsx
```

Expected output: clean JSX with canonical React imports — no interop wrappers, no vendor chunk references.

## Remote library stripping

When processing an app with non-vendor chunks that contain inlined library code, the tool can strip those chunks automatically using the remote CS-MAST-S signature dataset.

By default the tool fetches signatures from the `react/vite/large-0.1.8` bucket prefix. Use `--remote-collisions` to supply an explicit path:

```bash
js-recon refactor -t react-vite --remote-collisions react/vite/large-0.1.8 -o output_refactored
```

If the path does not exist in the dataset the tool exits with [code 25](../../exit_codes.md). Use `--no-remote` to disable remote fetching entirely.

Signatures are cached under `~/.js-recon/refactor/signature_cache/` so subsequent runs are fast.

## Notes

- Vendor chunks and the rolldown-runtime chunk are not written to the output directory — they contain no application code.
- Template literal strings in JSX props and children are preserved as-is — rolldown uses `` `string` `` instead of `"string"` in many places and the refactor maintains this.
