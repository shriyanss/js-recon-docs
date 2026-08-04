---
sidebar_position: 4
---

# HTTP

`proxy http` configures a generic HTTP proxy for js-recon's outbound requests.

## Usage

```bash
js-recon proxy http -i [options]
```

## Options

| Option                     | Description                                                                | Default              |
| --------------------------- | ----------------------------------------------------------------------------- | --------------------- |
| `--init`, `-i`              | Write the resolved HTTP proxy config to the config file.                      | `false`               |
| `--config <config>`, `-c`   | Name of the shared proxy config file.                                         | `.proxy_config.json` |
| `--url <url>`                | HTTP proxy URL (`http://[user:pass@]host:port`). Prompted interactively (with validation) if omitted. | -       |

### Example

```bash
js-recon proxy http -i --url http://user:pass@proxyhost:8080
```

This writes `{"method": "http", "http": {"url": "http://user:pass@proxyhost:8080"}}` (merged with
any other methods already in the file) to `.proxy_config.json`, and marks `http` as the active
method.

## Using it with `lazyload`/`run`

```bash
js-recon proxy http -i --url http://user:pass@proxyhost:8080
js-recon run -u https://example.com --proxy-config .proxy_config.json
```

See the [proxy command overview](../proxy) for the shared `.proxy_config.json` schema and the
`--proxy-config`/`--ignore-proxy-env` flags on `lazyload`/`run`.
