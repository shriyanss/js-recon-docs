---
sidebar_position: 2
---

# Lazyload command

The `lazyload` command is used to download JavaScript files from a given URL or a list of URLs. It simulates various techniques to discover and fetch JS files that are loaded dynamically.

## Usage

```bash
js-recon lazyload -u <url/file> [options]
```

## Options

| Option                          | Alias | Description                                                                                                                                                                              | Default                    | Required |
| ------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------- |
| `--url <url/file>`              | `-u`  | Target URL or a file containing a list of URLs (one per line).                                                                                                                           |                            | Yes      |
| `--output <directory>`          | `-o`  | Output directory to save the downloaded JS files.                                                                                                                                        | `output`                   | No       |
| `--strict-scope`                |       | Download JS files from only the input URL domain.                                                                                                                                        | `false`                    | No       |
| `--scope <scope>`               | `-s`  | Download JS files from specific domains (comma-separated). Use `*` for all domains.                                                                                                      | `*`                        | No       |
| `--threads <threads>`           | `-t`  | Number of threads to use for downloading.                                                                                                                                                | `1`                        | No       |
| `--subsequent-requests`         |       | Download JS files from subsequent requests (Next.js only).                                                                                                                               | `false`                    | No       |
| `--urls-file <file>`            |       | Input JSON file containing URLs (for `--subsequent-requests`)                                                                                                                            | `extracted_urls.json`      | No       |
| `--api-gateway`                 |       | Generate requests using API Gateway for IP rotation.                                                                                                                                     | `false`                    | No       |
| `--api-gateway-config <file>`   |       | API Gateway config file.                                                                                                                                                                 | `.api_gateway_config.json` | No       |
| `--cache-file <file>`           |       | File to contain response cache.                                                                                                                                                          | `.resp_cache.json`         | No       |
| `--disable-cache`               |       | Disable response caching.                                                                                                                                                                | `false`                    | No       |
| `--cache-only`                  |       | Only use the response cache; never make network requests. See [Load command](./load.md).                                                                                                 | `false`                    | No       |
| `--yes`                         | `-y`  | Auto-approve executing JS code from the target.                                                                                                                                          | `false`                    | No       |
| `--timeout`                     |       | Request timeout in ms                                                                                                                                                                    | `30000`                    | No       |
| `--insecure`                    | `-k`  | Disable SSL certificate verification.                                                                                                                                                    | `false`                    | No       |
| `--no-sandbox`                  |       | Disable browser sandbox.                                                                                                                                                                 | `false`                    | No       |
| `--build-id`                    |       | Get the buildId from the Next.js app.                                                                                                                                                    | `false`                    | No       |
| `--sourcemap-dir <directory>`   |       | Directory to write reconstructed source maps.                                                                                                                                            | `extracted`                | No       |
| `--research`                    |       | Enable research mode.                                                                                                                                                                    | `false`                    | No       |
| `--research-output <file>`      |       | Output file for research mode.                                                                                                                                                           | `research.json`            | No       |
| `--max-iterations <iterations>` |       | Maximum number of recursive crawl iterations.                                                                                                                                            | `10`                       | No       |
| `--max-js-size <mb>`            |       | Maximum JS file size in MB to parse (Vue only).                                                                                                                                          | `2`                        | No       |
| `--lazyload-timeout <minutes>`  |       | Hard timeout for the lazyload module. The module stops and the pipeline continues after this many minutes. Use `0` to disable.                                                           | `30`                       | No       |
| `--max-pages <pages>`           |       | Maximum number of HTML pages the Next.js crawler will visit across all recursive passes. `0` disables the limit. Prevents memory exhaustion on event-heavy sites with large link graphs. | `200`                      | No       |
| `--include-methods <methods>`   |       | Comma-separated list of method names to run (whitelist). Only these methods will execute; all others are skipped. Use `--list-methods` to see valid names. See [Lazyload Methods](./lazyload-methods.md). |  | No       |
| `--exclude-methods <methods>`   |       | Comma-separated list of method names to skip (blacklist). All methods except these will run. Use `--list-methods` to see valid names. See [Lazyload Methods](./lazyload-methods.md). |  | No       |
| `--list-methods [framework]`    |       | Print all available method names grouped by framework and exit. Optionally provide a framework name (`next_js`, `vue`, `nuxt_js`, `svelte`, `angular`, `react`) to filter the output. |  | No       |

## How it works

### Framework detection

Before downloading any files, the tool auto-detects which JavaScript framework the target uses. Detection runs in this priority order and stops on the first match:

1. **Next.js** — any HTML element with a `src`, `srcset`, or `imageSrcSet` attribute containing `/_next/`
2. **Vue.js** — any element with a `data-v-*` or `data-vue-*` attribute; or `__vue` found inside fetched script content
3. **Nuxt.js** — sub-check after Vue detection: any `src`/`href` attribute containing `/_nuxt`
4. **Svelte** — SvelteKit-specific attribute markers or `__svelte_*` in bundled code
5. **Angular** — `ng-*` attributes or Angular-specific markers in bundled code
6. **React** — markers such as `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`, `__REACT_DEVTOOLS_GLOBAL_HOOK__`, `react-jsx-runtime.production`, or `react-dom.production` in inline scripts or fetched assets
7. **Fallback** — if nothing matches, only the JS files present in the initial page load are downloaded

