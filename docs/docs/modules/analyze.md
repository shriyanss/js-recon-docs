---
sidebar_position: 9
---

# Analyze command

The `analyze` command is used to analyze a file the output files of JS recon modules to determine if they contain sensitive info or not.

## Usage

```bash
js-recon analyze [options]
```

## Options

| Option                 | Alias | Description                                                                   | Default                 | Required |
| ---------------------- | ----- | ----------------------------------------------------------------------------- | ----------------------- | -------- |
| `--rules <file/dir>`   | `-r`  | Rules file or directory to use for analysis                                   | `$HOME/.js-recon/rules` | No       |
| `--mapped-json <file>` | `-m`  | Mapped JSON file to store analysis results                                    | `"mapped.json"`         | No       |
| `--tech <tech>`        | `-t`  | Technology used in the JS files (use with -l/--list to see available options) |                         | No       |
| `--openapi <file>`     |       | Path to OpenAPI spec file                                                     |                         | No       |
| `--list`               | `-l`  | List available technologies                                                   | `false`                 | No       |
| `--validate`           |       | Validate the rules                                                            | `false`                 | No       |

## Examples

### Validating custom rules

Though the tool will validate all the templates automatically, you can also validate them manually using the `--validate` option.

Assuming that the rules are stored in the `./rules` directory, you can run the following command to validate them:

```bash
js-recon analyze --validate -r ./rules
```

### Analyzing OpenAPI spec file

To run analysis on an OpenAPI spec file, make sure that your've generated it using the `map` command:

```bash
js-recon map -d output/<domain> -t <tech> --openapi
```

This will give a file called `mapped-openapi.json` in the working directory. To run analysis on this, run the following command:

```bash
js-recon analyze --openapi mapped-openapi.json -t <tech>
```

This will analyze the `mapped-openapi.json` file against the default rules that would be stored in `$HOME/.js-recon/rules`.
