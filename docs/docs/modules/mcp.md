---
sidebar_position: 10
---

# MCP command

The `mcp` command launches an AI-powered interactive CLI that lets you run js-recon modules through natural language. You can ask it to download JavaScript files, run the full analysis pipeline, summarize results, and more — without remembering individual command flags.

## Usage

```bash
js-recon mcp --cli [options]
```

## Options

| Option               | Alias | Description                                                    | Default              | Required |
| -------------------- | ----- | -------------------------------------------------------------- | -------------------- | -------- |
| `--cli`              |       | Start the interactive CLI session.                             | `false`              | Yes      |
| `--config <file>`    |       | Path to a custom MCP config file.                              | `~/.js-recon/mcp.yaml` | No     |
| `--api-key <key>`    |       | API key for the LLM provider (overrides config and env vars).  |                      | No       |
| `--model <model>`    |       | AI model to use (e.g. `gpt-4o-mini`, `claude-sonnet-4-20250514`). | from config       | No       |
| `--provider <provider>` |    | LLM provider to use (`openai` or `anthropic`).                 | from config          | No       |

## Configuration

MCP stores its configuration at `~/.js-recon/mcp.yaml`. A default file is created automatically on first run. You can also pass a custom path with `--config`.

### Config file format

```yaml
provider: openai           # openai or anthropic
model: gpt-4o-mini
openai_api_key: sk-...
anthropic_api_key: ""
default_output_dir: output
default_threads: 1
history_limit: 50
```

| Field               | Description                                             | Default       |
| ------------------- | ------------------------------------------------------- | ------------- |
| `provider`          | LLM provider (`openai` or `anthropic`)                  | `openai`      |
| `model`             | Model to use                                            | `gpt-4o-mini` |
| `openai_api_key`    | OpenAI API key (also reads `OPENAI_API_KEY` env var)    |               |
| `anthropic_api_key` | Anthropic API key (also reads `ANTHROPIC_API_KEY` env var) |            |
| `default_output_dir`| Output directory used when running tools                | `output`      |
| `default_threads`   | Threads passed to lazyload/run                          | `1`           |
| `history_limit`     | Maximum number of messages kept in conversation history | `50`          |

API keys are resolved in order: `--api-key` CLI flag → config file → environment variable.

## Starting a session

```bash
js-recon mcp --cli
```

If no API key is configured, the CLI will prompt you to select a provider and enter your key interactively. The key will be saved to `~/.js-recon/mcp.yaml`.

To start with a specific provider and key without saving to config:

```bash
js-recon mcp --cli --provider anthropic --api-key <your-key> --model claude-sonnet-4-20250514
```

## Chatting naturally

Once the session starts, you can interact in plain English. The CLI automatically detects intent and decides whether to call a tool:

- **"lazyload https://example.com"** — downloads JS files from the target
- **"run a full analysis on https://example.com"** — runs the complete pipeline (lazyload → strings → map → endpoints → analyze → report)
- **"summarize the results"** — reads and summarizes the output files from the last run
- Anything else is answered by the AI as a general question

The AI will ask for confirmation of the target URL before executing tools.

## Slash commands

Slash commands can be typed at any time in the session. Tab completion is supported.

| Command              | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `/help`              | Show all available slash commands.                          |
| `/exit`              | Exit the MCP CLI.                                           |
| `/status`            | Show current provider, model, conversation length, and cost. |
| `/cost`              | Show token usage and estimated cost for this session.       |
| `/clear`             | Clear conversation history (keeps the system prompt).       |
| `/model`             | Show the current model.                                     |
| `/model <name>`      | Switch to a different model (e.g. `/model gpt-4o`).         |
| `/models`            | List all available models for the current provider.         |
| `/provider`          | Show the current provider.                                  |
| `/provider <name>`   | Switch provider (`openai` or `anthropic`).                  |
| `/config`            | Show the current configuration.                             |
| `/save`              | Save the current session config to `~/.js-recon/mcp.yaml`.  |

## Keyboard shortcuts

| Key          | Action                                              |
| ------------ | --------------------------------------------------- |
| `Ctrl-C`     | Stop the current in-progress tool call.             |
| `Ctrl-C` ×2  | Exit the session (also accepts `/exit`).            |
| `Tab`        | Autocomplete slash commands.                        |
| `Up Arrow`   | Navigate to previous input in history.              |
| `Down Arrow` | Navigate to next input in history.                  |

## Example session

```
js-recon mcp --cli --provider openai --api-key sk-...

  ╔══════════════════════════════════════╗
  ║         js-recon MCP CLI             ║
  ╚══════════════════════════════════════╝

  Provider: openai | Model: gpt-4o-mini
  Type /help for commands, or chat naturally.

js-recon> lazyload https://example.com
  [Tool Output - lazyload]: Downloaded 12 JS files to output/

js-recon> summarize the results
  Found: main.js, chunks/123.js, chunks/456.js ...

js-recon> /cost
  Prompt tokens: 1,204 | Completion tokens: 387 | Estimated cost: $0.000248

js-recon> /exit
```
