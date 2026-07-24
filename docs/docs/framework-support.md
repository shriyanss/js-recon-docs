---
sidebar_position: 4
---

# Framework support

The features available in the tool are developed after researching on specific JavaScript Frameworks, which implies that it would only work on those which are research. This document highlights the same thoroughly

## Generic

When a target doesn't match any of the frameworks below, the tool still treats it as a supported target under the `generic` tech, rather than aborting:

- **Lazyload** — falls back to a generic extraction pass: it downloads JS referenced by `<script>`/`<link rel="modulepreload">` tags on the initial page, then recursively crawls the site's own pages (breadth-first, following in-scope `<a href>` links) to find JS the landing page alone doesn't reference — including files referenced only as a string literal inside an already-downloaded file, if `--strings` is set. See [Generic extraction](./modules/lazyload.md#generic-extraction-no-framework-detected).
- **Strings** — runs unmodified against generic targets, since it operates on raw JS content rather than framework-specific structure.
- **Run** — for a generic target, only runs the `lazyload` step; it does not attempt `map`, `analyze`, or `report`, since those steps depend on framework-specific bundle structure.

`generic` isn't supported by **Endpoints**, **Map**, **Analyze**, or **Report** — these require a recognized framework's bundle/chunk format to operate.

## Lazyload

The feature to download all lazy-loaded (dynamically loaded) JavaScript files is available for the following frameworks:

- [Next.js](https://nextjs.org)
- [Nuxt.js](https://nuxt.com)
- [Svelte](https://svelte.dev)
- [Angular](https://angular.dev)
- [Vue.js](https://vuejs.org)
- [React](https://react.dev)

For all other apps, the tool falls back to a generic extraction pass: it downloads JS referenced by `<script>`/`<link rel="modulepreload">` tags on the initial page, plus any other URL on the page whose path contains a `.js`-suffixed segment and whose response `Content-Type` confirms it as JavaScript (see [Lazyload command](./modules/lazyload.md#generic-extraction-no-framework-detected)).

## Proxy (AWS API Gateway method)

This feature will make HTTP requests to the target through Amazon Web Services IP pool. This means that it could potentially bypass misconfigured/poorly configured firewall rules.

However, if the site blocks IP addresses originating from Amazon Web Services, it might not work, or could even break. To check if the firewall blocks the requests or not, use the [`--feasibility`](./modules/api-gateway.md#check-feasibility) flag.

## Endpoints

The feature to extract the client-side endpoints are available for the following frameworks:

- [Next.js](https://nextjs.org)

## Strings

This feature can be used against all target, regardless of the frameworks they use.

## Map

The feature to map all the functions are available only for the following JavaScript frameworks:

- [Next.js](https://nextjs.org) — both [webpack](https://webpack.js.org/) (`self.webpackChunk_N_E`) and [Turbopack](https://turbo.build/pack) (`globalThis.TURBOPACK`) chunk formats are recognised, so projects on Next.js 15 / Turbopack are mapped just like classic webpack builds.
- [Vue.js](https://vuejs.org) — [Vite](https://vitejs.dev) production chunks (2-character function name convention) are decoded into per-function chunks; for non-bundled / dev-server output, each `.js` and `.vue` module is emitted as a single chunk so it remains analyzable.
- [React](https://react.dev) — ES module and webpack chunk formats are supported; `fetch()` calls are resolved using the same taint-flow analysis as Next.js.
- [Svelte/Astro](https://astro.build) — Vite production chunks are decoded using the same logic as Vue.js; `fetch()` and Axios calls are resolved with the same taint-flow analysis.
- [Angular](https://angular.dev) — Angular CLI (esbuild, v17+) bundles are scanned as whole-file chunks; `HttpClient` method calls (`n.get(url)`, `n.post(url, body)`, etc.) and native `fetch()` calls are resolved using the shared HTTP-client and fetch resolvers.

## Analyze

The static-analysis [`analyze`](./modules/analyze.md) module evaluates AST rules against `mapped.json` and request rules against the generated OpenAPI spec for the following frameworks:

- [Next.js](https://nextjs.org)
- [Vue.js](https://vuejs.org)
- [React](https://react.dev)
- [Svelte/Astro](https://astro.build)
- [Angular](https://angular.dev) — includes the Angular-specific `detect_angular_bypass_security_trust` rule that detects `bypassSecurityTrust*` calls (DomSanitizer bypasses)

## Run

This module automated the flow of other modules, so please refer to specific modules to know the compatibility.

The `run` command provides full pipeline support (lazyload → map → analyze → report) for: **Next.js**, **Vue.js**, **Nuxt.js**, **React**, **Svelte/Astro**, and **Angular**.
