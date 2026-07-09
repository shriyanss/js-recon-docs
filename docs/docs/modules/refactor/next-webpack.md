---
sidebar_position: 3
---

# Next.js (webpack) Refactor

The `-t next-webpack` technology refactors Next.js webpack bundle chunks into readable ES module files. It handles the minified module wrapper format emitted by Next.js when using the webpack bundler and recovers named exports, default exports, and import relationships.

## Module format

Next.js webpack bundles store each module as a named function assignment in the chunk. In `mapped.json`, each entry looks like:

```
func_3899 = (module, exports, require) => {
  "use strict";
  // module body
}
```

In the minified bundle, the parameter names are shortened to single letters (`e`, `t`, `r`):

```
func_3899=(e,t,r)=>{"use strict";r.d(t,{foo:()=>bar});var bar=42}
```

The `mapped.json` produced by the `map` command stores the full `func_NNN = ...` assignment. The refactor tool parses the assignment expression and extracts the arrow function for transformation.

**Parameter order** (webpack, not turbopack):

| Position    | Minified | Role                                                      |
| ----------- | -------- | --------------------------------------------------------- |
| `params[0]` | `e`      | `module` — module object; `e.exports = X` for CJS exports |
| `params[1]` | `t`      | `exports` — export target for ODP / `require.d`           |
| `params[2]` | `r`      | `require` — import function; `r(N)` imports module N      |

Module arity varies:

| Params | Frequency | Notes                                            |
| ------ | --------- | ------------------------------------------------ |
| 3      | ~67%      | Full module, exports + require                   |
| 2      | ~29%      | Module + exports only (no cross-module requires) |
| 1      | ~2%       | Module only (CJS-only modules)                   |
| 0      | ~2%       | Empty modules — skipped                          |

## Transform passes

### Pass 1 — export collection and boilerplate removal

The pass scans each top-level statement and sequence sub-expression to:

**Collect named exports** from:

- `Object.defineProperty(exports, "name", { get: () => localVar })` — ODP named export
- `require.d(exports, { name: () => localVar, ... })` — webpack `require.d` batch
- `for (var k in mapVar) Object.defineProperty(exports, k, ...)` — for-in loop batch

**Collect default exports** from:

- `module.exports = VALUE` — becomes `export default VALUE`
- `module.exports = require(N)` — becomes `export * from './N.js'`

**Collect side-effect imports** from:

- `require(N);` standalone statement — becomes `import './N.js'`
- `require(N)` inside a sequence expression — becomes `import './N.js'`

**Drop boilerplate**:

- `Object.defineProperty(exports, "__esModule", ...)` — interop marker, dropped
- `require.r(exports)` — ES module marker, dropped
- `("function"==typeof exports.default || ...) && (exports.default.__esModule) && (module.exports = exports.default)` — CJS interop copy-back, dropped
- `"use strict"` directive expressions — dropped

### Pass 2 — require hoisting

`var x = require(N)` declarators are removed from the function body and replaced with `import * as x from './N.js'` at the top of the output file.

### Pass 3 — inline require replacement

Any remaining `require(N)` call-sites in the body (inside function expressions, conditionals, etc.) are replaced with the hoisted namespace identifier. If a module ID has not been seen before, a new `import * as _jsr_module_N from './N.js'` is synthesised.

### Passes E / F / G / H — cleanup

Shared with the turbopack transform:

- **E**: Collapses Babel `_slicedToArray` / `_arrayLikeToArray` expansions back into array destructure patterns.
- **F**: Recovers JSX — converts `jsx(tag, props)` / `jsxs(tag, props)` / `jsxDEV(tag, props)` calls into JSX element syntax.
- **G**: Strips Babel runtime helpers (`_typeof`, `_defineProperty`, `_objectSpread2`, etc.) that are injected into each chunk at compile time.
- **H**: Prunes named import specifiers that are no longer referenced after JSX recovery. Side-effect imports are always kept.

## Example

**Input** (from `mapped.json`):

```js
func_20 = (e, t, r) => {
    "use strict";
    var n = r(603);
    var u = r(2697);
    Object.defineProperty(t, "__esModule", { value: !0 });
    Object.defineProperty(t, "normalizePathTrailingSlash", {
        enumerable: !0,
        get: function () {
            return a;
        },
    });
    function a(e) {
        if (!e.startsWith("/")) return e;
        var { pathname: t, query: r, hash: a } = (0, u.parsePath)(e);
        return `${(0, n.removeTrailingSlash)(t)}${r}${a}`;
    }
    ("function" == typeof t.default ||
        ("object" == typeof t.default && null !== t.default)) &&
        void 0 === t.default.__esModule &&
        (Object.defineProperty(t.default, "__esModule", { value: !0 }),
        Object.assign(t.default, t),
        (e.exports = t.default));
};
```

**Output** (`20.js`):

```js
import * as n from "./603.js";
import * as u from "./2697.js";

let a = (e) => {
    if (!e.startsWith("/")) return e;
    let { pathname: t, query: r, hash: a } = (0, u.parsePath)(e);
    return `${(0, n.removeTrailingSlash)(t)}${r}${a}`;
};

export { a as normalizePathTrailingSlash };
```

## Usage

```bash
js-recon refactor -m mapped.json -t next-webpack -o output_refactored
```

## Output

One `.js` file per module ID, formatted with Prettier. Empty modules (0-param functions `()=>{}`) are skipped. Each file uses ES module syntax and can be opened in an IDE or passed to static analysis tools.

## Remote signatures (default)

