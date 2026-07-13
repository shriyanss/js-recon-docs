---
sidebar_position: 3
---

# Next.js (Turbopack) Refactor

The Next.js Turbopack refactor (`-t next-turbopack`) converts a Next.js bundle produced by the Turbopack bundler into human-readable ES module files with recovered imports, exports, and JSX syntax. It handles both native Turbopack module formats and the webpack-style modules that coexist in Turbopack bundles.

## Usage

```bash
js-recon refactor -t next-turbopack [options]
```

See the [Refactor command reference](../refactor.md) for the full options table.

## How it works

A Next.js Turbopack build packs modules as named arrow-function entries inside a chunk. The refactor step identifies each module, strips the Turbopack runtime boilerplate, and writes one `.js` (or `.jsx`) file per module.

### Module formats

Turbopack bundles typically contain two kinds of module functions.

#### 3-param format (most modules)

```javascript
func_16624 = (runtime, module, exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: () => Component
  });
  var t = runtime.r(43476); // import
  var r = runtime.r(71645); // import
  function Component() { … }
};
```

The three parameters map to:

| Position    | Role    | Usage                                                                         |
| ----------- | ------- | ----------------------------------------------------------------------------- |
| `params[0]` | runtime | `runtime.r(N)` / `runtime.i(N)` — require/import another module by numeric ID |
| `params[1]` | module  | `module.exports = …` — CJS interop boilerplate                                |
| `params[2]` | exports | `Object.defineProperty(exports, "name", { get: fn })` — export registration   |

#### 1-param format (page component chunks)

Used for entry-point chunks that register a single default export:

```javascript
func_98765 = (runtime) => {
  runtime.i(43476);          // import module 43476 (side-effect only)
  runtime.s(["default", 0, () => Component]); // export default Component
  function Component() { … }
};
```

#### Webpack-style format

Some modules in a Turbopack bundle use the webpack-style signature `(module, exports, require) => { … }`, with `require.d(exports, { … })` for export registration. The refactor handles these automatically alongside Turbopack modules.

### Transform passes

Each module is processed through a fixed sequence of passes:

#### Pass 1 — Export collection and cleanup

Recognises and converts several export forms to ES module `export` statements:

- `Object.defineProperty(exports, "name", { get: () => local })` → `export { local as name }`
- Turbopack IIFE batch export patterns → individual named exports
- `require.d(exports, { name: () => local })` (webpack-style) → `export { local as name }`
- `runtime.s(["name", 0, fn])` (1-param format) → `export const name = fn` / `export default fn`

Also strips Turbopack boilerplate:

- `Object.defineProperty(exports, "__esModule", …)` — ES module interop marker
- `require.r(exports)` — webpack ES-module marker
- `module.exports = exports.default` — CJS interop assignment
- `"use strict"` expression statements

Side-effect imports (`runtime.r(N)` in a sequence expression with no binding) become `import "./N.js"`.

#### Pass 2 — Require hoisting

`var x = runtime.r(N)` and `var x = runtime.i(N)` declarators are removed from the function body and replaced with `import * as x from "./N.js"` at the top of the output file.

#### Pass 3 — Inline require replacement

Any remaining `runtime.r(N)` or `runtime.i(N)` call sites inside nested functions are replaced with the corresponding hoisted identifier (or a synthesised `_jsr_module_N` identifier, which also emits a new import statement).

#### Pass E — slicedToArray collapse

Babel's compiled array destructure expansion is collapsed back to clean destructuring:

```javascript
// Before
var _ref = _slicedToArray(expr, 2),
    a = _ref[0],
    b = _ref[1];
// After
var [a, b] = expr;
```

#### Pass F — JSX recovery

`jsx(tag, props)` / `jsxs(tag, props)` / `jsxDEV(tag, props)` calls are converted to JSX element syntax, including nested elements, spread props, and `children` arrays.

#### Pass G — Babel helper removal

Strips top-level Babel runtime helper declarations (`_typeof`, `_defineProperty`, `_slicedToArray`, `_objectSpread2`, etc.) that are inlined by Babel but add noise to the output.

#### Pass H — Prune unused imports

After JSX recovery, import specifiers for `jsx`, `jsxs`, and `Fragment` that are no longer referenced are removed.

## Output

Each module is written to `<output-dir>/<moduleId>.js` (or `.jsx` when JSX is recovered). Numeric IDs come from the `func_NNN` prefix in the bundle.

Modules that contain only CJS interop boilerplate (`module.exports = runtime.r(N)`) are skipped — they are transparent re-exports of another module, and the caller should import that module directly.

## Example output

Input chunk (abbreviated):

```javascript
func_16624 = (e, t, r) => {
    "use strict";
    Object.defineProperty(r, "__esModule", { value: true });
    Object.defineProperty(r, "default", {
        enumerable: true,
        get: () => PostPage,
    });
    var n = e.r(18566);
    var a = e.r(71645);
    function PostPage() {
        let id = (0, n.useParams)().id;
        let [post, setPost] = (0, a.useState)(null);
        return (0, jsxs)("main", {
            children: [(0, jsx)("h1", { children: post.title })],
        });
    }
};
```

Output (`16624.jsx`):

```javascript
import * as n from "./18566.js";
import * as a from "./71645.js";
export default (function PostPage() {
    let id = (0, n.useParams)().id;
    let [post, setPost] = (0, a.useState)(null);
    return (
        <main>
            <h1>{post.title}</h1>
        </main>
    );
});
```
