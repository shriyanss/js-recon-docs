---
sidebar_position: 3
---

# Docker Installation

JS Recon can be also used with docker. This can be installed in a single command, however, it creates some additional steps after tool run which is not required for the normal installation. Those steps are demonstrated later in this document.

:::warning
The image is only available for `amd64` architecture. For users running `arm64` architecture, the image is virtualized, which is slow. Read a discussion on Docker Forum [here](https://forums.docker.com/t/host-system-is-arm64-docker-container-is-amd-x86/140996/4).

^ Important for 🍎 silicon users
:::

:::danger
Apple's [`container`](https://github.com/apple/container) CLI tool does **not** work for running JS Recon. It cannot virtualize the `amd64` architecture, so pulling and running the image fails:

```bash
% container run --rm ghcr.io/js-recon/js-recon
Error: platform linux/arm64
```

Continue using Docker Desktop, Colima, or another OCI-compliant runtime that supports `amd64` emulation instead.
:::

## Installation

You can get started with just pulling the image from the GitHub Container Registry:

```bash
docker pull ghcr.io/js-recon/js-recon:latest
```

This will pull the image on your local machine.

:::tip
You can try the `alpha` and `beta` builds as well. They are updated more often than the stable version, often daily, but are not as stable.

To download the `alpha` build, use the following command:

```bash
docker pull ghcr.io/js-recon/js-recon:alpha
```

To download the `beta` build, use the following command:

```bash
docker pull ghcr.io/js-recon/js-recon:beta
```

:::

## Rules-bundled image (`-w-rules`)

Every tag above (`latest`, `alpha`, `beta`, and specific versions) has a matching `-w-rules` tag that ships with [JS Recon Rules](./rules/README.md) already downloaded into `~/.js-recon/rules` inside the image. Use it when you don't want the tool to reach out to GitHub for rules on first run — for example, on an air-gapped host, or to shave a few seconds off startup during a mass scan.

```bash
docker pull ghcr.io/js-recon/js-recon:latest-w-rules
```

The `-w-rules` image also sets the `JS_RECON_DISABLE_RULES_VERSION_CHECK` environment variable to `true` by default, which corresponds to the [`--disable-rules-version-check`](./modules/analyze.md) flag. With it set, `analyze` and `run` skip the GitHub version-check request entirely and use whatever rules are already present in the container, instead of checking whether a newer release exists. If you want the container to still check for rule updates over the network, override the variable at run time:

```bash
docker run -it -e JS_RECON_DISABLE_RULES_VERSION_CHECK=false ghcr.io/js-recon/js-recon:latest-w-rules <js_recon_arguments>
```

## Running JS Recon

You can run JS Recon using the following command:

```bash
docker run -it ghcr.io/js-recon/js-recon <js_recon_arguments>
```

For example, to run the [`lazyload` module](./modules/lazyload.md), you can use the following command:

```bash
docker run -it ghcr.io/js-recon/js-recon lazyload -u https://app.example.com
```

The results will be stored in the `/home/pptruser` directory inside the container. You should copy it before deleting the container.

:::danger
Do not use `--rm` flag with the `docker run` command. It will delete the container after the run, which will delete the results as well.
:::

## Mounting a local output directory

Instead of copying results out with `docker cp` after the container exits, you can bind-mount a local directory straight to the container's output directory:

```bash
docker run -it -v $(pwd)/output:/home/pptruser/output ghcr.io/js-recon/js-recon run -u https://app.example.com
```

Docker creates the local `output/` directory on the host the moment the mount is set up, before `run` ever starts — so from the tool's point of view, the output directory already exists on every run, mounted or not. The official images set the `JS_RECON_OUTPUT_OVERWRITE` environment variable to `true` by default (equivalent to the [`--output-overwrite`](./modules/run.md) flag) and pre-create an empty `output/` directory, so this works out of the box instead of failing with the "output directory already exists" error. If you want the container to keep the original strict behavior, override the variable at run time:

```bash
docker run -it -e JS_RECON_OUTPUT_OVERWRITE=false ghcr.io/js-recon/js-recon <js_recon_arguments>
```

## Copying Results

You can copy the results using the following command:

```bash
docker cp <container_id>:/home/pptruser/<file_or_dir_name> <output_directory>
```

There could be multiple other files created based on the module used. You can refer to the docs of [individual modules](../category/modules) to know how to change the output files. Default files/directories are in the `/home/pptruser` directory with the following names:

- [Lazyload](./modules/lazyload.md):
    - `output/` (directory)
- [Strings](./modules/strings.md):
    - `strings.json`
    - `extracted_urls.json`
    - `extracted_urls.txt`
    - `extracted_urls-openapi.json`
- [Endpoints](./modules/endpoints.md):
    - `endpoints.json`
- [Proxy](./modules/proxy.md):
    - `.proxy_config.json` (this is a configuration file, but is worth keeping it if generated)
- [Map](./modules/map.md):
    - `mapped.json`
- [Analyze](./modules/analyze.md):
    - `analyze.json`
- [Report](./modules/report.md):
    - `report.html`
- [Refactor](./modules/refactor.md):
    - `output_refactored/` (directory)
- [Sourcemaps](./modules/sourcemaps.md):
    - `extracted/` (directory)
- [Run](./modules/run.md):
    - This will generate files from all of the above modules

To know the purpose of each file, you should refer to docs of the specific module - which is linked in their names above.
