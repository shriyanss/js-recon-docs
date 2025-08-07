---
sidebar_position: 8
---

# Exit Codes

This document lists the custom exit codes used in the application and their meanings.

| Exit Code | Command    | Reason for Exit                                                                                                                                         |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | `map`      | Invalid AI option provided. The `--ai` option received a value that is not supported.                                                                   |
| 2         | `run`      | Invalid AI option provided. The `--ai` option received a value that is not supported.                                                                   |
| 3         | `lazyload` | Invalid URL or file path provided. The `-u` or `--url` option received a value that is not a valid URL or an existing file path.                        |
| 4         | `map`      | Invalid format provided. The `--format` option received a value that is not supported.                                                                  |
| 5         | `map`      | Missing technology. The `-t` or `--tech` option was not specified.                                                                                      |
| 6         | `map`      | Missing directory. The `-d` or `--directory` option was not specified.                                                                                  |
| 7         | `refactor` | Mapped JSON file does not exist. The `-m` or `--mapped-json` option received a value that is not an existing file path.                                 |
| 8         | `refactor` | Invalid technology provided. The `-t` or `--tech` option received a value that is not supported.                                                        |
| 9         | `refactor` | Output directory already exists. The `-o` or `--output` option received a value that is an existing directory path.                                     |
| 10        | `run`      | Technology not detected. The tool was unable to detect the technology used by the target URL.                                                           |
| 11        | `run`      | Output directory already exists. The `-o` or `--output` option received a value that is an existing directory path.                                     |
| 12        | `run`      | Invalid URL provided. The `-u` or `--url` option received a value that is not a valid URL.                                                              |
| 13        | `run`      | Invalid URL in file. The file provided to the `-u` or `--url` option contains an invalid URL.                                                           |
| 14        | `run`      | Tool output directory already exists. The default output directory `js_recon_run_output` already exists when running in batch mode.                     |
| 15        | `strings`  | Directory does not exist. The `-d` or `--directory` option received a value that is not an existing directory path.                                     |
| 16        | `strings`  | Missing `-e` flag. The `-p` or `--openapi` flag was used without the `-e` flag.                                                                         |
| 17        | `lazyload` | Subsequent requests URLs file does not exist. This is an internal error, but can be caused if the `strings` module is not run with the `-e` flag first. |
| 18        | `run`      | Firewall blocking API Gateway. The tool detected a firewall blocking the AWS API Gateway. Please try again without the API Gateway.                     |
| 19        | `map`      | OpenAI API key not found. Please provide it via `--openai-api-key` or `OPENAI_API_KEY` environment variable.                                            |
| 20        | `analyze`  | Invalid rules found. Some of the rules provided are invalid.                                                                                            |
| 21        | `lazyload` | The tool detected a header overflow. Please increase the limit by setting environment variable `NODE_OPTIONS="--max-http-header-size=99999999"`. If the error still persists, please try again with a higher limit.       |
