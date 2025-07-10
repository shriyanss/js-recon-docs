---
sidebar_position: 3
---

# Framework Support

The features available of the tool are developed after researching on specific JavaScript Frameworks, which implies that it would only work on those which are research. This document highllights the same thoroughly

## Lazyload

The feature the download all the lazy loaded, i.e. dynamically loaded, JavaScript files are available for the following frameworks:

- [Next.JS](https://nextjs.org)
- [Nuxt.JS](https://nuxt.com)
- [Svelte](https://svelte.dev)

For all the other apps, the tool will download the JavaScript files that are loaded on the webpage

## API Gateway

This feature is meant to make HTTP requests through AWS IP pool. This means that it could potentially bypass misconfigured/poorly configured firewalls.

However, if the site blocks IP addresses originating from AWS, it might not work, or could even break. To check if the firewall blocks the requests or not, use the [`--feasibility`](./modules/api-gateway.md#check-feasibility) flag.

## Endpoints

The feature to extract the client-side endpoints are available for the following frameworks:

- [Next.JS](https://nextjs.org)

## Strings

The basic feature to extract string can be used against all targets, regardless of the frameworks they use.

## Map

The feature to map all the functions are available only for the following JavaScript frameworks:

- [Next.JS](https://nextjs.org)

## Run

This module automated the flow of other modules, so please refer to specific modules to know the compatibility.
