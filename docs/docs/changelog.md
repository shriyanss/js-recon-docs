---
sidebar_position: 13
---

# Changelog

This page tracks user-facing changes to js-recon, mirroring the `dev`-branch `CHANGELOG.md` in the tool's own repository.

## 2.0.1-alpha.2 - (unreleased)

### Fixed

- The response cache is now backed by a single SQLite file (`.resp_cache.db`) instead of the previous JSON-based formats. `--cache-file`'s default changed from `.resp_cache.json` to `.resp_cache.db` across `lazyload`, `run`, and `load`. This is a clean break, not an in-place migration — an existing `.resp_cache.json`/`.entries/` directory from a prior version is left untouched but never read again; the first run after upgrading simply starts with an empty cache.
- `load` (Caido/Burp import) now writes each imported entry directly into the SQLite cache instead of building one large in-memory JSON object and serializing it in a single write at the end. This also removes the previous "cache too large to serialize as one JSON string" failure mode entirely.
- `lazyload`'s cache pre-creation step now opens the SQLite cache database up front instead of writing an empty JSON stub; a failure to open it is now a fatal error with a dedicated exit code (`32`) — see [Exit Codes](./exit_codes.md).
