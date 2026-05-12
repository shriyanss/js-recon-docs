---
sidebar_position: 3
---

# Predefined rules

The [`js-recon-rules`](https://github.com/shriyanss/js-recon-rules) repository ships with a curated set of rules that the [`analyze`](../modules/analyze.md) module evaluates against every chunk in `mapped.json` and every operation in the generated OpenAPI spec. The rules below are downloaded automatically the first time you run `js-recon analyze` (or any flow that depends on it, such as [`run`](../modules/run.md)) and are stored in `$HOME/.js-recon/rules`.

Each rule documents:

-   **What it looks for** — the AST or request shape that flags a finding.
-   **Why it matters** — the class of vulnerability or misconfiguration.
-   **How it is kept precise** — the constraints that suppress obvious false positives.

If you write your own rules and want them to follow the same pattern, see [Creating new rules](./creating_new_rules.md) and the [AST engine reference](./engines/ast-engine.md).

---

## Request rules

These rules are evaluated by the [request engine](./engines/request-engine.md) against the OpenAPI spec that `map` and `strings` produce for the target.

### `api_path` — API endpoint detection

`severity: info`

Marks any operation whose path contains `/api/`. Pure inventory rule — it doesn't imply a vulnerability, it just makes the API surface easy to spot in the report.

### `admin_api` — Admin API endpoint detection

`severity: info`

Marks operations whose path contains both `/api/` and `admin`. Useful for prioritising review of privileged endpoints exposed to the client.

### `missing_authorization_header` — Missing `Authorization` header

`severity: medium`

Fires when an OpenAPI operation has no `Authorization` header. The rule is intentionally simple — many endpoints _legitimately_ do not require authentication (login, marketing pages, etc.) — but on a Next.js/React app that depends on user identity, it surfaces the endpoints worth inspecting for missing auth.

---

## AST rules

These rules are evaluated by the [AST engine](./engines/ast-engine.md) against every chunk recovered by `map` (currently Next.js with both Webpack and Turbopack bundlers).

### `detect_postMessage` — `postMessage` event listeners

`severity: info`

Flags `window.addEventListener("message", handler)` calls. Postmessage handlers are a frequent source of cross-origin XSS / privilege-escalation bugs — this rule simply inventories every listener so a reviewer can audit them.

### `detect_postMessage_innerHtml_sink` — `postMessage` handler that writes to `innerHTML`

`severity: medium`

Chains the postmessage listener detection with a check that the handler function assigns to `.innerHTML`. The combination is a classic stored-DOM-XSS pattern: if the listener doesn't validate `event.origin` and `event.data`, an attacker who controls a framed/embedded page can inject HTML into the parent.

### `detect_dom_xss_innerHTML_url_source` — DOM XSS via URL parameter to `innerHTML`

`severity: high`

Detects the `URL → innerHTML` taint pattern. Fires when the same chunk contains both:

1.  A read from a URL-derived source — any of: `new URLSearchParams(...).get(...)`, `window.location.search`, `window.location.hash`, `document.referrer`, `document.URL`, or a call to `useSearchParams()` (Next.js / React Router).
2.  A dynamic assignment to `.innerHTML` or `.outerHTML` — i.e. the right-hand side is **not** a `StringLiteral`, `NumericLiteral`, `BooleanLiteral`, or `NullLiteral`.

Both halves must appear in the same module/chunk for the rule to fire. This excludes the React-internal `innerHTML` writes in vendor chunks (those chunks never read from a URL parameter).

Typical compiled match (`app/search/page.tsx`):

```js
let e = new URLSearchParams(window.location.search).get("q") || "";
i.current.innerHTML = `Showing results for: <strong>${e}</strong>`;
```

### `detect_cspt_fetch_url_param` — Client-Side Path Traversal (CSPT)

`severity: high`

Detects the `URL → fetch URL` traversal pattern. Fires when the same chunk contains both:

1.  A read from a URL-derived source (same set as the rule above, plus `useParams()` for App Router dynamic segments).
2.  A `fetch(...)` (or `*.fetch(...)`) call whose first argument is a **dynamically-constructed URL** — either a `TemplateLiteral` containing at least one interpolation, or a `BinaryExpression` doing string concatenation (`'/api/foo/' + x`).

The browser collapses `..` segments **before** the request hits the server, so an attacker who controls the interpolated value can pivot the fetch to a different API path. This is exactly the CSPT pattern (e.g. `?file=../users/1` causing `fetch('/api/docs/' + file)` to hit `/api/users/1`).

Typical compiled match (`app/docs/page.tsx`):

```js
let e = new URLSearchParams(window.location.search).get("file") || "readme";
fetch(`/api/docs/${e}`);
```

To suppress the warning legitimately, allowlist-validate the parameter or wrap it in `encodeURIComponent(...)` (which prevents `..` and `/` from surviving normalisation).

### `detect_dom_xss_dangerouslySetInnerHTML` — XSS via React `dangerouslySetInnerHTML`

`severity: high`

Detects React's `dangerouslySetInnerHTML={{ __html: X }}` pattern when `X` is **not** a literal. Compiled JSX becomes an `ObjectProperty` with key `__html` and the rule fires when its value is _not_ a `StringLiteral`, `TemplateLiteral`, `NullLiteral`, `NumericLiteral`, or `BooleanLiteral` — i.e. it's a member access, identifier, or call result.

To minimise false positives from Next.js's bundled error-page CSS-only uses of `dangerouslySetInnerHTML` (which never appear alongside `fetch`), the rule additionally requires a `fetch(...)` call **in the same chunk**. The combination is a strong indicator that the HTML being rendered comes from a server response — e.g. a comment body, post content, or any other user-controllable record.

Typical compiled match (`app/post/[id]/page.tsx`):

```jsx
<div dangerouslySetInnerHTML={{ __html: comment.content }} />
```

Compiled to:

```js
{ dangerouslySetInnerHTML: { __html: o.content } }
```

---

## Tuning false positives vs. false negatives

These rules sit on a spectrum:

-   **Loose enough to generalise.** The URL-source clause is a union of every common Web-API and Next.js shape, not a single pattern. The sink clauses cover `TemplateLiteral`, `BinaryExpression`-concatenation, and bare identifiers — so the rules catch hand-rolled string-builders alongside the canonical template-literal form.
-   **Strict enough to suppress noise.** Every taint rule requires both a source pattern _and_ a sink pattern in the same module. Pure sink-presence (e.g. an `innerHTML` write inside a React vendor chunk) does not fire — those chunks never read from `location.search`.

If you do hit a false positive in a vendor chunk, the right fix is usually to extend the rule's `:not(...)` exclusions or to scope the sink step with `inScopeOf` so it must sit inside the same enclosing function as the source. See the [AST engine docs](./engines/ast-engine.md#inscopeof--scoping-an-esquery-to-a-previous-match) for the scoping primitive.
