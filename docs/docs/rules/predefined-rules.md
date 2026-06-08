---
sidebar_position: 3
---

# Predefined rules

The [`js-recon-rules`](https://github.com/shriyanss/js-recon-rules) repository ships with a curated set of rules that the [`analyze`](../modules/analyze.md) module evaluates against every chunk in `mapped.json` and every operation in the generated OpenAPI spec. The rules below are downloaded automatically the first time you run `js-recon analyze` (or any flow that depends on it, such as [`run`](../modules/run.md)) and are stored in `$HOME/.js-recon/rules`.

Each rule documents:

- **What it looks for** — the AST or request shape that flags a finding.
- **Why it matters** — the class of vulnerability or misconfiguration.
- **How it is kept precise** — the constraints that suppress obvious false positives.

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

These rules are evaluated by the [AST engine](./engines/ast-engine.md) against every chunk recovered by `map` (Next.js with both webpack and Turbopack bundlers, and Vue.js with Vite — production builds and dev-server output). Each rule declares the frameworks it applies to via its `tech:` list; the engine skips a rule on bundles whose framework isn't in that list.

### `detect_postMessage` — `postMessage` event listeners

`severity: info`

Flags `window.addEventListener("message", handler)` calls. postMessage handlers are a frequent source of cross-origin XSS / privilege-escalation bugs — this rule simply inventories every listener so a reviewer can audit them.

### `detect_postMessage_innerHtml_sink` — `postMessage` handler that writes to `innerHTML`

`severity: medium`

Chains the postMessage listener detection with a check that the handler function assigns to `.innerHTML`. The combination is a classic stored-DOM-XSS pattern: if the listener doesn't validate `event.origin` and `event.data`, an attacker who controls a framed/embedded page can inject HTML into the parent.

### `detect_dom_xss_innerHTML_url_source` — DOM XSS via URL parameter to `innerHTML`

`severity: high`
`tech: [next, vue]`

Detects the `URL → innerHTML` taint pattern. Fires when the same chunk contains both:

1.  A read from a URL-derived source — any of: `new URLSearchParams(...).get(...)`, `window.location.search`, `window.location.hash`, `document.referrer`, `document.URL`, or a call to `useSearchParams()` (Next.js / React Router).
2.  A dynamic assignment to `.innerHTML` or `.outerHTML` — that is, the right-hand side is **not** a `StringLiteral`, `NumericLiteral`, `BooleanLiteral`, or `NullLiteral`.

Both halves must appear in the same module/chunk for the rule to fire. This excludes the React-internal `innerHTML` writes in vendor chunks (those chunks never read from a URL parameter). For Vue.js single-file components the Vite-transformed `setup()` body (for example, `headingRef.value.innerHTML = ...`) matches the same shape.

Typical compiled match (`app/search/page.tsx`):

```js
let e = new URLSearchParams(window.location.search).get("q") || "";
i.current.innerHTML = `Showing results for: <strong>${e}</strong>`;
```

### `detect_cspt_fetch_url_param` — Client-Side Path Traversal (CSPT)

`severity: high`
`tech: [next, vue]`

Detects the `URL → fetch URL` traversal pattern. Fires when the same chunk contains both:

1.  A read from a URL-derived source (same set as the rule above, plus `useParams()` for App Router dynamic segments, and `useRoute()` for Vue Router). To survive minification of production Vite/webpack bundles — where the local `route` binding becomes a 2-character name but the Vue Router property names do not — the rule also matches any member expression of the shape `<obj>.query.<X>` or `<obj>.params.<X>`.
2.  A `fetch(...)` (or `*.fetch(...)`) call whose first argument is a **dynamically constructed URL** — either a `TemplateLiteral` containing at least one interpolation, or a `BinaryExpression` doing string concatenation (`'/api/foo/' + x`).

The browser collapses `..` segments **before** the request hits the server, so an attacker who controls the interpolated value can pivot the fetch to a different API path. This is exactly the CSPT pattern (for example, `?file=../users/1` causing `fetch('/api/docs/' + file)` to hit `/api/users/1`).

Typical compiled match (`app/docs/page.tsx`):

```js
let e = new URLSearchParams(window.location.search).get("file") || "readme";
fetch(`/api/docs/${e}`);
```

To suppress the warning legitimately, allowlist-validate the parameter or wrap it in `encodeURIComponent(...)` (which prevents `..` and `/` from surviving normalisation).

### `detect_dom_xss_dangerouslySetInnerHTML` — XSS via raw-HTML sink (`dangerouslySetInnerHTML` / `v-html`)

`severity: high`
`tech: [next, vue]`

Detects raw-HTML rendering sinks where the value is **not** a literal. Covers two compiled shapes:

- React's `dangerouslySetInnerHTML={{ __html: X }}` — compiled to an `ObjectProperty` with key `__html`.
- Vue's `v-html="X"` directive — compiled by Vite/Vue's template compiler to an `ObjectProperty` `{ innerHTML: X }` (paired with a `["innerHTML"]` patchFlag tuple).

The rule fires when the property value is _not_ a `StringLiteral`, `TemplateLiteral`, `NullLiteral`, `NumericLiteral`, or `BooleanLiteral` — that is, it's a member access, identifier, or call result.

To minimise false positives from vendor chunks that include CSS-only uses of these sinks (which never appear alongside `fetch`), the rule additionally requires a `fetch(...)` call **in the same chunk**. The combination is a strong indicator that the HTML being rendered comes from a server response — for example, a comment body, post content, or any other user-controllable record.

Typical compiled match (React, `app/post/[id]/page.tsx`):

```jsx
<div dangerouslySetInnerHTML={{ __html: comment.content }} />
```

Compiled to:

```js
{
    dangerouslySetInnerHTML: {
        __html: o.content;
    }
}
```

Typical compiled match (Vue, `src/views/PostDetail.vue`):

```vue
<div class="comment-content" v-html="comment.content" />
```

Compiled by Vite to:

```js
_createElementVNode("div", _mergeProps({ class: "comment-content" }, { innerHTML: comment.content }), null, 16, ["innerHTML"]);
```

### `detect_open_redirect_url_param` — DOM-based open redirect

`severity: high`

Fires when a URL-derived value co-occurs with a navigation sink in the same chunk. Sinks: `window.location.href = X`, `location.assign(X)`, `location.replace(X)`, `window.open(X)`. Classic OAuth/SSO `?next=`-style abuse; without an origin/path allowlist, the attacker picks where the victim lands after auth.

### `detect_cookie_manipulation_url_param` — DOM-based cookie manipulation

`severity: high`

Fires when a URL-derived value co-occurs with `document.cookie =` in the same chunk. Beyond setting an unexpected cookie value, a `;`-injected attribute (Path, Domain, Expires) can pin a cookie the application then trusts; if the value is later read back into `.innerHTML`, the rule pair also chains into stored DOM XSS.

### `detect_websocket_url_poisoning` — WebSocket URL poisoning

`severity: high`

Fires when a URL-derived value co-occurs with `new WebSocket(...)` in the same chunk. An attacker who controls the WebSocket endpoint URL can push arbitrary frames to the victim page — UI tampering, data injection, or chained XSS depending on how the messages are rendered.

### `detect_dom_setattribute_url_param` — DOM-Data manipulation via `setAttribute`

`severity: high`

Fires when a URL-derived value co-occurs with `element.setAttribute(name, value)` where `name` is one of the script/CSS/HTML-execution attributes: `src`, `href`, `srcdoc`, `action`, `formaction`, `background`, `poster`, `style`, `data`, `xlink:href`. `src`/`href` accept `javascript:` URIs, `style` enables CSS injection, `srcdoc` permits direct HTML injection into iframes. The attribute-name allowlist suppresses the bulk of legitimate `setAttribute` traffic (`class`, `id`, `aria-*`, `data-*`).

### `detect_storage_manipulation_url_param` — HTML5 storage poisoning

`severity: high`

Fires when a URL-derived value co-occurs with `localStorage.setItem(...)` or `sessionStorage.setItem(...)` in the same chunk. Because storage persists across visits, a single poisoning URL plants a payload that fires on every subsequent page load — especially dangerous when the stored value is later read back into a DOM sink.

### `detect_js_injection_eval` — JavaScript injection via `eval` / `Function` / `setTimeout`-string

`severity: high`

Fires when a URL-derived value co-occurs with one of: `eval(X)`, `window.eval(X)`, `new Function(X)`, `setTimeout(<string>, ...)`, `setInterval(<string>, ...)` in the same chunk. These sinks execute their argument as JavaScript in the page origin — full DOM-XSS / arbitrary-code-execution primitives. The `setTimeout`/`setInterval` variants exclude the safe function-callback forms via `:not([arguments.0.type="ArrowFunctionExpression"])` etc.

### `detect_json_injection_to_dangerouslysetinnerhtml` — Client-Side JSON Injection into React render

`severity: high`

Three-way co-occurrence rule: URL-derived value + `JSON.parse(...)` + dynamic `dangerouslySetInnerHTML` in the same chunk. The pattern `JSON.parse(searchParams.get("config"))` flowing into a React render gives an attacker a stored-style XSS via JSON field values. Tighter than the plain `dangerouslySetInnerHTML` rule because all three signals must be present.

### `detect_ajax_header_manipulation` — Ajax request-header manipulation

`severity: high`

Fires when a URL-derived value co-occurs with a `fetch()` call whose `headers` object contains a computed-key property (`{ [k]: v }`). Lets an attacker spoof `Authorization`, `X-Forwarded-For`, `X-Admin-Override`, or any other header that backend middleware trusts for access control.

### `detect_link_manipulation_href` — Link manipulation (`javascript:` URI sink)

`severity: high`

Fires when a URL-derived value co-occurs with an `element.href = X` assignment **other than** `window.location.href` (covered by the open-redirect rule), or with `.setAttribute("href", X)`. When the element is clickable, `X = "javascript:alert(1)"` executes in the page origin on click.

### `detect_redos_url_param` — DOM-based ReDoS

`severity: medium`

Fires when a URL-derived value co-occurs with `new RegExp(pattern)` / `RegExp(pattern)` where `pattern` is not a string/regex literal. JavaScript is single-threaded — a catastrophic-backtracking pattern from the URL freezes the victim tab.

---

## Tuning false positives vs. false negatives

These rules sit on a spectrum:

- **Loose enough to generalise.** The URL-source clause is a union of every common Web-API and Next.js shape, not a single pattern. The sink clauses cover `TemplateLiteral`, `BinaryExpression`-concatenation, and bare identifiers — so the rules catch hand-rolled string-builders alongside the canonical template-literal form.
- **Strict enough to suppress noise.** Every taint rule requires both a source pattern _and_ a sink pattern in the same module. Pure sink-presence (for example, an `innerHTML` write inside a React vendor chunk) does not fire — those chunks never read from `location.search`.

If you do hit a false positive in a vendor chunk, the right fix is usually to extend the rule's `:not(...)` exclusions or to scope the sink step with `inScopeOf` so it must sit inside the same enclosing function as the source. See the [AST engine docs](./engines/ast-engine.md#inscopeof--scoping-an-esquery-to-a-previous-match) for the scoping primitive.
