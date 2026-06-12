---
sidebar_position: 13
---

# CS-MAST command

The `cs-mast` command computes [CS-MAST-S](https://github.com/shriyanss/cs-mast) (Context-Stratified Merkelized Abstract Syntax Tree) signatures for every `.js` file found in an output directory and optionally finds **structural collisions** — files that share the same CS-MAST-S root signature, meaning they are structurally and semantically equivalent under the chosen configuration.

This is useful for identifying duplicate or shared code across a target's JavaScript bundle (e.g. vendor libraries served from multiple CDN hosts, identical chunks deployed to different paths, or fingerprint-matching against known libraries).

## Usage

```bash
js-recon cs-mast [options]
```

Run this command after `js-recon run` has already populated an output directory with downloaded JS files.

## Options

| Option                        | Alias  | Description                                                                    | Default  | Required |
| ----------------------------- | ------ | ------------------------------------------------------------------------------ | -------- | -------- |
| `--output <directory>`        | `-o`   | Directory to scan recursively for `.js` files.                                 | `output` | No       |
| `--collision-table`           | `--ct` | Find and display structural collisions as a table.                             | `false`  | No       |
| `--min-collisions <n>`        |        | Minimum number of files that must share a signature to be reported.            | `2`      | No       |
| `--collision-output <file>`   | `--co` | Write collision results to a file (independent of `--ct`).                     |          | No       |
| `--collision-format <format>` | `--cf` | Output format for the collision file: `json` or `csv`.                         | `csv`    | No       |

## How it works

1. All `.js` files in the output directory (and subdirectories) are collected.
2. Each file is parsed and hashed using the CS-MAST algorithm with a fixed configuration:
   - **Hash algorithm:** SHA-256
   - **Categories (`scat`):** `lit`, `decl`, `loop`, `cond`
   - **Parser:** `@babel/parser` with `sourceType: unambiguous`
3. A full CS-MAST-S PHC signature is built from each file's root hash and the config, e.g.:
   `$v=1$hash=sha256,lang=js,prsr=-babel/parser,scat=lit_decl_loop_cond$<64-hex>`
4. Files that fail to parse are skipped with a warning.
5. When `--collision-table` or `--collision-output` is set, files sharing the same signature are grouped and reported.

## Output path resolution for `--co`

- If the path passed to `--co` is an **existing directory**, or has **no extension**, the file is written as `collisions.<format>` in the **current working directory**.
- If the path already has an extension (e.g. `results.csv`), it is used as-is.

Examples:
| `--co` value | `--cf` | Written to        |
| ------------ | ------ | ----------------- |
| `output`     | `csv`  | `./collisions.csv` |
| `results`    | `json` | `./collisions.json` |
| `results.csv`| `csv`  | `./results.csv`   |

## Examples

### Scan and count unique hashes

Scan the default `output/` directory and print a summary:

```bash
js-recon cs-mast
```

### Display collision table

Find all files that share the same structural signature and print them as a table:

```bash
js-recon cs-mast --ct
```

### Adjust the minimum collision threshold

Only report signature groups that appear in 3 or more files:

```bash
js-recon cs-mast --ct --min-collisions 3
```

### Write collisions to a file (no console table)

`--co` is independent of `--ct`. Omitting `--ct` writes the file without printing the table to stdout:

```bash
js-recon cs-mast --co collisions.csv --cf csv
```

### Write collisions to a CSV file with table

```bash
js-recon cs-mast --ct --co collisions.csv --cf csv
```

The CSV format uses `|` as a delimiter within the files column to avoid conflicts with the comma separator:

```
signature,count,files
"$v=1$hash=sha256,lang=js,prsr=-babel/parser,scat=lit_decl_loop_cond$a3f2b1c4...",2,"output/host1/chunk.js|output/host2/chunk.js"
```

### Write collisions to a JSON file

```bash
js-recon cs-mast --ct --co collisions.json --cf json
```

```json
[
  {
    "signature": "$v=1$hash=sha256,lang=js,prsr=-babel/parser,scat=lit_decl_loop_cond$a3f2b1c4...",
    "count": 2,
    "files": [
      "output/host1/chunk.js",
      "output/host2/chunk.js"
    ]
  }
]
```

### Scan a non-default output directory

```bash
js-recon cs-mast -o /path/to/custom-output --ct
```
