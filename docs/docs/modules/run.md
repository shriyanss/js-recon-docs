---
sidebar_position: 1
---

# Run command

The `run` command is a powerful feature that automates most of the JavaScript reconnaissance workflow by executing a series of modules in a predefined order. This command is ideal for users who want to perform a basic analysis of a target without running each module individually.

## Workflow

The `run` command executes a series of modules in sequence, but the exact steps depend on the framework detected during the initial lazyload pass. Next.js gets the full multi-pass pipeline described below; React, Vue.js, Nuxt.js, Svelte/Astro, and Angular each get a shorter `lazyload → map → analyze → report` pipeline; and any target where none of these frameworks is detected (including generic/unrecognized targets) stops after `lazyload`.

### Next.js

1.  **Lazy Load (Initial)**: Downloads the initial set of JavaScript files from the target URL.
1.  **Strings (Initial)**: Extracts strings, URLs, and paths from the downloaded JavaScript files.
1.  **Lazy Load (Subsequent Requests)**: Downloads additional JavaScript files discovered from the extracted URLs and paths.
1.  **Strings (Final)**: Performs another round of string extraction on the newly downloaded files to find more endpoints, secrets, and other valuable information.
1.  **Lazy Load (Re-pass)**: Re-runs subsequent-request crawling with the freshly extracted paths. The first crawl can only use paths that were visible in the initial chunks; dynamic-route paths like `/post/1` are typically only discovered after the first crawl + strings extraction, so this re-pass picks up the chunks for those routes.
1.  **Strings (Re-pass)**: Final strings extraction across all chunks (initial + both crawl passes) so any new endpoints from the freshly fetched code are also indexed.
1.  **Map**: Maps all the functions and their relationships within the JavaScript files to provide a clear overview of the application's structure.
1.  **Endpoints**: Analyzes the JS files and `mapped.json` to identify and list all client-side endpoints.
1.  **Analyze**: Runs the analyze module to check the code against the rules.
1.  **Report**: Generates a report based on the results of the analyze module.
1.  **Refactor** _(optional)_: Detects the bundler via CS-MAST-S signature matching and decompiles the bundle into readable ES modules. See [Refactor integration](#refactor-integration).

### React

1.  **Lazy Load**: Downloads the JavaScript files from the target URL.
1.  **Map**: Maps functions and API calls; `fetch()` calls are resolved with the same taint-flow analysis used for Next.js.
1.  **Analyze**: Runs the analyze module to check the code against the rules.
1.  **Report**: Generates a report based on the results of the analyze module.
1.  **Refactor** _(optional)_: Detects the bundler (webpack or Vite) via CS-MAST-S signature matching and decompiles the bundle. See [Refactor integration](#refactor-integration).

There's no separate strings/subsequent-request pass for React — a single lazyload covers the bundle, and endpoint extraction isn't yet implemented, so `report` receives an empty endpoints list.

### Vue.js

1.  **Lazy Load**: Downloads the JavaScript files from the target URL.
1.  **Map**: Scans the whole download directory for chunks, since Vue builds often spread files across multiple asset hosts, and maps functions and API calls.
1.  **Analyze**: Runs the analyze module to check the code against the rules.
1.  **Report**: Generates a report based on the results of the analyze module. Endpoint extraction isn't implemented for Vue yet, so `report` receives an empty endpoints list.
1.  **Refactor** _(optional)_: Attempts bundler detection (webpack or Vite) via CS-MAST-S signature matching. No signature data is available for Vue yet, so this step is currently skipped with a warning. See [Refactor integration](#refactor-integration).

### Nuxt.js

Nuxt.js is built on Vue.js, so it follows the exact same `lazyload → map → analyze → report` pipeline as Vue.js above (the map and analyze steps run using Vue's chunk-parsing logic). Refactor bundler detection is attempted the same way and is currently skipped for the same reason — no signature data yet.

### Svelte/Astro

1.  **Lazy Load**: Downloads the JavaScript files from the target URL.
1.  **Map**: Decodes Vite production chunks and maps functions and API calls; `fetch()` and Axios calls are resolved with the same taint-flow analysis used for Vue.js.
1.  **Analyze**: Runs the analyze module to check the code against the rules.
1.  **Report**: Generates a report based on the results of the analyze module. Endpoint extraction isn't implemented for Svelte/Astro yet, so `report` receives an empty endpoints list.

There's no refactor step for Svelte/Astro — CS-MAST-S bundler detection doesn't apply to this framework.

### Angular

1.  **Lazy Load**: Downloads the Angular CLI (esbuild) bundle chunks from the target URL.
1.  **Map**: Scans all downloaded chunks and maps functions and API calls; `HttpClient` calls (`.get()`, `.post()`, etc.) and native `fetch()` calls are both resolved.
1.  **Analyze**: Runs the analyze module, including the Angular-specific rule that flags `bypassSecurityTrust*` (DomSanitizer bypass) calls.
1.  **Report**: Generates a report based on the results of the analyze module. Endpoint extraction isn't implemented for Angular yet, so `report` receives an empty endpoints list.

There's no refactor step for Angular — CS-MAST-S bundler detection doesn't apply to this framework.

### Generic / no recognized framework

If lazyload can't confirm any of the six frameworks above, it still downloads what it can: JS referenced by `<script>`/`<link rel="modulepreload">` tags on the initial page, plus a recursive crawl of the site's own pages to find JS the landing page alone doesn't reference. See [Lazyload — Generic extraction](./lazyload.md#generic-extraction-no-framework-detected).

`run` stops after this lazyload step — `map`, `endpoints`, `analyze`, `report`, and `refactor` all depend on a recognized framework's bundle structure, so they're skipped. In single-URL mode `run` prints an error and exits; in batch mode it skips that target and continues with the next URL in the list.

## Usage

```bash
js-recon run -u <url/file> [options]
```

### Required arguments

- `-u, --url <url/file>`: The target URL or a file containing a list of URLs (one per line).

### Options

| Option                                | Alias    | Description                                                                                                                                                                                                                                                                                                   | Default              | Required |
| ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------- |
| `--url <url>`                         | `-u`     | Target URL                                                                                                                                                                                                                                                                                                    |                      | Yes      |
| `--output <directory>`                | `-o`     | Output directory                                                                                                                                                                                                                                                                                              | `output`             | No       |
| `--strict-scope`                      |          | Download JS files from only the input URL domain                                                                                                                                                                                                                                                              | `false`              | No       |
| `--scope <scope>`                     | `-s`     | Download JS files from specific domains (comma-separated)                                                                                                                                                                                                                                                     | `*`                  | No       |
| `--threads <threads>`                 | `-t`     | Number of threads to use                                                                                                                                                                                                                                                                                      | `1`                  | No       |
| `--rules <file/dir>`                  | `-r`     | Rules file or directory (passed to analyze module)                                                                                                                                                                                                                                                            |                      | No       |
| `--disable-rules-version-check`       |          | Skip the GitHub rules version check and use cached rules as-is (passed to analyze module)                                                                                                                                                                                                                     | `false`              | No       |
| `--command <command>`                 | `-c`     | Run an interactive-mode command non-interactively, forwarded to the map step. Repeatable, and a single value can chain commands with `&&` (for example, `-c "list fetch && esquery * fetch"`).                                                                                                                |                      | No       |
| `--proxy-config <file>`               |          | Proxy config file, generated via `js-recon proxy -i`. See [Proxy](./proxy.md).                                                                                                                                                                                                                                | `.proxy_config.json` | No       |
| `--ignore-proxy-env`                  |          | Skip `JS_RECON_*` proxy environment variables during resolution                                                                                                                                                                                                                                               | `false`              | No       |
| `--cache-file <file>`                 |          | File to store response cache                                                                                                                                                                                                                                                                                  | `.resp_cache.json`   | No       |
| `--disable-cache`                     |          | Disable response caching                                                                                                                                                                                                                                                                                      | `false`              | No       |
| `--cache-only`                        |          | Only use the response cache; never make network requests. See [Load command](./load.md).                                                                                                                                                                                                                      | `false`              | No       |
| `--yes`                               | `-y`     | Auto-approve executing JS code from the target                                                                                                                                                                                                                                                                | `false`              | No       |
| `--secrets`                           |          | Scan for secrets                                                                                                                                                                                                                                                                                              | `false`              | No       |
| `--trufflehog`                        |          | Run TruffleHog secret scanner on the output directory (requires TruffleHog to be installed). Runs at the strings steps alongside `--secrets`.                                                                                                                                                                 | `false`              | No       |
| `--sj`                                |          | Run `sj` (swagger-jacker) against the mapped OpenAPI spec at the report step (requires `sj` to be installed). See [sj (swagger-jacker) integration](#sj-swagger-jacker-integration).                                                                                                                          | `false`              | No       |
| `--sj-bin <path>`                     |          | Path/name of the `sj` binary.                                                                                                                                                                                                                                                                                 | `sj`                 | No       |
| `--sj-args <args>`                    |          | Extra arguments passed through to `sj automate` (e.g. auth headers via `-H`, or a target override via `-T`).                                                                                                                                                                                                  | (empty)              | No       |
| `--ai <options>`                      |          | Use AI to analyze the code (comma-separated; available: description)                                                                                                                                                                                                                                          |                      | No       |
| `--ai-threads <threads>`              |          | Number of threads to use for AI                                                                                                                                                                                                                                                                               | `5`                  | No       |
| `--ai-provider <provider>`            |          | Service provider to use for AI (available: openai, ollama)                                                                                                                                                                                                                                                    | `openai`             | No       |
| `--ai-endpoint <endpoint>`            |          | Endpoint to use for AI service (for Ollama, etc)                                                                                                                                                                                                                                                              |                      | No       |
| `--openai-api-key <key>`              |          | OpenAI API key                                                                                                                                                                                                                                                                                                |                      | No       |
| `--model <model>`                     |          | AI model to use                                                                                                                                                                                                                                                                                               | `gpt-4o-mini`        | No       |
| `--map-openapi-chunk-tag`             |          | Add chunk ID tag to OpenAPI spec for each request found (map module)                                                                                                                                                                                                                                          | `false`              | No       |
| `--no-graphql`                        | `--ngql` | Disable GraphQL operation extraction in the map step                                                                                                                                                                                                                                                          | enabled              | No       |
| `--timeout`                           |          | Request timeout in ms                                                                                                                                                                                                                                                                                         | `30000`              | No       |
| `--insecure`                          | `-k`     | Disable SSL certificate verification                                                                                                                                                                                                                                                                          | `false`              | No       |
| `--no-sandbox`                        |          | Disable browser sandbox                                                                                                                                                                                                                                                                                       | `false`              | No       |
| `--sourcemap-dir <directory>`         |          | Directory to write reconstructed source maps                                                                                                                                                                                                                                                                  | `extracted`          | No       |
| `--research`                          |          | Enable research mode                                                                                                                                                                                                                                                                                          | `false`              | No       |
| `--research-output <file>`            |          | Output file for research mode                                                                                                                                                                                                                                                                                 | `research.json`      | No       |
| `--max-iterations <iterations>`       |          | Maximum number of recursive crawl iterations                                                                                                                                                                                                                                                                  | `10`                 | No       |
| `--max-js-size <mb>`                  |          | Maximum JS file size in MB to parse (Vue only)                                                                                                                                                                                                                                                                | `2`                  | No       |
| `--lazyload-timeout <minutes>`        |          | Hard timeout for each lazyload step in minutes. The step stops and the pipeline continues after this many minutes. Use `0` to disable.                                                                                                                                                                        | `30`                 | No       |
| `--max-heap <mb>`                     |          | Cap the V8 heap in MB before any pipeline work starts. `0` sets the limit to 100% of available RAM (`os.totalmem()`); any positive integer sets an explicit ceiling. Useful on memory-constrained hosts and containers to prevent SIGSEGV (exit 139) in the map step.                                         | `0`                  | No       |
| `--max-pages <pages>`                 |          | Maximum number of HTML pages the Next.js crawler (or the generic tech recursive page crawl) will visit across all recursive passes. `0` disables the limit. Prevents memory exhaustion on event-heavy sites with large link graphs. See [Lazyload — page visit cap](./lazyload.md#nextjs-discovery-pipeline). | `200`                | No       |
| `--max-redirects <n>`                 |          | Maximum redirects to follow when resolving the default crawl scope for generic tech. See [Lazyload — Generic extraction](./lazyload.md#generic-extraction-no-framework-detected).                                                                                                                             | `20`                 | No       |
| `--strings`                           |          | Enable strings-based recursive JS discovery for generic tech. See [Lazyload — Generic extraction](./lazyload.md#generic-extraction-no-framework-detected).                                                                                                                                                    | `false`              | No       |
| `--strings-max-iterations <n>`        |          | Maximum recursive strings-discovery passes for generic tech. `0` runs until a pass finds nothing new, with no cap.                                                                                                                                                                                            | `5`                  | No       |
| `--stagnation-timein <mins>`          |          | Minutes to wait before generic-tech content stagnation detection begins monitoring. `0` disables the feature. Must not exceed `--lazyload-timeout` (exit code 27 otherwise). See [Lazyload — Generic extraction](./lazyload.md#generic-extraction-no-framework-detected).                                     | `30`                 | No       |
| `--stagnation-percentage <percent>`   |          | Percentage of all discovered generic-tech JS files (by content hash) that must share one hash to be flagged as stagnation.                                                                                                                                                                                    | `80`                 | No       |
| `--stagnation-monitor <mins>`         |          | Re-check interval for generic-tech stagnation detection once armed; also the debounce window used to confirm stagnation before stopping.                                                                                                                                                                      | `1`                  | No       |
| `--include-methods <methods>`         |          | Comma-separated list of lazyload method names to run (whitelist). Only these methods will execute in every lazyload pass; all others are skipped. Use `--list-methods` to see valid names. See [Lazyload Methods](./lazyload/lazyload-methods.md).                                                            |                      | No       |
| `--exclude-methods <methods>`         |          | Comma-separated list of lazyload method names to skip (blacklist). All methods except these will run in every lazyload pass. Use `--list-methods` to see valid names. See [Lazyload Methods](./lazyload/lazyload-methods.md).                                                                                 |                      | No       |
| `--list-methods [framework]`          |          | Print all available lazyload method names grouped by framework and exit. Optionally filter by framework (`next_js`, `vue`, `nuxt_js`, `svelte`, `angular`, `react`). Does not require `-u`.                                                                                                                   |                      | No       |
| `--cs-mast-tech-detect-threshold <n>` |          | Minimum number of CS-MAST-S signature matches required to detect the bundler and trigger the automatic refactor step. Pass `0` to disable refactor. See [Refactor integration](#refactor-integration).                                                                                                        | `50`                 | No       |
| `--disable-refactor`                  |          | Skip the automatic bundler-detection and refactor step entirely, without needing to touch `--cs-mast-tech-detect-threshold`. See [Refactor integration](#refactor-integration).                                                                                                                               | `false`              | No       |
| `--verbose`                           |          | Show detailed file write error messages during the lazyload step (e.g. when a downloaded JS chunk fails to write to disk). Suppressed by default to reduce terminal noise.                                                                                                                                    | `false`              | No       |
| `-h, --help`                          |          | display help for command                                                                                                                                                                                                                                                                                      |                      | No       |

## Ctrl-C / Interrupt handling

Pressing Ctrl-C while `run` is active shows an interactive menu instead of immediately killing the process:

```
[!] Interrupted. What would you like to do?
  1. Skip the current step
  2. Skip the current target and move to the next   (batch mode only)
  3. Exit                                            (or "2. Exit" in single-URL mode)
```

| Choice                             | Effect                                                                                                                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 — Skip step**                  | The current pipeline step (lazyload, strings, map, etc.) is abandoned and the next step starts immediately. The skipped step may still finish in the background, but its result is not waited for. |
| **2 — Skip target** _(batch only)_ | Remaining steps for the current target are abandoned and `run` moves to the next URL in the list.                                                                                                  |
| **Last — Exit**                    | The process exits cleanly (`process.exit(0)`).                                                                                                                                                     |

Pressing Ctrl-C a second time during the menu prompt falls through to the OS default (immediate termination).

The menu reliably waits for your choice before the process continues or exits — it no longer races with the browser step that was interrupted.

## Refactor integration

After the report step, `run` automatically attempts to decompile the target's JavaScript bundle using the [`refactor`](./refactor.md) module. It does this without any extra flags by detecting the bundler via CS-MAST-S signature matching.

### How bundler detection works

1. `run` loads the `mapped.json` produced by the map step and generates CS-MAST-S structural signatures for all chunks.
2. It fetches a random sample of `collisions.json` files from the `shriyanss/cs-mast-s-dataset` HuggingFace bucket — the same dataset used by `refactor --remote-collisions`.
3. It counts how many bucket signatures appear in the bundle's signature set for each candidate tech (for example, `react-webpack` and `react-vite` for a React target).
4. The candidate with the most matches wins. If the winner's match count meets `--cs-mast-tech-detect-threshold` (default `50`), `refactor` runs with the detected tech identifier.

The sampled signatures are cached under `~/.js-recon/refactor/signature_cache/` with a 7-day TTL — the same cache used by the standalone `refactor` command.

### Output

Refactored files are written to:

- **Single-URL mode:** `refactored/` in the current working directory.
- **Batch mode:** `<workingDir>/refactored/` alongside `mapped.json` for each target.

Any existing `refactored/` directory is deleted before writing.

### Framework support

| Framework | Bundler detection            | Refactor available |
| --------- | ---------------------------- | ------------------ |
| React     | Yes (webpack + Vite)         | Yes                |
| Vue.js    | Pending (no bucket data yet) | No (skip)          |
| Nuxt.js   | Pending (no bucket data yet) | No (skip)          |
| Next.js   | Pending (no bucket data yet) | No (skip)          |
| Svelte    | Not applicable               | No                 |
| Angular   | Not applicable               | No                 |

When detection fails or the framework has no bucket data, `run` prints a yellow warning and continues to the next target without error.

### Disabling refactor

Pass `--disable-refactor` to skip bundler detection and the refactor step entirely — no signature sampling against the HuggingFace bucket, no `refactor` invocation. `run` prints `[!] Refactor step disabled via --disable-refactor, skipping.` in place of the usual refactor log lines and continues with the rest of the pipeline.

Passing `--cs-mast-tech-detect-threshold 0` has the same practical effect (no match count can ever meet a `0` threshold), but `--disable-refactor` is the clearer, dedicated way to opt out.

## sj (swagger-jacker) integration

Passing `--sj` runs [`sj`](https://github.com/BishopFox/sj) (BishopFox's swagger-jacker) against the mapped OpenAPI spec at the report step of the pipeline, the same way `--trufflehog` runs TruffleHog at the strings steps. `sj` actively probes each endpoint in the spec — unlike every other step in `run`, it sends live requests to the target, so use it deliberately.

`sj` must be installed separately; js-recon does not bundle it:

```bash
go install github.com/BishopFox/sj@latest
```

```bash
js-recon run -u https://example.com -y --sj
```

Use `--sj-args` to pass authentication headers or override the target host:

```bash
js-recon run -u https://example.com -y --sj --sj-args="-H 'Authorization: Bearer xyz' -T https://target.example.com"
```

`--sj-bin <path>` points at a non-default `sj` binary (a specific install location, or a version pinned outside `$PATH`).

`sj`'s own output file (`swagger-jacker-results.json`) is the artifact from this step — its findings are not merged into `analyze.json`, the SQLite database, or `report.html`.

## Global database (batch mode)

When `-u` points to a file of URLs, each domain still gets its own `<output>/<host>/js-recon.db` exactly as before. In addition, `run` now maintains one combined database at the root of the output directory:

```
output/
  domain1.com/js-recon.db
  domain2.com/js-recon.db
  js-recon.db   <- combined database for the whole batch
```

This lets you query findings, endpoints, and mapped chunks across every target in the batch without opening each per-domain database individually.

### Schema

The global database reuses the same four tables as the per-domain database (`mapped`, `mapped_openapi`, `endpoints`, `analysis_findings`), with two differences:

- Every table gains a **`domain`** column — the sanitized host used for that target's output directory (for example `example.com` or `example.com_8443` when a non-default port is in the URL). This doubles as a foreign key back to the corresponding `<output>/<domain>/` directory.
- Primary keys that were only unique within a single domain are widened so rows from different domains never collide or overwrite each other:
    - `mapped` gets a new autoincrement `globalId` primary key (the original per-bundle chunk `id` is kept as a plain column, since chunk IDs reset for every domain and aren't unique across a batch).
    - `mapped_openapi`'s primary key becomes `(domain, path, method)`.
    - `endpoints`'s primary key becomes `(domain, url)`.
    - `analysis_findings` gains an autoincrement `globalId` primary key.

### Behavior

- The global database is created once at the start of a batch run and updated after each target finishes its own `report` step — it accumulates across the whole batch rather than being replaced.
- If a target's pipeline stops before the `report` step (for example, an unsupported framework), that domain has no `js-recon.db` to merge and is skipped with a warning; the rest of the batch continues normally.
- This behavior is automatic in batch mode and requires no extra flags. Single-URL mode (`-u <url>`) is unaffected — there's only one domain, so no global database is created.

## Example

### Run all modules on target, scan for secrets, and generate AI descriptions

```bash
js-recon run -u https://example.com --secrets --ai description
```

This command will perform a full analysis on `https://example.com`, save the JavaScript files to the `output` directory, scan for secrets, and use AI to generate descriptions for the mapped functions.

### List available lazyload methods

Print all method names without supplying a target:

```bash
js-recon run --list-methods
```

Filter by framework:

```bash
js-recon run --list-methods next_js
```

### Skip a specific lazyload method

Run the full pipeline but skip the brute-force JS file discovery method in every lazyload pass:

```bash
js-recon run -u https://example.com -y --exclude-methods next_bruteForceJsFiles
```

### Run only specific lazyload methods

Run only the script-tag and build-manifest methods in every lazyload pass:

```bash
js-recon run -u https://example.com -y --include-methods next_GetJSScript,next_GetLazyResourcesBuildManifestJs
```
