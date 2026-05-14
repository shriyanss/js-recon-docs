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
