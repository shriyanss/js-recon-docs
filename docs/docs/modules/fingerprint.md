---
sidebar_position: 7
---

# Fingerprint command

The `fingerprint` command detects the front-end JavaScript framework used by one or more target URLs. It is useful for quickly profiling a list of targets before running a full `lazyload` or `run` pipeline.

## Usage

```bash
js-recon fingerprint -u <url/file> [options]
```

## Options

| Option             | Alias | Description                                                          | Default  | Required |
| ------------------ | ----- | -------------------------------------------------------------------- | -------- | -------- |
| `--url <url/file>` | `-u`  | Target URL or a file containing a list of URLs (one per line).       |          | Yes      |
| `--output <file>`  | `-o`  | Output file to write results.                                        |          | No       |
| `--format <formats>` | `-f` | Output format(s): `text`, `csv`, `json`, `jsonl` (comma-separated for multiple).        | `text`   | No       |
| `--timeout <ms>`   |       | Request timeout in milliseconds.                                     | `30000`  | No       |
| `--insecure`       | `-k`  | Disable SSL certificate verification.                                | `false`  | No       |
| `--no-sandbox`     |       | Disable browser sandbox.                                             | `false`  | No       |

## How it works

For each URL, the command delegates to the same framework-detection logic used by `lazyload`. Detection checks HTML attributes, inline script content, and fetched JS asset content in this priority order:

1. **Next.js** — elements with `src`, `srcset`, or `imageSrcSet` attributes containing `/_next/`
2. **Vue.js** — `data-v-*` / `data-vue-*` attributes or `__vue` in fetched script content
3. **Nuxt.js** — sub-check after Vue: `src`/`href` containing `/_nuxt`
4. **Svelte** — SvelteKit attribute markers or `__svelte_*` in bundled code
5. **Angular** — `ng-*` attributes or Angular-specific markers
6. **React** — markers such as `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`, `__REACT_DEVTOOLS_GLOBAL_HOOK__`, or `react-dom.production` in inline scripts or fetched assets

If none of the above match, the framework is reported as `unknown`.

Detection uses two sources per URL: a raw HTTP response (fast path) and a Puppeteer-rendered page (catches client-side-only markers after a 2-second settle). Results are printed live as each URL is processed, with a progress bar showing overall completion.

## Output formats

### Text (default)

Each line is formatted as `[<framework>] <url>`:

```
[next.js] https://example.com
[unknown] https://other.com
```

### CSV

The first row is a header; subsequent rows are `framework,url`:

```
framework,url
next.js,https://example.com
unknown,https://other.com
```

### JSON

A JSON array of objects, each with `url` and `framework` fields:

```json
[
  { "url": "https://example.com", "framework": "next" },
  { "url": "https://other.com", "framework": "unknown" }
]
```

### JSONL

One JSON object per line (newline-delimited JSON), useful for streaming or piping into other tools:

```
{"url":"https://example.com","framework":"next"}
{"url":"https://other.com","framework":"unknown"}
```

### Multiple formats

Pass a comma-separated list to write multiple files in one run. The output filename is used as a base and the appropriate extension (`.txt`, `.csv`, `.json`, `.jsonl`) is appended automatically.

## Examples

### Single URL

```bash
js-recon fingerprint -u https://example.com
```

### File of URLs

Create a file `targets.txt` with one URL per line, then run:

```bash
js-recon fingerprint -u targets.txt
```

### Save results to a file

```bash
js-recon fingerprint -u targets.txt -o results.txt
```

### Save as CSV

```bash
js-recon fingerprint -u targets.txt -o results -f csv
```

### Save as JSON

```bash
js-recon fingerprint -u targets.txt -o results -f json
```

### Save as JSONL

```bash
js-recon fingerprint -u targets.txt -o results -f jsonl
```

### Save all formats at once

```bash
js-recon fingerprint -u targets.txt -o results -f text,csv,json,jsonl
```

This produces `results.txt`, `results.csv`, `results.json`, and `results.jsonl`.

### Skip SSL verification

```bash
js-recon fingerprint -u https://example.com -k
```
