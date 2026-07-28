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

Each command's `-i/--init` writes its configuration to a single shared config file (default
`.proxy_config.json`), so only one method is "active" at a time — whichever command you last ran
`-i` on sets the active `method`, but re-running `-i` on a different command doesn't discard the
other methods' saved configurations. See each command's page for its specific flags and examples.

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

A legacy `.api_gateway_config.json`-shaped flat map (from before this command was renamed from
`api-gateway`) is auto-detected and migrated to the `{ "aws": {...} }` shape the next time you
create or destroy an AWS gateway.

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
