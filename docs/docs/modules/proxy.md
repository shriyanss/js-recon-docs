---
sidebar_position: 14
---

# Proxy command

The `proxy` command configures and manages an outbound proxy used to route js-recon's requests
through something other than your own IP — useful against targets that rate-limit by IP, or
when you want to route through a specific provider.

Four provider commands are available, each covering one method:

| Command         | Method                                            | Reference                  |
| --------------- | -------------------------------------------------- | --------------------------- |
| `proxy aws`     | Throwaway AWS API Gateway REST APIs (IP rotation) | [AWS](./proxy/aws)          |
| `proxy oxylabs` | Oxylabs datacenter proxy                          | [Oxylabs](./proxy/oxylabs)  |
| `proxy socks`   | Generic SOCKS5 proxy                              | [SOCKS](./proxy/socks)      |
| `proxy http`    | Generic HTTP proxy                                | [HTTP](./proxy/http)        |

The resolved proxy is used by every module that makes outbound HTTP requests: `lazyload` (including
its Puppeteer-driven page visits), the shared request client used across the tool, and the `analyze`
rules-download step.

**Configuration is one-directional.** The `proxy` subcommands are the only place you set credentials —
they write everything to `.proxy_config.json`. `lazyload` and `run` only ever _read_ that file (plus
environment variables); they don't accept method or credential flags at all. This keeps credentials out
of every `lazyload`/`run` invocation and out of its shell history — it does not make the initial `proxy
<method> -i` step itself safe from shell-history exposure; see the flag warnings on each method's page
for that.

Each subcommand's `-i/--init` writes its configuration to the single shared config file (default
`.proxy_config.json`), so only one method is "active" at a time — whichever subcommand you last ran
`-i` on sets the active `method`, but re-running `-i` on a different subcommand doesn't discard the
other methods' saved configurations. See each command's page for its specific flags and examples.

## Check feasibility

Every proxy subcommand accepts `--feasibility`/`--feasibility-url` to check whether using that method
actually helps against a target's firewall/WAF:

1. It requests `--feasibility-url` directly, without any proxy. If no firewall is detected, a proxy
   isn't needed for this target -- the tool prints a message and exits with code `27`.
2. If a firewall **is** detected on the direct request, it retries through the subcommand's configured
   method (its flags, or whatever is already saved via `-i/--init` in the config file) up to 10 times.
    - If the firewall is still detected through the proxy, it exits with code `28` -- the proxy
      doesn't help here.
    - If the firewall is no longer detected, it prints a message recommending the proxy and exits
      with code `0`.

See [Exit Codes](../exit_codes.md) for the full list.

```bash
# Uses the method already configured via -i/--init in .proxy_config.json
js-recon proxy socks --feasibility --feasibility-url https://example.com

# Or specify the method's fields directly, without configuring one first
js-recon proxy socks --feasibility --feasibility-url https://example.com \
  --url socks5://user:pass@127.0.0.1:1080
```

## `.proxy_config.json` schema

A single file holds one key per method plus the currently active `method`:

```json
{
    "method": "socks",
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
    },
    "socks": {
        "url": "socks5://user:pass@host:1080"
    },
    "http": {
        "url": "http://user:pass@host:8080"
    },
    "oxylabs": {
        "username": "...",
        "password": "...",
        "country": "US"
    }
}
```

## Migrating from `.api_gateway_config.json`

If you have an existing `.api_gateway_config.json` from before this rename (a flat map of gateways,
without an `aws` key wrapping it), js-recon still reads it correctly: when `.proxy_config.json` has no
`aws` key but its top-level shape matches the legacy flat map, it's used as-is (with a one-time
warning). The next time you run `proxy aws -i`, `--destroy`, or `--destroy-all`, the file is rewritten
in the new nested `{ "aws": {...} }` shape automatically -- no manual editing required.

## Flags available on `lazyload` and `run`

`lazyload` and `run` take these flags to route their outbound requests through whichever method
is active in the proxy config file. Both are declared identically on both commands.

| Option                  | Description                                                                                  | Default               |
| ----------------------- | ---------------------------------------------------------------------------------------------- | ---------------------- |
| `--proxy-config <file>` | Proxy config file to read (generated via `js-recon proxy <method> -i`).                        | `.proxy_config.json`  |
| `--ignore-proxy-env`    | Skip `JS_RECON_PROXY_*`/`JS_RECON_OXYLABS_*` environment variables during config resolution.    | `false`               |

The active method/credentials are resolved with **CLI flag > environment variable > config file**
precedence per field. `lazyload`/`run` only ever pass a config file reference — there is no
per-run CLI override for method or credentials; configure those via the `proxy` subcommands.

Environment variables consulted (unless `--ignore-proxy-env` is set): `JS_RECON_PROXY_METHOD`,
`JS_RECON_PROXY_URL`, `JS_RECON_OXYLABS_USERNAME`, `JS_RECON_OXYLABS_PASSWORD`,
`JS_RECON_OXYLABS_COUNTRY`, `JS_RECON_OXYLABS_CITY`, `JS_RECON_OXYLABS_SESSION_ID`.

### Example

```bash
js-recon proxy socks -i --url socks5://user:pass@proxyhost:1080
js-recon run -u https://example.com --proxy-config .proxy_config.json
```

## How the resolved proxy is used

Once resolved, the proxy is wired into both the tool's own HTTP requests and its Puppeteer-driven
page visits:

- **HTTP requests** — routed through an `undici` `Socks5ProxyAgent` (`socks` method) or
  `ProxyAgent` (`http`/`oxylabs` methods). The `aws` method instead proxies requests through a
  provisioned API Gateway REST API (see [AWS](./proxy/aws)).
- **Puppeteer** — launched with a `--proxy-server=` argument derived from the resolved method,
  plus `page.authenticate()` for methods with credentials.
