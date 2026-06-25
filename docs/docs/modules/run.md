---
sidebar_position: 1
---

# Run command

The `run` command is a powerful feature that automates most of the JavaScript reconnaissance workflow by executing a series of modules in a predefined order. This command is ideal for users who want to perform a basic analysis of a target without running each module individually.

## Workflow

The `run` command executes the following modules in sequence. The exact steps depend on the detected framework — Next.js runs the full pipeline described below, Vue.js, Nuxt.js, Svelte/Astro, and Angular run a shorter `lazyload → map → analyze → report` pipeline, and the tool will exit after lazyload for any unsupported framework.

1.  **Lazy Load (Initial)**: Downloads the initial set of JavaScript files from the target URL.
1.  **Strings (Initial)**: Extracts strings, URLs, and paths from the downloaded JavaScript files.
1.  **Lazy Load (Subsequent Requests - for Next.js)**: Downloads additional JavaScript files discovered from the extracted URLs and paths.
1.  **Strings (Final)**: Performs another round of string extraction on the newly downloaded files to find more endpoints, secrets, and other valuable information.
1.  **Lazy Load (Re-pass)**: Re-runs subsequent-request crawling with the freshly extracted paths. The first crawl can only use paths that were visible in the initial chunks; dynamic-route paths like `/post/1` are typically only discovered after the first crawl + strings extraction, so this re-pass picks up the chunks for those routes (for example, dynamic React pages whose code only ships when the URL is visited).
1.  **Strings (Re-pass)**: Final strings extraction across all chunks (initial + both crawl passes) so any new endpoints from the freshly fetched code are also indexed.
1.  **Map**: Maps all the functions and their relationships within the JavaScript files to provide a clear overview of the application's structure.
1.  **Endpoints**: Analyzes the JS files and `mapped.json` to identify and list all client-side endpoints.
1.  **Analyze**: Runs the analyze module to check the code against the rules.
1.  **Report**: Generates a report based on the results of the analyze module.

## Usage

```bash
js-recon run -u <url/file> [options]
```

### Required arguments

- `-u, --url <url/file>`: The target URL or a file containing a list of URLs (one per line).

### Options

