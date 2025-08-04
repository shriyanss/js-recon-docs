---
sidebar_position: 1
---

# Run command

The `run` command is a powerful feature that automates most of the JavaScript reconnaissance workflow by executing a series of modules in a predefined order. This command is ideal for users who want to perform a basic analysis of a target without running each module individually.

## Workflow

The `run` command executes the following modules in sequence (for Next.js targets; the tool will exit after lazyload if the target is not a Next.js app):

1.  **Lazy Load (Initial)**: Downloads the initial set of JavaScript files from the target URL.
1.  **Strings (Initial)**: Extracts strings, URLs, and paths from the downloaded JavaScript files.
1.  **Lazy Load (Subsequent Requests - for Next.js)**: Downloads additional JavaScript files discovered from the extracted URLs and paths.
1.  **Strings (Final)**: Performs another round of string extraction on the newly downloaded files to find more endpoints, secrets, and other valuable information.
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

| Option                        | Alias | Description                                                          | Default                    | Required |
| ----------------------------- | ----- | -------------------------------------------------------------------- | -------------------------- | -------- |
| `--url <url>`                 | `-u`  | Target URL                                                           |                            | Yes      |
| `--output <directory>`        | `-o`  | Output directory                                                     | `output`                   | No       |
| `--strict-scope`              |       | Download JS files from only the input URL domain                     | `false`                    | No       |
| `--scope <scope>`             | `-s`  | Download JS files from specific domains (comma-separated)            | `*`                        | No       |
| `--threads <threads>`         | `-t`  | Number of threads to use                                             | `1`                        | No       |
| `--api-gateway`               |       | Generate requests using API Gateway                                  | `false`                    | No       |
| `--api-gateway-config <file>` |       | API Gateway config file                                              | `.api_gateway_config.json` | No       |
| `--cache-file <file>`         |       | File to store response cache                                         | `.resp_cache.json`         | No       |
| `--disable-cache`             |       | Disable response caching                                             | `false`                    | No       |
| `--yes`                       | `-y`  | Auto-approve executing JS code from the target                       | `false`                    | No       |
| `--secrets`                   |       | Scan for secrets                                                     | `false`                    | No       |
| `--ai <options>`              |       | Use AI to analyze the code (comma-separated; available: description) |                            | No       |
| `--ai-threads <threads>`      |       | Number of threads to use for AI                                      | `5`                        | No       |
| `--ai-provider <provider>`    |       | Service provider to use for AI (available: openai, ollama)           | `openai`                   | No       |
| `--ai-endpoint <endpoint>`    |       | Endpoint to use for AI service (for Ollama, etc)                     |                            | No       |
| `--openai-api-key <key>`      |       | OpenAI API key                                                       |                            | No       |
| `--model <model>`             |       | AI model to use                                                      | `gpt-4o-mini`              | No       |
| `--map-openapi-chunk-tag`     |       | Add chunk ID tag to OpenAPI spec for each request found (map module) | `false`                    | No       |
| `--insecure`                  |       | Disable SSL certificate verification                                 | `false`                    | No       |
| `-h, --help`                  |       | display help for command                                             |                            | No       |

## Example

### Run all modules on target, scan for secrets, and generate AI descriptions

```bash
js-recon run -u https://example.com --secrets --ai description
```

This command will perform a full analysis on `https://example.com`, save the JavaScript files to the `output` directory, scan for secrets, and use AI to generate descriptions for the mapped functions.
