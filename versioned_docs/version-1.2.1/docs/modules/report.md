---
sidebar_position: 1
---

# Report command

The `report` command generates a report based on the results of the analyze module.

## Usage

```bash
js-recon report [options]
```

## Options

| Option                                        | Alias | Description                              | Default       | Required |
| --------------------------------------------- | ----- | ---------------------------------------- | ------------- | -------- |
| `--sqlite-db <file>`                          | `-s`  | SQLite database file                     | `js-recon.db` | No       |
| `--mapped-json <file>`                        | `-m`  | Mapped JSON file                         |               | No       |
| `--analyze-json <file>`                       | `-a`  | Analyze JSON file                        |               | No       |
| `--endpoints-json <file>`                     | `-e`  | Endpoints JSON file                      |               | No       |
| `--map-openapi, --mapped-openapi-json <file>` |       | Mapped OpenAPI JSON file                 |               | No       |
| `--output <file>`                             | `-o`  | Output file name (without the extension) | `report`      | No       |
| `-h, --help`                                  |       | display help for command                 |               | No       |

## Example

### Generate report for mapped JSON file

```bash
js-recon report -m ./mapped.json
```

### Generate report for analyze JSON file

```bash
js-recon report -a ./analyze.json
```

### Generate report for every file

```bash
js-recon report -m mapped.json -a analyze.json -e endpoints.json --map-openapi mapped-openapi.json
```
