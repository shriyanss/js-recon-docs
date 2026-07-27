---
sidebar_position: 14
---

# Proxy command

The `proxy` command (previously `api-gateway`) configures and manages outbound proxying for
js-recon. It supports four pluggable methods:

- **`aws`** — throwaway AWS API Gateway REST APIs across regions, for IP rotation against
  rate-limiting targets. This is the original `api-gateway` behavior, unchanged.
- **`socks`** / **`http`** — a generic SOCKS5 or HTTP proxy given as a single URL.
- **`oxylabs`** — [Oxylabs](https://oxylabs.io/) datacenter proxies.

Configuration is written to `.proxy_config.json` by default (previously `.api_gateway_config.json`
for the `aws` method only — see [Migrating from `.api_gateway_config.json`](#migrating-from-api_gateway_configjson)
below).

The resolved proxy is used by every module that makes outbound HTTP requests: `lazyload` (including
its Puppeteer-driven page visits), the shared request client used across the tool, and the `analyze`
rules-download step.

**Configuration is one-directional.** The `proxy` command is the only place you set a method or
credentials — it writes everything to `.proxy_config.json`. `lazyload` and `run` only ever _read_ that
file (plus environment variables); they don't accept method or credential flags at all. This keeps
credentials out of every `lazyload`/`run` invocation and out of its shell history — it does not make the
initial `proxy` configuration step itself safe from shell-history exposure; see the flag warnings under
[Examples](#examples) below for that.

## Usage

```bash
js-recon proxy [options]
```

Running `js-recon proxy -i` (or `--init`) with no other flags launches an interactive wizard: pick a
method (`aws`, `socks`, `http`, or `oxylabs`), then fill in that method's fields. The result is written
to `.proxy_config.json` (or the path given via `-c/--config`). Passing flags alongside `-i` pre-fills
those specific fields and skips their prompts — pass `--proxy-method` together with all of a method's
fields to run entirely non-interactively (e.g. in CI).

`-d/--destroy`, `--destroy-all`, and `-l/--list` remain `aws`-only lifecycle actions (they don't go
through the wizard, since `socks`/`http`/`oxylabs` have no create/destroy lifecycle to manage).

## `proxy` subcommand options

| Option                          | Alias | Description                                                                                              | Default              | Required |
| ------------------------------- | ----- | -------------------------------------------------------------------------------------------------------- | -------------------- | -------- |
| `--init`                        | `-i`  | Run the interactive config wizard (or create a new AWS API Gateway, `aws` method).                       | `false`              | No       |
| `--destroy <id>`                | `-d`  | Destroy the AWS API with the given ID. `[aws method]`                                                    |                      | No       |
| `--destroy-all`                 |       | Destroy all APIs created by this tool in all regions. `[aws method]`                                     | `false`              | No       |
| `--region <region>`             | `-r`  | AWS region to create the API in. `[aws method]`                                                          | random region        | No       |
| `--aws-access-key <key>`        |       | AWS access key. Uses `AWS_ACCESS_KEY_ID` env var if not provided. `[aws method]`                         |                      | No       |
| `--aws-secret-key <key>`        |       | AWS secret key. Uses `AWS_SECRET_ACCESS_KEY` env var if not provided. `[aws method]`                     |                      | No       |
| `--config <config>`             | `-c`  | Name of the config file (if different from the default)                                                  | `.proxy_config.json` | No       |
| `--list`                        | `-l`  | List all APIs created by this tool. `[aws method]`                                                       | `false`              | No       |
| `--feasibility`                 |       | Check the feasibility of using API Gateway for a target. `[aws method]`                                  | `false`              | No       |
| `--feasibility-url <url>`       |       | URL to check the feasibility of. `[aws method]`                                                          |                      | No       |
| `--proxy-method <method>`       |       | Method to configure with `-i`: `aws`, `socks`, `http`, or `oxylabs`. Omit for an interactive prompt.     |                      | No       |
| `--proxy <url>`                 |       | SOCKS5/HTTP proxy URL for `-i`: `socks5://[user:pass@]host:port` or `http://[user:pass@]host:port`.      |                      | No       |
| `--oxylabs-username <username>` |       | Oxylabs datacenter proxy username for `-i`.                                                              |                      | No       |
| `--oxylabs-password <password>` |       | Oxylabs datacenter proxy password for `-i`.                                                              |                      | No       |
| `--oxylabs-country <country>`   |       | Oxylabs datacenter proxy country code for `-i`.                                                          |                      | No       |
| `--oxylabs-city <city>`         |       | Not supported (no documented username-level city targeting for datacenter proxies).                      |                      | No       |
| `--oxylabs-session-id <id>`     |       | Not supported via username (sticky sessions are selected by port, not username, for datacenter proxies). |                      | No       |

### Examples

#### Interactive setup (any method)

```bash
js-recon proxy -i
```

Prompts for a method, then that method's fields, and writes `.proxy_config.json`.

#### Non-interactive SOCKS5 setup

```bash
js-recon proxy -i --proxy-method socks --proxy socks5://user:pass@127.0.0.1:1080
```

#### Non-interactive Oxylabs setup

```bash
js-recon proxy -i --proxy-method oxylabs \
  --oxylabs-username myuser --oxylabs-password mypass --oxylabs-country US
```

:::warning
Passing credentials as command-line flags (as in both examples above) puts them in shell history and
makes them visible to other local processes for the life of the command, and in CI logs if run there.
Run `js-recon proxy -i` with no credential flags to get interactive prompts instead, which keeps them
out of the command line and shell history — they can still be exposed via process/environment
inspection or a misconfigured CI runner, so treat this as reduced exposure, not a guarantee of secrecy.
:::

#### AWS: initialize API gateway

```bash
js-recon proxy -i --proxy-method aws
```

Prompts for any missing AWS access key/secret key/region, creates a new API Gateway, and saves its
configuration.

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

`lazyload` and `run` take **only** these two flags — no method or credential flags. Both are declared
identically on both commands.

| Option                  | Description                                                                  | Default              |
| ----------------------- | ---------------------------------------------------------------------------- | -------------------- |
| `--proxy-config <file>` | Proxy config file to read (generated via `js-recon proxy -i`).               | `.proxy_config.json` |
| `--ignore-proxy-env`    | Skip `JS_RECON_*` proxy environment variables during resolution (see below). | `false`              |

### Example

```bash
js-recon proxy -i --proxy-method socks --proxy socks5://user:pass@127.0.0.1:1080
js-recon run -u https://example.com --proxy-config .proxy_config.json
```

## Resolution precedence

`lazyload`/`run` resolve the active proxy configuration in this order, **highest wins**:

1. Environment variables (read automatically unless `--ignore-proxy-env` is passed):
    - `JS_RECON_PROXY_METHOD` (`aws` | `socks` | `http` | `oxylabs`)
    - `JS_RECON_PROXY_URL` (for the `socks`/`http` methods)
    - `JS_RECON_OXYLABS_USERNAME`, `JS_RECON_OXYLABS_PASSWORD`, `JS_RECON_OXYLABS_COUNTRY`,
      `JS_RECON_OXYLABS_CITY`, `JS_RECON_OXYLABS_SESSION_ID`
    - The `aws` method has no `JS_RECON_`-prefixed env vars of its own. Since `lazyload` and `run` don't
      accept `--aws-access-key`/`--aws-secret-key`/`-r`/`--region` (those stay `proxy`-only), these
      consumers resolve AWS credentials and region from the plain AWS SDK env vars
      (`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/`AWS_REGION`/`AWS_DEFAULT_REGION`) or the default AWS
      SDK credential chain.
2. `.proxy_config.json` (or the path given via `--proxy-config`) — written by `js-recon proxy -i`.

Pass `--ignore-proxy-env` on `lazyload` or `run` to skip step 1 entirely and resolve straight from the
config file (useful if you have `JS_RECON_*` variables exported globally for other scans but don't
want a proxy for a particular run).

## `.proxy_config.json` schema

One file, keyed by method, so you can keep multiple method configs around and select which is active
via the `method` key. Running `js-recon proxy -i` for a new method updates the `method` key and that
method's block, without touching any other method's block already saved in the file:

```json
{
    "method": "socks",
    "socks": { "url": "socks5://user:pass@host:1080" },
    "http": { "url": "http://user:pass@host:8080" },
    "oxylabs": {
        "username": "myuser",
        "password": "mypass",
        "country": "US"
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

:::danger
`.proxy_config.json` stores credentials in plain text — AWS secret keys and the Oxylabs password among
them. Never commit it or share it outside the engagement team, and restrict its file permissions to
the owning user only.
:::

## Migrating from `.api_gateway_config.json`

If you have an existing `.api_gateway_config.json` from before this rename (a flat map of gateways,
without an `aws` key wrapping it), js-recon still reads it correctly: when `.proxy_config.json` has no
`aws` key but its top-level shape matches the legacy flat map, it's used as-is (with a one-time
warning). The next time you run `proxy -i`, `--destroy`, or `--destroy-all`, the file is rewritten
in the new nested `{ "aws": {...} }` shape automatically — no manual editing required.