Detection uses two sources: the raw HTTP response (fast) and a Puppeteer-rendered page (catches client-side-only markers, after a 2-second settle delay). In `--cache-only` mode, the browser step is skipped.

### Next.js discovery pipeline

Next.js receives the most comprehensive discovery. The crawler runs in two phases.

**Initial phase** (run once):

- Parse `<script src>` tags and inline `static/chunks/...` references on the landing page
- Extract `<a href>` links on the landing page for page-URL seeding
- Execute the webpack runtime's chunk-loading function in a sandbox to enumerate all chunk IDs (requires `--yes` to auto-confirm, or manual confirmation per run)
- Parse `_buildManifest.js` AST for `static/chunks/` string references
- Optionally, if `--subsequent-requests` is set: make RSC (`RSC: 1` header) and plain HTML requests to all discovered paths to find dynamically loaded chunks

**Recursive phase** (repeated until convergence or `--max-iterations`):

- Detect `Promise.all([...].map(...))` patterns in newly downloaded chunks to extract additional chunk IDs
- Parse `layout-*.js` files for `href` object properties; visit discovered routes and extract their script tags
- Re-run `<script src>` and `<a href>` extraction on each newly discovered page URL
- Stop when a full pass yields zero new URLs (convergence), the iteration cap is reached, or the page visit cap (`--max-pages`) is reached

> **Page visit cap:** The crawler counts every HTML page it visits across all recursive passes and stops adding more pages to the queue once the cap is hit. This prevents memory exhaustion on event-heavy or listing sites where every page links to dozens more — without a cap, the queue can fan out to hundreds of pages and exhaust the container's available RAM. The default cap is 200 pages, which is sufficient for virtually all real Next.js apps. Set `--max-pages 0` to disable the cap entirely.

After all passes, `.map` is appended to every discovered `.js` URL and checked for a 200 response to find source maps.

> **Content-entropy deduplication:** When the crawler encounters a page URL whose pathname has already been visited, it fetches the new URL and compares its `<script src>` tags against every script set already recorded for that pathname. If the scripts are identical, the variant is skipped — it loads the same JS and would contribute nothing new. If the scripts differ (for example, a dynamically routed page that loads a unique chunk), the variant is visited and its script fingerprint is added. This lets the crawler correctly skip variants that differ only in a filter or selector parameter (for example, `/search?sort=asc` vs `/search?sort=desc`) while still visiting genuinely distinct parameterized routes (for example, different product or user pages that load unique chunks). The same fingerprint logic is applied in the script-tag subsequent-requests pass.

### `--yes` flag and JS execution

The webpack chunk-enumeration technique extracts a function from the webpack runtime and executes it locally in a Node.js sandbox with each discovered integer chunk ID as input. Before executing, the tool prompts you to inspect the extracted function and confirm. Pass `--yes` to skip the prompt — useful in automated pipelines, but verify you trust the target's JS first.

### Scope

| Flag                  | Behaviour                                          |
| --------------------- | -------------------------------------------------- |
| _(default)_ `*`       | Download JS from any domain                        |
| `--scope a.com,b.com` | Only download from `a.com` and `b.com`             |
| `--strict-scope`      | Only download from the exact host in the input URL |

Scoping matters most when JS assets are served from a CDN subdomain. The `run` command auto-detects CDN hosts and adjusts the map directory accordingly, but `lazyload` alone requires explicit scope configuration.

## Framework Support

Each framework is added to the tool after thorough research on the framework. New techniques are added when they are discovered. The following is an exhaustive list of frameworks that the `lazyload` module is compatible with:

- Next.js
- Vue
- Nuxt
- Angular
- React
- Svelte

Please note that some frameworks are supported better than others. Currently, the frameworks with the most supported techniques are Next.js and Vue.

## Examples

### List available methods

Print all available discovery method names:

```bash
js-recon lazyload --list-methods
```

Filter by framework:

```bash
js-recon lazyload --list-methods next_js
```

### Run only specific methods (whitelist)

Run only the script-tag extraction method for a Next.js target:

```bash
js-recon lazyload -u https://example.com -y --include-methods next_GetJSScript
```

### Skip specific methods (blacklist)

Skip the brute-force fallback and webpack analysis for a faster run:

```bash
js-recon lazyload -u https://example.com -y --exclude-methods next_bruteForceJsFiles,next_GetLazyResourcesWebpackJs
```

### Basic usage

Download all JavaScript files from a single URL:

```bash
js-recon lazyload -u https://example.com
```

### Setting scope

Download JavaScript files only from `example.com` and `cdn.example.com`:

```bash
js-recon lazyload -u https://example.com -s "example.com,cdn.example.com"
```

Using the `--strict-scope` will only download JS files from the URL provided. This will skip any files from the external CDN.

### Using API gateway

Use AWS API Gateway to rotate IP addresses while downloading:

```bash
js-recon lazyload -u https://example.com --api-gateway
```

Read the docs of [API Gateway](./api-gateway.md) for more information.
