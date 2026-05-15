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


