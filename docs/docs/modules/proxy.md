---
sidebar_position: 14
---

# Proxy command

The `proxy` command (previously `api-gateway`) configures and manages outbound proxying for
js-recon. It supports four pluggable methods:

- **`aws`** — throwaway AWS API Gateway REST APIs across regions, for IP rotation against
  rate-limiting targets. This is the original `api-gateway` behavior, unchanged.
- **`socks`** / **`http`** — a generic SOCKS5 or HTTP proxy given as a single URL.
- **`oxylabs`** — [Oxylabs](https://oxylabs.io/) residential proxies.

Configuration is written to `.proxy_config.json` by default (previously `.api_gateway_config.json`
for the `aws` method only — see [Migrating from `.api_gateway_config.json`](#migrating-from-api_gateway_configjson)
below).

The resolved proxy is used by every module that makes outbound HTTP requests: `lazyload` (including
its Puppeteer-driven page visits), the shared request client used across the tool, and the `analyze`
rules-download step.

## Usage

```bash
js-recon proxy [options]
```

The `proxy` subcommand itself only manages the `aws` method's gateway lifecycle (create/list/destroy).
The other three methods (`socks`, `http`, `oxylabs`) are pure configuration — set them via flags on
`lazyload`/`run`, environment variables, or `.proxy_config.json`; there's no separate lifecycle to
manage for them.

## `proxy` subcommand options (`aws` method)

| Option                    | Alias | Description                                                          | Default               | Required |
| ------------------------- | ----- | ---------------------------------------------------------------------- | ---------------------- | -------- |
| `--init`                  | `-i`  | Initialize the config file and create a new API Gateway.               | `false`                 | No       |
| `--destroy <id>`          | `-d`  | Destroy the API with the given ID.                                     |                         | No       |
| `--destroy-all`           |       | Destroy all APIs created by this tool in all regions.                  | `false`                 | No       |
| `--region <region>`       | `-r`  | AWS region to create the API in.                                       | random region           | No       |
| `--aws-access-key <key>`  |       | AWS access key. Uses `AWS_ACCESS_KEY_ID` env var if not provided.       |                         | No       |
| `--aws-secret-key <key>`  |       | AWS secret key. Uses `AWS_SECRET_ACCESS_KEY` env var if not provided.   |                         | No       |
| `--config <config>`       | `-c`  | Name of the config file (if different from the default)                | `.proxy_config.json`    | No       |
| `--list`                  | `-l`  | List all APIs created by this tool.                                    | `false`                 | No       |
| `--feasibility`           |       | Check the feasibility of using API Gateway for a target.                | `false`                 | No       |
| `--feasibility-url <url>` |       | URL to check the feasibility of.                                        |                         | No       |

### Examples

#### Initialize API gateway

Create a new API Gateway and save its configuration:

```bash
js-recon proxy --init
```

#### List created APIs

List all the API gateways this tool creates:

```bash
js-recon proxy --list
```

#### Destroy an API

Destroy a specific API Gateway using its ID:

```bash
js-recon proxy --destroy <api-id>
```

#### Destroy all APIs

Destroy all APIs created by this tool in all regions:

```bash
js-recon proxy --destroy-all
```

#### Check feasibility

Check if a target URL returns a response that contains known traces of a firewall. If the result says firewall detected, then it means that the target has blocked the IP addresses originating from the AWS infrastructure.

```bash
js-recon proxy --feasibility --feasibility-url https://example.com
```

## Flags available on `lazyload` and `run`

These flags select and configure the active proxy method for any module issuing outbound requests.
They are declared identically on both `lazyload` and `run`.

| Option                          | Description                                                                                | Default               |
| ------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| `--proxy-method <method>`       | Proxy method to use: `aws`, `socks`, `http`, or `oxylabs`.                                   |                         |
| `--proxy <url>`                 | SOCKS5/HTTP proxy URL: `socks5://[user:pass@]host:port` or `http://[user:pass@]host:port`.    |                         |
| `--proxy-config <file>`         | Proxy config file path.                                                                       | `.proxy_config.json`   |
| `--aws-access-key <key>`        | AWS access key for the `aws` method.                                                          |                         |
| `--aws-secret-key <key>`        | AWS secret key for the `aws` method.                                                          |                         |
| `--oxylabs-username <username>` | Oxylabs residential proxy username.                                                           |                         |
| `--oxylabs-password <password>` | Oxylabs residential proxy password.                                                           |                         |
| `--oxylabs-country <country>`   | Oxylabs residential proxy country code.                                                       |                         |
| `--oxylabs-city <city>`         | Oxylabs residential proxy city (requires `--oxylabs-country` to also be set).                 |                         |
| `--oxylabs-session-id <id>`     | Oxylabs residential proxy sticky session id (omit for a new IP per request).                  |                         |
| `--ignore-proxy-env`            | Skip `JS_RECON_*` proxy environment variables during resolution (see below).                  | `false`                 |

### SOCKS/HTTP example

```bash
js-recon run -u https://example.com --proxy-method socks --proxy socks5://user:pass@127.0.0.1:1080
```

### Oxylabs example

```bash
js-recon run -u https://example.com \
  --proxy-method oxylabs \
  --oxylabs-username myuser --oxylabs-password mypass \
  --oxylabs-country US
```

## Resolution precedence

The active proxy configuration is resolved in this order, **highest wins**:

1. CLI flags (`--proxy-method`, `--proxy`, `--oxylabs-*`, `--aws-*`)
2. Environment variables (read automatically unless `--ignore-proxy-env` is passed):
   - `JS_RECON_PROXY_METHOD` (`aws` | `socks` | `http` | `oxylabs`)
   - `JS_RECON_PROXY_URL` (for the `socks`/`http` methods)
   - `JS_RECON_OXYLABS_USERNAME`, `JS_RECON_OXYLABS_PASSWORD`, `JS_RECON_OXYLABS_COUNTRY`,
     `JS_RECON_OXYLABS_CITY`, `JS_RECON_OXYLABS_SESSION_ID`
   - `JS_RECON_AWS_ACCESS_KEY_ID`, `JS_RECON_AWS_SECRET_ACCESS_KEY`, `JS_RECON_AWS_REGION` — these
     are separate from the AWS SDK's own `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` env vars;
     js-recon only ever reads its own `JS_RECON_`-prefixed variables for proxy configuration.
3. `.proxy_config.json` (or the path given via `--proxy-config`)

Pass `--ignore-proxy-env` on `lazyload` or `run` to skip step 2 entirely and resolve straight from the
config file (useful if you have `JS_RECON_*` variables exported globally for other scans but don't
want a proxy for a particular run).

## `.proxy_config.json` schema

One file, keyed by method, so you can keep multiple method configs around and select which is active
via the `method` key (or override it with `--proxy-method`/`JS_RECON_PROXY_METHOD`):

```json
{
    "method": "socks",
    "socks": { "url": "socks5://user:pass@host:1080" },
    "http": { "url": "http://user:pass@host:8080" },
    "oxylabs": {
        "username": "myuser",
        "password": "mypass",
        "country": "US",
        "city": "newyork",
        "sessionId": "abc12345"
    },
    "aws": {
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
}
```

The `aws` key holds a map of gateways keyed by generated name — the same shape the `proxy` subcommand
has always written for the `aws` method.

## Migrating from `.api_gateway_config.json`

If you have an existing `.api_gateway_config.json` from before this rename (a flat map of gateways,
without an `aws` key wrapping it), js-recon still reads it correctly: when `.proxy_config.json` has no
`aws` key but its top-level shape matches the legacy flat map, it's used as-is (with a one-time
warning). The next time you run `proxy --init`, `--destroy`, or `--destroy-all`, the file is rewritten
in the new nested `{ "aws": {...} }` shape automatically — no manual editing required.
