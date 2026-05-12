---
sidebar_position: 4
---

# Framework support

The features available in the tool are developed after researching on specific JavaScript Frameworks, which implies that it would only work on those which are research. This document highlights the same thoroughly

## Lazyload

The feature the download all the lazy loaded, that's dynamically loaded, JavaScript files are available for the following frameworks:

- [Next.js](https://nextjs.org)
- [Nuxt.js](https://nuxt.com)
- [Svelte](https://svelte.dev)
- [Angular](https://angular.dev)
- [Vue.js](https://vuejs.org)

For all the other apps, the tool downloads the JavaScript files that will be loaded on the webpage

## API gateway

This feature will make HTTP requests to the target through Amazon Web Services IP pool. This means that it could potentially bypass misconfigured/poorly configured firewall rules.

However, if the site blocks IP addresses originating from Amazon Web Services, it might not work, or could even break. To check if the firewall blocks the requests or not, use the [`--feasibility`](./modules/api-gateway.md#check-feasibility) flag.

## Endpoints

The feature to extract the client-side endpoints are available for the following frameworks:

- [Next.js](https://nextjs.org)

## Strings

This feature can be used against all target, regardless of the frameworks they use.

## Map

The feature to map all the functions are available only for the following JavaScript frameworks:

- [Next.js](https://nextjs.org) — both [Webpack](https://webpack.js.org/) (`self.webpackChunk_N_E`) and [Turbopack](https://turbo.build/pack) (`globalThis.TURBOPACK`) chunk formats are recognised, so projects on Next.js 15 / Turbopack are mapped just like classic Webpack builds.

## Run

This module automated the flow of other modules, so please refer to specific modules to know the compatibility.
