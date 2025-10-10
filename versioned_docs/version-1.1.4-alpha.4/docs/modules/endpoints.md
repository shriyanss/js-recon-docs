---
sidebar_position: 5
---

# Endpoints command

The `endpoints` command is used to extract client-side endpoints from a directory of JavaScript files and `mapped.json` file. It identifies potential client-side paths and organizes them for further analysis.

## Usage

```bash
js-recon endpoints [options]
```

## Options

| Option                     | Alias | Description                                                                        | Default     | Required |
| -------------------------- | ----- | ---------------------------------------------------------------------------------- | ----------- | -------- |
| `--url <url>`              | `-u`  | Target Base URL (will be used to resolve relative paths).                          |             | Yes      |
| `--directory <directory>`  | `-d`  | Directory containing JS files.                                                     |             | Yes      |
| `--output <filename>`      | `-o`  | Output filename (without file extension).                                          | `endpoints` | No       |
| `--output-format <format>` |       | Output format for the results (available: `json`).                                 | `json`      | No       |
| `--tech <tech>`            | `-t`  | Technology used in the JS files (run with `-l`/`--list` to see available options). |             | Yes      |
| `--list`                   | `-l`  | List available technologies.                                                       | `false`     | No       |
| `--mapped-json <file>`     |       | Mapped JSON file (for Next.js).                                                    |             | No       |

## Examples

### Basic usage

Extract endpoints from a directory of JS files, specifying the technology and target URL:

```bash
js-recon endpoints -d /path/to/js-files -t <technology> -u https://example.com
```

### Specify output file

Extract endpoints and save them to a custom file named `api_paths.md`:

```bash
js-recon endpoints -d /path/to/js-files -t <technology> -u https://example.com -o api_paths
```

### Next.js usage

When analyzing a Next.js app, you must specify the technology as `next` and provide the directory containing subsequent requests. These requests are typically captured during the `lazyload` process. Refer to the [example scenario](../example-scenarios/next-js.md#subsequent-requests) to know a detailed guide on this.

```bash
js-recon endpoints -d /path/to/js-files -t next -u https://example.com --mapped-json /path/to/mapped.json
```

This command will analyze the mapped JSON file along with the subsequent requests directory to extract a comprehensive list of client-side paths specific to the Next.js framework.
