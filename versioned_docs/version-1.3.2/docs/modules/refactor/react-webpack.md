---
sidebar_position: 1
---

# React (webpack) Refactor

The React webpack refactor (`-t react-webpack`) converts a webpack-bundled React application into a set of individual, human-readable ES module files. It is designed for bundles where all modules are packed into a single file under a numeric module map — the standard output produced by webpack 5 for React projects.

## Usage

```bash
js-recon refactor -t react-webpack [options]
```

See the [Refactor command reference](../refactor.md) for the full options table.

## How it works

A typical webpack React bundle wraps everything inside an immediately-invoked function expression (IIFE):

```javascript
(() => {
  "use strict";
  var e = {
    540: (module, exports, require) => { /* React */ },
    287: (module, exports, require) => { /* react-dom */ },
    848: (module, exports, require) => { /* react/jsx-runtime */ },
    // … more modules …
  };
  // webpack require helper
  function t(id) { … }
  // top-level bootstrap
  var r = t(540), l = t(338), a = t(848);
  function App() { … }
  createRoot(document.getElementById("root")).render(<App />);
})();
```

The refactor step processes this structure in two stages.

### Stage 1 — Module splitting

The numeric module map (`var e = { 540: fn, … }`) is identified and each entry is extracted into its own file named `<moduleId>.js`. For every module function the transform:

1. Converts `module.exports = require(N)` to `export * from "./N.js"` (transparent re-export).
2. Converts `exports.<prop> = <value>` assignments to named ES module exports (`export const`, `export function`, `export { … as … }`).
3. Hoists `var x = require(N)` declarations to `import * as x from "./N.js"` at the top of the file.
4. Replaces any remaining inline `require(N)` calls with the hoisted import identifier.
5. Strips the outer module function wrapper so the file is plain ES module code.

### Stage 2 — Entrypoint extraction (`index.js`)

Everything in the IIFE body that is **not** part of the numeric module map is written to `index.js`. Before writing, three additional passes clean up webpack-internal artifacts:

1. **Require-helper removal** — the webpack runtime function that resolves module IDs (recognisable by its `return (moduleMap[id](mod, mod.exports, fn), mod.exports)` return shape) is detected and dropped entirely.
2. **Top-level require hoisting** — statements like `var r = t(540), l = t(338)` are converted to `import * as r from "./540.js"` etc.
3. **Recursive require replacement** — any remaining `requireFn(N)` calls inside other functions in the file are replaced with the corresponding import identifier.

The result is that `index.js` contains only application logic — utility functions, root component definitions, and the `ReactDOM.render()` / `createRoot().render()` call — expressed in standard ES module syntax.

## Output structure

```
output_refactored/
├── index.js   ← IIFE entrypoint: bootstrap code, root component, render call
├── 20.js      ← individual webpack modules, one file per numeric module ID
├── 287.js
├── 338.js
├── 540.js
├── 848.js
└── …
```

The module files use `import`/`export` so they can be opened in any IDE with full cross-reference support, or piped into other static-analysis tools.

## Example

Running the full pipeline and then refactoring:

```bash
js-recon run -u https://example.com -y -k
js-recon refactor -t react-webpack
```

Inspect the entrypoint:

```bash
cat output_refactored/index.js
```

Expected to see clean ES module imports at the top, followed by the application's own functions and the `render()` call — no webpack runtime code.

## Notes

- The refactor output is intended for **human review** only. Do not feed it back into the `map` or `analyze` pipeline; those steps require the original downloaded chunks.
- Modules with more than three parameters or alphanumeric string module IDs are skipped with a warning. These shapes are not yet researched.
- Prettier formatting is applied automatically to all output files.
- Vite/Rollup bundles do not use the numeric module map pattern. If zero modules are found, the bundle is likely not webpack-based.