By default, when running `refactor -t next-webpack` without `--collisions`, the tool automatically downloads CS-MAST signature data from the HuggingFace bucket [`shriyanss/cs-mast-s-dataset`](https://huggingface.co/buckets/shriyanss/cs-mast-s-dataset) and uses it to strip Next.js framework modules from the output — no local baseline clone required.

### How it works

1. The tool maps the tech flag (`next-webpack`) to a bucket prefix (`next/webpack/large-0.1.8`).
2. It validates that the prefix contains `sample_size` and `technology` metadata files, and that the technology matches.
3. It fetches (or loads from cache) the list of `collisions.json` files under that prefix.
4. For each file whose path contains the configured scat directory (`lit-decl-loop-cond`), it downloads and caches the file.
5. After applying the signature quality filter, it intersects all loaded signature sets. Signatures surviving the intersection appeared in every feature app's baseline, making them definitionally framework/library code.
6. The resulting signature set is used to classify and strip framework modules before writing output files.

On a fresh run the tool prints download progress; subsequent runs use the local cache silently.

### Library module classification

For each Next.js webpack module captured from `mapped.json`:

1. The module's function body is serialised to source with `@babel/generator`.
2. The body is hashed with `cs_mast_init({ scat: ["lit","decl","loop","cond"], … })`, producing a signature for every actively hashed sub-tree.
3. The fraction of sub-tree signatures that match the remote baseline is computed.
4. If that fraction is at or above the 51% classification threshold, the module is flagged as framework/library code.
5. Library-flagged modules are logged (`[-] Module N matches library baseline — skipping`) and not written to disk. Application-specific modules are written normally.

The 51% threshold ensures that modules which are almost entirely Next.js framework code (close to 100% matching sub-trees) are correctly classified, while modules that happen to share only a small number of common patterns with the baseline are left untouched.

### Cache layout

```
~/.js-recon/refactor/
├── config.json
├── cs-mast-s-list-cache.json          ← file list cache (7-day TTL)
└── signature_cache/
    └── next/
        └── webpack/
            └── large-0.1.8/
                └── <feature-app>/
                    └── lit-decl-loop-cond/
                        ├── collisions.json
                        └── cached_at.txt      ← unix timestamp; 7-day TTL
```

Both cache layers have a 7-day TTL and are refreshed automatically when stale.

### Signature quality (`--sq / --signature-quality`)

Each bucket prefix includes a `sample_size` file. The quality of a signature record is computed as:

```
quality = (count / sample_size) * 100
```

A signature is included only when its quality meets the threshold (default 100%). At 100% a signature must appear in **every** file in the sample — only framework code shared across all feature apps survives.

Lowering `--sq` below 100 includes signatures that appeared in most-but-not-all apps, which may catch more library modules at the cost of a small false-positive risk.

```bash
# Default (strictest — only universally shared signatures)
js-recon refactor -t next-webpack -o output_refactored

# More permissive — include signatures in ≥90% of the sample
js-recon refactor -t next-webpack --sq 90 -o output_refactored
```

### Scat category override (`--scat`)

The `--scat <categories>` flag overrides the CS-MAST scat category set used for both the remote signature download and the module classifier. The default is `lit,decl,loop,cond`.

```bash
# Use a minimal scat config (fastest, fewer signatures)
js-recon refactor -t next-webpack --scat lit

# Use a broader config
js-recon refactor -t next-webpack --scat lit,id,decl,loop,cond
```

The value is a comma-separated list from: `lit`, `id`, `op`, `decl`, `loop`, `cond`, `name`, `val`, `op_name`. Categories are automatically mapped to the bucket directory name in canonical order.

For guidance on which combination to use, see [Choosing scat categories](./choosing-scat.md).

### Remote dataset path override (`--remote-collisions`)

Use `--remote-collisions` to supply an explicit HuggingFace bucket path instead of the automatic mapping:

```bash
js-recon refactor -t next-webpack --remote-collisions next/webpack/large-0.1.8 -o output_refactored
```

If the path does not exist in the dataset the tool exits with [code 25](../../exit_codes.md).

### Cache control flags

| Flag                  | Effect                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `--refresh-cache`     | Force-refresh the file list cache regardless of age                                                  |
| `--skip-cache-checks` | Skip all age/staleness checks; use whatever is cached                                                |
| `--no-remote`         | Disable remote fetch entirely; runs without library stripping unless `--collisions` is also provided |

```bash
# Force a fresh file list from the remote dataset
js-recon refactor -t next-webpack --refresh-cache -o output_refactored

# Air-gapped / offline — use cache as-is, no HTTP requests
js-recon refactor -t next-webpack --skip-cache-checks -o output_refactored

# Disable remote entirely
js-recon refactor -t next-webpack --no-remote -o output_refactored
```

### Local baseline (`--collisions`)

As an alternative to the remote HuggingFace dataset, you can pass a local `--collisions` path. This accepts:

- A direct `collisions.json` file path
- A standard baseline directory (resolved via `<dir>/baselines/next-webpack/lit-decl-loop-cond/collisions.json`)
- A per-feature results directory with the layout `<dir>/<feature>/lit-decl-loop-cond/collisions.json`

```bash
js-recon refactor -t next-webpack --collisions ./js-recon-cs-mast-s -o output_refactored
```

---

## Notes

- The `mapped.json` must be generated from a Next.js webpack bundle (not turbopack). Use `-t next-turbopack` for turbopack bundles.
- Modules that export only via the CJS interop copy-back pattern (`module.exports = exports.default`) produce empty files and are skipped — the importer should import from the re-exported module directly.
- 1-param modules (module-only, no exports/require param) preserve their entire body as-is, since no standard export pattern can be detected.
