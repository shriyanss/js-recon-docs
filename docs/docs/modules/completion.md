---
sidebar_position: 18
---

# Completion command

The `completion` command generates a shell completion script for `js-recon`. Once installed, pressing <kbd>Tab</kbd> after `js-recon ` lists all available subcommands, and pressing <kbd>Tab</kbd> after `js-recon <command> ` lists all flags for that subcommand.

Supported shells: **bash**, **zsh**, **fish**.

## Usage

```bash
js-recon completion <shell>
```

## Installing completion

### Bash

Add the following line to your `~/.bashrc` (or `~/.bash_profile` on macOS):

```bash
eval "$(js-recon completion bash)"
```

Then reload your shell:

```bash
source ~/.bashrc
```

### Zsh

Add the following line to your `~/.zshrc`:

```zsh
eval "$(js-recon completion zsh)"
```

Then reload your shell:

```bash
source ~/.zshrc
```

Alternatively, write the script to a file on your `$fpath` for faster shell startup:

```zsh
js-recon completion zsh > "${fpath[1]}/_js-recon"
```

### Fish

Write the completion script to fish's completions directory:

```fish
js-recon completion fish > ~/.config/fish/completions/js-recon.fish
```

Fish picks up new completions automatically — no reload needed.

## What gets completed

| When you type…         | Tab shows…                                    |
| ---------------------- | --------------------------------------------- |
| `js-recon `            | All subcommands (lazyload, run, map, etc.)    |
| `js-recon run `        | All flags for the `run` command               |
| `js-recon map `        | All flags for the `map` command               |
| `js-recon completion ` | Available shell names (`bash`, `zsh`, `fish`) |
| `js-recon run --url `  | No further suggestions (free-form argument)   |

Every subcommand and every flag registered in `src/index.ts` is covered.

## Example session

```bash
$ js-recon <TAB>
analyze      api-gateway  completion   cs-mast      endpoints    fingerprint
lazyload     load         map          mcp          refactor     report
run          sourcemaps   strings

$ js-recon run --<TAB>
--ai                      --ai-endpoint             --ai-provider
--ai-threads              --api-gateway             --api-gateway-config
--cache-file              --cache-only              --command
--cs-mast-tech-detect-threshold  --disable-cache     --exclude-methods
--include-methods         --insecure                --lazyload-timeout
--list-methods            --map-openapi-chunk-tag   --max-heap
--max-iterations          --max-js-size             --max-pages
--model                   --ngql                    --no-graphql
--no-sandbox              --openai-api-key          --output
--research                --research-output         --rules
--scope                   --secrets                 --sourcemap-dir
--strict-scope            --threads                 --timeout
--trufflehog              --url                     --yes
```
