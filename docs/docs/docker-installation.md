---
sidebar_position: 3
---

# Docker Installation

JS Recon can be also used with docker. This can be installed in a single command, however, it creates some additional steps after tool run which is not required for the normal installation. Those steps are demonstrated later in this document.

:::warning
The image is only available for `amd64` architecture. For users running `arm64` architecture, the image is virtualized, which is slow. Read a discussion on Docker Forum [here](https://forums.docker.com/t/host-system-is-arm64-docker-container-is-amd-x86/140996/4).

^ Important for 🍎 silicon users
:::

## Installation

You can get started with just pulling the image:

```bash
docker pull docker.io/shriyanss/js-recon:latest
```

This will pull the image on your local machine.

:::tip
You can try the `alpha` and `beta` builds as well. They are updated more often than the stable version, often daily, but are not as stable.

To download the `alpha` build, use the following command:

```bash
docker pull docker.io/shriyanss/js-recon:alpha
```

To download the `beta` build, use the following command:

```bash
docker pull docker.io/shriyanss/js-recon:beta
```
:::

## Running JS Recon

You can run JS Recon using the following command:

```bash
docker run -it shriyanss/js-recon <js_recon_arguments>
```

For example, to run the [`lazyload` module](./modules/lazyload.md), you can use the following command:

```bash
docker run -it shriyanss/js-recon lazyload -u https://app.example.com
```

The results will be stored in the `/home/pptruser` directory inside the container. You should copy it before deleting the container.

:::danger
Do not use `--rm` flag with the `docker run` command. It will delete the container after the run, which will delete the results as well.
:::


## Copying Results

You can copy the results using the following command:

```bash
docker cp <container_id>:/home/pptruser/output <output_directory>
```

The `output` folder contains the downloaded JS files. There could be multiple other files created based on the module used. You can refer to the docs of [individual modules](../category/modules) to know how to change the output files. Default files/directories are in the `/home/pptruser` directory with the following names:
- [Lazyload](./modules/lazyload.md):
    - `output/` (directory)
- [Strings](./modules/strings.md):
    - `strings.json`
    - `extracted_urls.json`
    - `extracted_urls.txt`
    - `extracted_urls-openapi.json`
- [Endpoints](./modules/endpoints.md):
    - `endpoints.json`
- [API Gateway](./modules/api-gateway.md):
    - `.api_gateway_config.json` (this is a configuration file, but is worth keeping it if generated)
- [Map](./modules/map.md):
    - `mapped.json`
- [Run](./modules/run.md):
    - This will generate files from all of the above modules

To know the purpose of each file, you should refer to docs of the specific module - which is linked in their names above.