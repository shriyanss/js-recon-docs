import React from "react";
import JSZip from "jszip";

const TEMPLATES: Record<string, string> = {
    "nextjs-detect.yaml": `id: nextjs-detect

info:
    name: Next.js - Detect
    author: shriyanss
    severity: info
    description: |
        Detects the presence of a Next.js application by looking for the default
        "_next/" static asset directory path in src, srcset, or imageSrcSet
        attributes in the HTTP response body.
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
`,

    "react-detect.yaml": `id: react-detect

info:
    name: React.js - Detect
    author: shriyanss
    severity: info
    description: |
        Detects the presence of a React.js application by looking for React-specific
        internal identifiers (__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
        __REACT_DEVTOOLS_GLOBAL_HOOK__, react-jsx-runtime.production,
        react-dom.production, __reactRouterVersion) or SSR-rendered React
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
                - "react-jsx-runtime.production"
                - "react-dom.production"
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
`,

    "react-detect-scripts.yaml": `id: react-detect-scripts

info:
    name: React.js - Detect (script scan)
    author: shriyanss
    severity: info
    description: |
        Detects React by extracting the first external <script src> from the page
        and scanning its bundle content for React-specific internal identifiers.
        Excludes Next.js applications. For best coverage run against all script URLs.
    tags: tech,react

flow: |
    http(1)
    let src = template["script-src"]
    if (src && src != "") {
        if (src.startsWith("http://") || src.startsWith("https://")) {
            set("resolved-script", src)
        } else {
            let base = template.BaseURL.replace(/\\/$/, "")
            let path = src.startsWith("/") ? src : "/" + src
            set("resolved-script", base + path)
        }
        http(2)
    }

http:
    - method: GET
      path:
          - "{{BaseURL}}"

      extractors:
          - type: regex
            name: script-src
            part: body
            regex:
                - '<script[^>]+src="([^"]+\\.js[^"]*)"'
            group: 1
            internal: true

    - method: GET
      path:
          - "{{resolved-script}}"

      matchers-condition: and
      matchers:
          - type: word
            part: body
            words:
                - "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED"
                - "__REACT_DEVTOOLS_GLOBAL_HOOK__"
                - "react-jsx-runtime.production"
                - "react-dom.production"
                - "__reactRouterVersion"
            condition: or

          - type: status
            status:
                - 200
`,

    "vuejs-detect.yaml": `id: vuejs-detect

info:
    name: Vue.js - Detect
    author: shriyanss
    severity: info
    description: |
        Detects the presence of a Vue.js application by looking for "data-v-" or
        "data-vue-" HTML tag attributes in the HTTP response body. Nuxt.js (built on
        Vue) will also match this template; use the Nuxt.js template to distinguish.
    tags: tech,vuejs

http:
    - method: GET
      path:
          - "{{BaseURL}}"

      matchers-condition: and
      matchers:
          - type: regex
            part: body
            regex:
                - 'data-v-[a-zA-Z0-9]+'
                - 'data-vue-[a-zA-Z0-9]+'
            condition: or

          - type: status
            status:
                - 200
`,

    "nuxtjs-detect.yaml": `id: nuxtjs-detect

info:
    name: Nuxt.js - Detect
    author: shriyanss
    severity: info
    description: |
        Detects the presence of a Nuxt.js application by looking for "/_nuxt"
        in src or href attributes of HTML elements in the HTTP response body.
    tags: tech,nuxtjs

http:
    - method: GET
      path:
          - "{{BaseURL}}"

      matchers-condition: and
      matchers:
          - type: regex
            part: body
            regex:
                - '(src|href)="[^"]*/_nuxt[^"]*"'

          - type: status
            status:
                - 200
`,

    "svelte-detect.yaml": `id: svelte-detect

info:
    name: Svelte / SvelteKit - Detect
    author: shriyanss
    severity: info
    description: |
        Detects the presence of a Svelte or SvelteKit application by looking for
        "svelte-" prefixed class names or element IDs, or the "data-sveltekit-reload"
        attribute in the HTTP response body.
    tags: tech,svelte,sveltekit

http:
    - method: GET
      path:
          - "{{BaseURL}}"

      matchers-condition: and
      matchers:
          - type: regex
            part: body
            regex:
                - 'class="[^"]*svelte-[a-zA-Z0-9]+'
                - 'id="[^"]*svelte-[a-zA-Z0-9]+'
                - 'data-sveltekit-reload'
            condition: or

          - type: status
            status:
                - 200
`,

    "angular-detect.yaml": `id: angular-detect

info:
    name: Angular - Detect
    author: shriyanss
    severity: info
    description: |
        Detects the presence of an Angular application by extracting the main-*.js
        script URL from the page and scanning its contents for Angular-specific
        markers (isAngularZone, ngZone, routerLink).
    tags: tech,angular

flow: |
    http(1)
    let src = template["main-js-src"]
    if (src && src != "") {
        if (src.startsWith("http://") || src.startsWith("https://")) {
            set("resolved-main-js", src)
        } else {
            let base = template.BaseURL.replace(/\\/$/, "")
            let path = src.startsWith("/") ? src : "/" + src
            set("resolved-main-js", base + path)
        }
        http(2)
    }

http:
    - method: GET
      path:
          - "{{BaseURL}}"

      extractors:
          - type: regex
            name: main-js-src
            part: body
            regex:
                - '<script[^>]+src="([^"]*main-[^"]*\\.js[^"]*)"'
            group: 1
            internal: true

    - method: GET
      path:
          - "{{resolved-main-js}}"

      matchers-condition: and
      matchers:
          - type: regex
            part: body
            regex:
                - 'isAngularZone\\(\\)'
                - '"isAngularZone"'
                - 'this\\.ngZone'
                - '"routerLink"'
            condition: or

          - type: status
            status:
                - 200
`,
};

export default function NucleiDownloadButton(): JSX.Element {
    const handleDownload = async () => {
        const zip = new JSZip();
        for (const [filename, content] of Object.entries(TEMPLATES)) {
            zip.file(filename, content);
        }
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "js-recon-nuclei-templates.zip";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleDownload}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 1.1rem",
                marginBottom: "1.5rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#fff",
                background: "var(--ifm-color-primary)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
            }}
        >
            ⬇ Download All Templates (.zip)
        </button>
    );
}