| Option                          | Alias    | Description                                                                                                                                                                                                                                                           | Default                    | Required |
| ------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------- |
| `--url <url>`                   | `-u`     | Target URL                                                                                                                                                                                                                                                            |                            | Yes      |
| `--output <directory>`          | `-o`     | Output directory                                                                                                                                                                                                                                                      | `output`                   | No       |
| `--strict-scope`                |          | Download JS files from only the input URL domain                                                                                                                                                                                                                      | `false`                    | No       |
| `--scope <scope>`               | `-s`     | Download JS files from specific domains (comma-separated)                                                                                                                                                                                                             | `*`                        | No       |
| `--threads <threads>`           | `-t`     | Number of threads to use                                                                                                                                                                                                                                              | `1`                        | No       |
| `--rules <file/dir>`            | `-r`     | Rules file or directory (passed to analyze module)                                                                                                                                                                                                                    |                            | No       |
| `--command <command>`           | `-c`     | Run an interactive-mode command non-interactively, forwarded to the map step. Repeatable, and a single value can chain commands with `&&` (for example, `-c "list fetch && esquery * fetch"`).                                                                        |                            | No       |
| `--api-gateway`                 |          | Generate requests using API Gateway                                                                                                                                                                                                                                   | `false`                    | No       |
| `--api-gateway-config <file>`   |          | API Gateway config file                                                                                                                                                                                                                                               | `.api_gateway_config.json` | No       |
| `--cache-file <file>`           |          | File to store response cache                                                                                                                                                                                                                                          | `.resp_cache.json`         | No       |
| `--disable-cache`               |          | Disable response caching                                                                                                                                                                                                                                              | `false`                    | No       |
| `--cache-only`                  |          | Only use the response cache; never make network requests. See [Load command](./load.md).                                                                                                                                                                              | `false`                    | No       |
| `--yes`                         | `-y`     | Auto-approve executing JS code from the target                                                                                                                                                                                                                        | `false`                    | No       |
| `--secrets`                     |          | Scan for secrets                                                                                                                                                                                                                                                      | `false`                    | No       |
| `--ai <options>`                |          | Use AI to analyze the code (comma-separated; available: description)                                                                                                                                                                                                  |                            | No       |
| `--ai-threads <threads>`        |          | Number of threads to use for AI                                                                                                                                                                                                                                       | `5`                        | No       |
| `--ai-provider <provider>`      |          | Service provider to use for AI (available: openai, ollama)                                                                                                                                                                                                            | `openai`                   | No       |
| `--ai-endpoint <endpoint>`      |          | Endpoint to use for AI service (for Ollama, etc)                                                                                                                                                                                                                      |                            | No       |
| `--openai-api-key <key>`        |          | OpenAI API key                                                                                                                                                                                                                                                        |                            | No       |
| `--model <model>`               |          | AI model to use                                                                                                                                                                                                                                                       | `gpt-4o-mini`              | No       |
| `--map-openapi-chunk-tag`       |          | Add chunk ID tag to OpenAPI spec for each request found (map module)                                                                                                                                                                                                  | `false`                    | No       |
| `--no-graphql`                  | `--ngql` | Disable GraphQL operation extraction in the map step                                                                                                                                                                                                                  | enabled                    | No       |
| `--timeout`                     |          | Request timeout in ms                                                                                                                                                                                                                                                 | `30000`                    | No       |
| `--insecure`                    | `-k`     | Disable SSL certificate verification                                                                                                                                                                                                                                  | `false`                    | No       |
| `--no-sandbox`                  |          | Disable browser sandbox                                                                                                                                                                                                                                               | `false`                    | No       |
| `--sourcemap-dir <directory>`   |          | Directory to write reconstructed source maps                                                                                                                                                                                                                          | `extracted`                | No       |
| `--research`                    |          | Enable research mode                                                                                                                                                                                                                                                  | `false`                    | No       |
| `--research-output <file>`      |          | Output file for research mode                                                                                                                                                                                                                                         | `research.json`            | No       |
| `--max-iterations <iterations>` |          | Maximum number of recursive crawl iterations                                                                                                                                                                                                                          | `10`                       | No       |
| `--max-js-size <mb>`            |          | Maximum JS file size in MB to parse (Vue only)                                                                                                                                                                                                                        | `2`                        | No       |
| `--lazyload-timeout <minutes>`  |          | Hard timeout for each lazyload step in minutes. The step stops and the pipeline continues after this many minutes. Use `0` to disable.                                                                                                                                | `30`                       | No       |
| `--max-heap <mb>`               |          | Cap the V8 heap in MB before any pipeline work starts. `0` sets the limit to 100% of available RAM (`os.totalmem()`); any positive integer sets an explicit ceiling. Useful on memory-constrained hosts and containers to prevent SIGSEGV (exit 139) in the map step. | `0`                        | No       |
| `--max-pages <pages>`           |          | Maximum number of HTML pages the Next.js crawler will visit across all recursive passes. `0` disables the limit. Prevents memory exhaustion on event-heavy sites with large link graphs. See [Lazyload — page visit cap](./lazyload.md#nextjs-discovery-pipeline).    | `200`                      | No       |
| `--include-methods <methods>`   |          | Comma-separated list of lazyload method names to run (whitelist). Only these methods will execute in every lazyload pass; all others are skipped. Use `--list-methods` to see valid names. See [Lazyload Methods](./lazyload-methods.md).                             |                            | No       |
| `--exclude-methods <methods>`   |          | Comma-separated list of lazyload method names to skip (blacklist). All methods except these will run in every lazyload pass. Use `--list-methods` to see valid names. See [Lazyload Methods](./lazyload-methods.md).                                                  |                            | No       |
| `--list-methods [framework]`    |          | Print all available lazyload method names grouped by framework and exit. Optionally filter by framework (`next_js`, `vue`, `nuxt_js`, `svelte`, `angular`, `react`). Does not require `-u`.                                                                           |                            | No       |
| `-h, --help`                    |          | display help for command                                                                                                                                                                                                                                              |                            | No       |

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
