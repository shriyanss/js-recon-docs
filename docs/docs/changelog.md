---
sidebar_position: 13
---

# Changelog

This page tracks user-facing changes to js-recon, mirroring the `dev`-branch `CHANGELOG.md` in the tool's own repository.

## 2.0.1-alpha.3 - 2026-08-13

### Fixed

- `lazyload`'s Svelte/SvelteKit inline-`<script type="module">` boot-pattern scan now also matches a static ES `import ... from "...js"` declaration, in addition to the dynamic `import("...")` call form it already handled. Some SvelteKit builds bootstrap the client via a static import instead of a dynamic one; since the entry chunk seeds the entire downstream chunk-discovery graph, missing it caused the whole crawl to collapse to a single JS file even though framework detection succeeded.

### Security

- Removed the `extract-zip` dependency, which carried a high-severity, unfixed advisory (`GHSA-jmr9-qjv8-65gv`, unvalidated symlink path traversal on archive extraction) with no patched release available upstream. `analyze`'s rules downloader now fetches the `js-recon-rules` release as a tarball and extracts it with the already-depended-on, actively maintained `tar` package instead.

## 2.0.1-alpha.2 - 2026-08-12

### Fixed

- The response cache is now backed by a single SQLite file (`.resp_cache.db`) instead of the previous JSON-based formats. `--cache-file`'s default changed from `.resp_cache.json` to `.resp_cache.db` across `lazyload`, `run`, and `load`. This is a clean break, not an in-place migration — an existing `.resp_cache.json`/`.entries/` directory from a prior version is left untouched but never read again; the first run after upgrading simply starts with an empty cache.
- `load` (Caido/Burp import) now writes each imported entry directly into the SQLite cache instead of building one large in-memory JSON object and serializing it in a single write at the end. This also removes the previous "cache too large to serialize as one JSON string" failure mode entirely.
- `lazyload`'s cache pre-creation step now opens the SQLite cache database up front instead of writing an empty JSON stub; a failure to open it is now a fatal error with a dedicated exit code (`32`) — see [Exit Codes](./exit_codes.md).

### Security

- Removed the `fs` npm package from dependencies. It was never referenced by the codebase and sat unused in `package-lock.json` as an extraneous entry; the `fs` package on npm (distinct from Node's builtin module) is flagged as malicious by OSV (`MAL-2025-21003`).
- Enabled Dependabot version updates for the npm, Docker, and GitHub Actions ecosystems, opening weekly PRs against `dev` so outdated dependencies surface automatically instead of only being caught at release time.

### Added

- `lazyload`/`run` now decode inline (base64 or percent-encoded) `data:` URI sourcemaps found in `//# sourceMappingURL=...` comments — for example, Vite's `build.sourcemap: 'inline'` or webpack's `devtool: 'inline-source-map'`/`eval-source-map` — instead of treating the reference as a fetchable URL and losing the sourcemap entirely. Handled for every framework the crawler supports: React, Vue, and Svelte gained a `data:` branch; Next.js, Angular, and Nuxt gained sourcemap scanning entirely, where they previously had none.
- Release CI now runs a dependency-audit job before publishing to npm, blocking the release if any dependency is a known malicious package.
- `report.html` has a fancier, dark-mode-aware UI: a light/dark theme toggle (defaults to the OS color scheme, persisted via `localStorage`) restyles the navbar, collapsible sections, and the findings/mapped views; severity values render as colored badges. `report.html` no longer depends on any CDN to render correctly, including when opened directly via `file://`.
- New `-H/--header <name: value>` flag for authenticated scanning: repeatable, parses each value as `Name: Value` and applies it to every outbound request path (direct, SOCKS, HTTP, Oxylabs, AWS, and Puppeteer page loads). Available on `lazyload`, `run`, and `exploit`.
