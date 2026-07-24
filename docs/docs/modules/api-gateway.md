---
sidebar_position: 14
---

# API Gateway command

The `api-gateway` command configures and manages throwaway AWS API Gateway REST APIs, used to rotate
the outbound IP address for js-recon's requests — useful against targets that rate-limit by IP.

Configuration (the set of API Gateways this tool has created) is written to
`.api_gateway_config.json` by default.

The resolved API Gateway configuration is used by every module that makes outbound HTTP requests via
the `--api-gateway`/`--api-gateway-config` flags: `lazyload` (including its Puppeteer-driven page
visits) and the `run` pipeline.

## Usage

```bash
js-recon api-gateway [options]
```

## Options

| Option                    | Alias | Description                                                          | Default                   | Required |
| ------------------------- | ----- | ---------------------------------------------------------------------- | --------------------------- | -------- |
| `--init`                  | `-i`  | Create a new API Gateway and save it to the config file.               | `false`                      | No       |
| `--destroy <id>`          | `-d`  | Destroy the API Gateway with the given ID.                              |                              | No       |
| `--destroy-all`           |       | Destroy all API Gateways created by this tool, in all regions.          | `false`                      | No       |
| `--region <region>`       | `-r`  | AWS region to create the API in.                                       | random region                | No       |
| `--access-key <key>`      | `-a`  | AWS access key. Uses `AWS_ACCESS_KEY_ID` env var if not provided.       |                              | No       |
| `--secret-key <key>`      | `-s`  | AWS secret key. Uses `AWS_SECRET_ACCESS_KEY` env var if not provided.   |                              | No       |
| `--config <config>`       | `-c`  | Name of the config file.                                               | `.api_gateway_config.json`   | No       |
| `--list`                  | `-l`  | List all APIs created by this tool.                                    | `false`                      | No       |
| `--feasibility`           |       | Check the feasibility of using API Gateway for a target.                | `false`                      | No       |
| `--feasibility-url <url>` |       | URL to check the feasibility of.                                       |                              | No       |

### Examples

#### Initialize the API Gateway

```bash
js-recon api-gateway -i -r us-east-1
```

Or, if the AWS keys are not set in the environment variables:

```bash
js-recon api-gateway -i -r us-east-1 -a <access-key> -s <secret-key>
```

This creates a new API Gateway in the given region and saves its configuration to
`.api_gateway_config.json` (or the path given via `-c/--config`).

#### List created APIs

```bash
js-recon api-gateway --list
```

#### Destroy an API

Destroy a specific API Gateway using its ID:

```bash
js-recon api-gateway --destroy <api-id>
```

#### Destroy all APIs

Destroy all APIs created by this tool in all regions:

```bash
js-recon api-gateway --destroy-all
```

#### Check feasibility

Check if a target URL returns a response that contains known traces of a firewall. If the result says firewall detected, then it means that the target has blocked the IP addresses originating from the AWS infrastructure.

```bash
js-recon api-gateway --feasibility --feasibility-url https://example.com
```

## Flags available on `lazyload` and `run`

`lazyload` and `run` take these two flags to route their outbound requests through a configured API
Gateway. Both are declared identically on both commands.

| Option                       | Description                                                                 | Default                   |
| ---------------------------- | ------------------------------------------------------------------------------ | --------------------------- |
| `--api-gateway`               | Generate requests using API Gateway.                                          | `false`                      |
| `--api-gateway-config <file>` | API Gateway config file to read (generated via `js-recon api-gateway -i`).      | `.api_gateway_config.json`    |

### Example

```bash
js-recon api-gateway -i -r us-east-1
js-recon run -u https://example.com --api-gateway --api-gateway-config .api_gateway_config.json
```

## `.api_gateway_config.json` schema

A flat map of created gateways, keyed by generated name:

```json
{
    "<gateway-name>": {
        "id": "...",
        "name": "...",
        "description": "...",
        "created_at": 0,
        "region": "us-east-1",
        "access_key": "...",
        "secret_key": "..."
    }
}
```
