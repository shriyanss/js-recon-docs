---
sidebar_position: 9
---

# Nuclei Templates

While JS Recon can detect and skip targets based on technology they use, it could be helpful to use a scanner like [Nuclei](https://github.com/projectdiscovery/nuclei) to detect if a target is running a particular framework or not. This page contains the nuclei templates for the same.

## Next.js

```yaml
id: nextjs-detect

info:
    name: Next.js - Detect
    author: shriyanss
    severity: info
    description: |
        Detects the presence of a Next.js application by looking for the default
        "_next/" static asset directory path in the HTTP response body.
    tags: tech,nextjs

http:
    - method: GET
      path:
          - "{{BaseURL}}"

      matchers-condition: and
      matchers:
          - type: word
            part: body
            words:
                - "_next/"
                - "/_next/static"
            condition: or

          - type: status
            status:
                - 200
```

## React

The following template detects React by looking for React-specific internal identifiers — the same signatures that JS Recon checks in JavaScript bundle files. It excludes Next.js applications (which are React-based but detected separately) by negating any response containing `_next/`:

```yaml
id: react-detect

info:
    name: React.js - Detect
    author: shriyanss
    severity: info
    description: |
        Detects the presence of a React.js application by looking for React-specific
        internal identifiers (__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
        __REACT_DEVTOOLS_GLOBAL_HOOK__, __reactRouterVersion) or SSR-rendered React
        attributes (data-reactroot, data-react-checksum) in the HTTP response body.
        Excludes Next.js applications.
    tags: tech,react

http:
    - method: GET
      path:
          - "{{BaseURL}}"

      matchers-condition: and
      matchers:
          - type: word
            part: body
            words:
                - "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED"
                - "__REACT_DEVTOOLS_GLOBAL_HOOK__"
                - "__reactRouterVersion"
                - "data-reactroot"
                - "data-react-checksum"
            condition: or

          - type: word
            part: body
            words:
                - "_next/"
            negative: true

          - type: status
            status:
                - 200
```

## Vue

While the following template detects Vue, it also detects Nuxt.js (Nuxt is based on Vue):

```yaml
id: vuejs-detect

info:
    name: Vue.js - Detect
    author: shriyanss
    severity: info
    description: |
        Detects the presence of a Vue.js application by looking for the default
        "data-v-" HTML tag attribute in the HTTP response body.
    tags: tech,vuejs

http:
    - method: GET
      path:
          - "{{BaseURL}}"

      matchers-condition: and
      matchers:
          - type: word
            part: body
            words:
                - "data-v-"
                - "data-vue-"
            condition: or

          - type: status
            status:
                - 200
```
