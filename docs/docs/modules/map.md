---
sidebar_position: 6
---

# Map command

The `map` command is used to map and analyze the functions within a directory of JavaScript files. It can help you understand the codebase by identifying function definitions and, optionally, using AI to generate descriptions.

## Usage

```bash
js-recon map -d <directory> -t <technology> [options]
```

## Options

| Option                      | Alias | Description                                                                        | Default                                                                         | Required |
| --------------------------- | ----- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------- |
| `--directory <directory>`   | `-d`  | Directory containing JS files.                                                     |                                                                                 | Yes      |
| `--tech <tech>`             | `-t`  | Technology used in the JS files (run with `-l`/`--list` to see available options). |                                                                                 | Yes      |
| `--list`                    | `-l`  | List available technologies.                                                       | `false`                                                                         | No       |
| `--output <file>`           | `-o`  | Output file name (without extension).                                              | `mapped`                                                                        | No       |
| `--format <format>`         | `-f`  | Output format for the results (comma-separated; available: `json`).                | `json`                                                                          | No       |
| `--interactive`             | `-i`  | Interactive mode for exploring the mapped functions.                               | `false`                                                                         | No       |
| `--ai <options>`            |       | Use AI to analyze the code (comma-separated; available: `description`).            |                                                                                 | No       |
| `--ai-provider <provider>`  |       | Service provider to use for AI (available: openai, ollama)                         | `openai`                                                                        | No       |
| `--ai-endpoint <endpoint>`  |       | Endpoint to use for AI service (for Ollama, etc)                                   | `https://api.openai.com/v1` for OpenAI, and `http://127.0.0.1:11434` for Ollama | No       |
| `--openai-api-key <key>`    |       | OpenAI API key for AI analysis.                                                    |                                                                                 | No       |
| `--model <model>`           |       | AI model to use for analysis.                                                      | `gpt-4o-mini` for OpenAI, and `llama3.1` for Ollama                             | No       |
| `--openapi`                 |       | Generate OpenAPI spec from the code                                                | `false`                                                                         | No       |
| `--openapi-output <file>`   |       | Output file for OpenAPI spec                                                       | `mapped-openapi.json`                                                           | No       |
| `--openapi-chunk-tag <tag>` |       | Add chunk ID tag to OpenAPI spec for each request found                            | `false`                                                                         | No       |

## Examples

### Basic usage

The `map` command requires you to specify the directory containing the JavaScript files and the technology used.

For example, to map a Next.JS application:

```bash
js-recon map -d /path/to/js-files -t next
```

### Interactive mode

Map functions and explore them in an interactive session. For a detailed guide, see the [Interactive Mode documentation](../modules/interactive_mode/next-js.md).

```bash
js-recon map -d /path/to/js-files -t next -i
```

### AI-powered analysis

Use an AI model to generate descriptions for the mapped functions by providing the `--ai` flag and an OpenAI API key.

```bash
js-recon map -d /path/to/js-files -t next --ai description --openai-api-key <your-key>
```

### OpenAPI specification generation

You can also generate an OpenAPI specification for the requests made by functions/libraries like `fetch()` and Axios by providing the `--openapi` flag.

```bash
js-recon map -d /path/to/js-files -t next --openapi
```

The output file name can be specified by using the `--openapi-output` flag.

```bash
js-recon map -d /path/to/js-files -t next --openapi --openapi-output <file>
```

To add chunk ID tag to OpenAPI spec for each request found, use the `--openapi-chunk-tag` flag. This should categorize the requests based on the chunk ID.

```bash
js-recon map -d /path/to/js-files -t next --openapi --openapi-chunk-tag
```
