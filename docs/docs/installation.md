---
sidebar_position: 2
---

# Installation

JS Recon is a Node.js-based, security-focused JavaScript analysis tool built for modern recon workflows.

## Prerequisites

- Node.js 22 or higher
    - Download and install from the official site: https://nodejs.org/en/download
    - Verify installation:

        ```bash
        node -v
        ```

        Ensure it prints `v22.x.x` or higher.

- Browsers
    - JS Recon internally uses Puppeteer to automate Chromium-based browsers.
      Puppeteer installs automatically, no manual setup required.

## Installation

Install the command-line tool globally using NPM:

```bash
npm i -g @shriyanss/js-recon
```

Test the installation:

```bash
js-recon -V
```

## API keys setup

JS Recon requires API access to several services for enhanced analysis.

### AWS API Gateway (used to rotate IP address; optional)

JS Recon requires an AWS API Key (and Secret Key) to use the [`api-gateway`](./modules/api-gateway.md) module for rotating IP addresses while scanning the target

Recommended permission:

- AdministratorAccess for API Gateway

or
at minimum, fine-grained permission accordingly.

The AWS Console can be accessed at https://console.aws.amazon.com/iam/

These keys are 
 to be stored in the `$AWS_ACCESS_KEY_ID` and `$AWS_SECRET_ACCESS_KEY` environment variables

Alternatively, these can be passed directly to the tool through the `--access-key <access-key>` and `--secret-key <secret-key>` flags to the `api-gateway` module. Read the full docs [here](./modules/api-gateway.md)

### OpenAI API (to generate function descriptions; optional)

It is helpful to have the function descriptions generated through AI. To use this feature, the tool needs access to OpenAI API (the alternative provider is Ollama).

To get an API Key:

- Navigate to https://platform.openai.com and log in/sign up
- Once logged in, go to https://platform.openai.com/settings/organization/billing/overview and add credit balance to the OpenAI API account. You can test this with $5, however, you should refer to the prompts on OpenAI's website for the minimum amount
- Now, go to https://platform.openai.com/api-keys, and create a new API key
- Store this in the `$OPENAI_API_KEY` environment variable

Alternatively, this API Key can be directly passed to JS Recon through `--openai-api-key <key>` flag to the `map` module. The full documentation can be found [here](./modules/map.md)
