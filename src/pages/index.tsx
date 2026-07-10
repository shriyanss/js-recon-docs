import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import PlatformMarquee from "../components/PlatformMarquee";
import styles from "./index.module.css";

// Latest stable release — keep in sync with `lastVersion` in docusaurus.config.ts
const VERSION = "1.3.1";

const PIPELINE_STEPS = [
    { num: "01", name: "lazyload", desc: "Fetch JS from the target URL" },
    { num: "02", name: "strings", desc: "Extract paths, URLs, secrets" },
    { num: "03", name: "map", desc: "Index functions & relationships" },
    { num: "04", name: "analyze", desc: "Run static rules for findings" },
];

interface Capability {
    title: string;
    desc: ReactNode;
    accent: string;
    icon: ReactNode;
}

const CAPABILITIES: Capability[] = [
    {
        title: "Lazyload every chunk",
        accent: "var(--h-red)",
        desc: "Crawl and download every dynamically-loaded JavaScript file — Next.js, Nuxt, Svelte, Angular, Vue, and React — not just what ships on first paint.",
        icon: (
            <path
                d="M12 3v11m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        ),
    },
    {
        title: "Vulnerability detection",
        accent: "var(--h-amber)",
        desc: (
            <>
                The <code>analyze</code> module runs AST and request rules over
                the mapped bundle to surface hardcoded secrets, dangerous sinks,
                and <code>eval()</code> reachable from user input.
            </>
        ),
        icon: (
            <>
                <path
                    d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
                <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </>
        ),
    },
    {
        title: "WAF bypass via IP rotation",
        accent: "var(--h-green)",
        desc: (
            <>
                Route requests through a rotating pool of AWS API Gateway IPs
                with the <code>api-gateway</code> module to slip past IP-based
                firewall and rate-limit rules.
            </>
        ),
        icon: (
            <>
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                />
                <path
                    d="M3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9S14.5 21.6 12 21m0-18C9.5 5.4 8.2 8.6 8.2 12S9.5 18.6 12 21"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                />
            </>
        ),
    },
    {
        title: "Framework-aware analysis",
        accent: "var(--h-accent)",
        desc: "Next.js, React, Vue, Svelte, Astro, and Angular each get a tailored crawl, function map, and endpoint pipeline instead of one generic pass.",
        icon: (
            <path
                d="M12 3 4 6.5v5c0 4.4 3.4 7.5 8 9 4.6-1.5 8-4.6 8-9v-5L12 3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
        ),
    },
    {
        title: "Function & endpoint mapping",
        accent: "var(--h-accent)",
        desc: (
            <>
                Index every function and resolve <code>fetch</code>, Axios, and
                GraphQL calls into a client-side route tree and a ready-to-fuzz
                OpenAPI spec.
            </>
        ),
        icon: (
            <>
                <rect
                    x="9"
                    y="3"
                    width="6"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.6"
                />
                <rect
                    x="3"
                    y="16"
                    width="6"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.6"
                />
                <rect
                    x="15"
                    y="16"
                    width="6"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.6"
                />
                <path
                    d="M12 8v4m0 0H6v4m6-4h6v4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
            </>
        ),
    },
    {
        title: "Automate in CI",
        accent: "var(--h-green)",
        desc: "Run on every build with the GitHub Action or the GitLab CI template — surface source maps, exposed endpoints, and client-side bugs before defenders notice.",
        icon: (
            <>
                <path
                    d="M21 12a9 9 0 1 1-3-6.7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
                <path
                    d="M21 4v5h-5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </>
        ),
    },
];

interface Integration {
    category: string;
    label: string;
    tagline: string;
    href: string;
    /** Icon-tile accent (theme-aware, sits on a light or dark card) */
    accent: string;
    /** Command-highlight accent (always on the dark command strip, fixed) */
    cmdAccent: string;
    icon: ReactNode;
    /** true if the SVG uses fill instead of stroke */
    filled?: boolean;
    prompt?: string;
    cmdPlain?: string;
    cmdHi: string;
    cmdPost?: string;
    copy: string;
    ci?: boolean;
    highlighted?: boolean;
}

const CATEGORY_ORDER = ["Local", "Containers", "CI / CD", "Infra & agents"];

const CYAN = "oklch(0.75 0.14 210)";
const AMBER = "oklch(0.78 0.15 75)";
const RED = "oklch(0.65 0.19 25)";
const PURPLE = "oklch(0.72 0.13 300)";

const INTEGRATIONS: Integration[] = [
    {
        category: "Local",
        label: "npm CLI",
        tagline: "Global install for local recon",
        href: "https://www.npmjs.com/package/@shriyanss/js-recon",
        accent: "var(--h-accent)",
        cmdAccent: CYAN,
        icon: (
            <>
                <path
                    d="M4 17 10 11 4 5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 19h8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                />
            </>
        ),
        prompt: "$",
        cmdPlain: "npm i -g ",
        cmdHi: "@shriyanss/js-recon",
        copy: "npm i -g @shriyanss/js-recon",
    },
    {
        category: "Local",
        label: "Homebrew",
        tagline: "macOS & Linux via the tap",
        href: "https://github.com/shriyanss/homebrew-tap",
        accent: "var(--h-accent)",
        cmdAccent: CYAN,
        icon: (
            <path
                d="M3 10h18M3 10l2-6h14l2 6M3 10v8a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        ),
        prompt: "$",
        cmdPlain: "brew install ",
        cmdHi: "js-recon",
        copy: "brew install js-recon",
    },
    {
        category: "Containers",
        label: "Docker Hub",
        tagline: "Zero-dependency container",
        href: "https://hub.docker.com/r/shriyanss/js-recon",
        accent: "var(--h-amber)",
        cmdAccent: AMBER,
        icon: (
            <>
                <rect
                    x="3"
                    y="8"
                    width="18"
                    height="12"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <path
                    d="M7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
            </>
        ),
        prompt: "$",
        cmdPlain: "docker pull ",
        cmdHi: "shriyanss/js-recon",
        copy: "docker pull shriyanss/js-recon",
    },
    {
        category: "Containers",
        label: "GHCR",
        tagline: "Same image, mirrored on GitHub",
        href: "https://github.com/shriyanss/js-recon/pkgs/container/js-recon",
        accent: "var(--h-amber)",
        cmdAccent: AMBER,
        icon: (
            <path
                d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
        ),
        prompt: "$",
        cmdPlain: "docker pull ",
        cmdHi: "ghcr.io/shriyanss/js-recon",
        copy: "docker pull ghcr.io/shriyanss/js-recon",
    },
    {
        category: "CI / CD",
        label: "GitHub Action",
        tagline: "Drop into any GitHub workflow",
        href: "https://github.com/marketplace/actions/js-recon",
        accent: "var(--h-red)",
        cmdAccent: RED,
        ci: true,
        highlighted: true,
        filled: true,
        icon: (
            <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1.1 2 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.7 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
        ),
        cmdPlain: "uses: ",
        cmdHi: "shriyanss/js-recon-action@v1",
        copy: "uses: shriyanss/js-recon-action@v1",
    },
    {
        category: "CI / CD",
        label: "GitLab CI",
        tagline: "Include the pipeline template",
        href: "https://gitlab.com/shriyanss/js-recon-gitlab-ci",
        accent: "var(--h-amber)",
        cmdAccent: AMBER,
        ci: true,
        icon: (
            <path
                d="M4.5 12 12 4l7.5 8L12 20 4.5 12Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
        ),
        cmdPlain: "include: ",
        cmdHi: "js-recon.gitlab-ci.yml",
        copy: "include: js-recon.gitlab-ci.yml",
    },
    {
        category: "Infra & agents",
        label: "Terraform",
        tagline: "Run on AWS, Azure, GCP & other cloud providers",
        href: "https://registry.terraform.io/modules/shriyanss/js-recon",
        accent: PURPLE,
        cmdAccent: AMBER,
        icon: (
            <>
                <path
                    d="M12 2 2 7l10 5 10-5-10-5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
                <path
                    d="M2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
            </>
        ),
        cmdPlain: "module ",
        cmdHi: '"js_recon"',
        cmdPost: " { … }",
        copy: 'module "js_recon" { … }',
    },
    {
        category: "Infra & agents",
        label: "MCP server",
        tagline: "Drive it from Claude & agents",
        href: "/docs/docs/modules/mcp",
        accent: "var(--h-accent)",
        cmdAccent: CYAN,
        icon: (
            <>
                <rect
                    x="3"
                    y="4"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                />
                <path
                    d="M7 9l3 2.5L7 14M12 14h5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </>
        ),
        prompt: "$",
        cmdPlain: "js-recon ",
        cmdHi: "mcp",
        copy: "js-recon mcp",
    },
];

function CommandRow({ it }: { it: Integration }) {
    const [copied, setCopied] = useState(false);
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "9px 10px 9px 12px",
                borderRadius: "7px",
                background: "var(--h-code-bg)",
                border: "1px solid var(--h-term-border)",
            }}
        >
            <code
                style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "12.5px",
                    color: "var(--h-code-text)",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                }}
            >
                {it.prompt && (
                    <span style={{ color: "var(--h-term-muted)" }}>
                        {it.prompt}{" "}
                    </span>
                )}
                {it.cmdPlain}
                <span style={{ color: it.cmdAccent }}>{it.cmdHi}</span>
                {it.cmdPost}
            </code>
            <button
                type="button"
                aria-label={copied ? "Copied" : "Copy command"}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator.clipboard?.writeText(it.copy);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1300);
                }}
                className={styles.copyBtn}
                style={{ color: copied ? "var(--h-green)" : undefined }}
            >
                {copied ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path
                            d="m5 13 4 4L19 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <rect
                            x="9"
                            y="9"
                            width="12"
                            height="12"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.6"
                        />
                        <path
                            d="M5 15V5a2 2 0 0 1 2-2h10"
                            stroke="currentColor"
                            strokeWidth="1.6"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
}

function IntegrationCard({ it }: { it: Integration }) {
    return (
        <a
            href={it.href}
            {...(it.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            className={styles.integrationCard}
            style={{
                display: "block",
                border: it.highlighted
                    ? "1px solid oklch(0.65 0.19 25 / 0.35)"
                    : "1px solid var(--h-border)",
                borderRadius: "12px",
                background: it.highlighted
                    ? "oklch(0.65 0.19 25 / 0.06)"
                    : "var(--h-card-raised)",
                padding: "20px 22px",
                textDecoration: "none",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "4px",
                }}
            >
                <div
                    style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "7px",
                        background: `color-mix(in oklch, ${it.accent} 15%, transparent)`,
                        color: it.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={it.filled ? "currentColor" : "none"}
                    >
                        {it.icon}
                    </svg>
                </div>
                <div
                    style={{
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "var(--h-text)",
                    }}
                >
                    {it.label}
                </div>
                {it.ci && (
                    <div
                        style={{
                            marginLeft: "auto",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: "5px",
                            background: "oklch(0.65 0.19 25 / 0.16)",
                            color: "var(--h-red)",
                        }}
                    >
                        CI
                    </div>
                )}
            </div>
            <div
                style={{
                    fontSize: "13px",
                    color: "var(--h-text-2)",
                    margin: "0 0 14px 36px",
                }}
            >
                {it.tagline}
            </div>
            <CommandRow it={it} />
        </a>
    );
}

const SECTION: CSSProperties = {
    padding: "0 40px 100px",
    maxWidth: "1240px",
    margin: "0 auto",
};

function SectionHeading({
    eyebrow,
    title,
    subtitle,
}: {
    eyebrow: string;
    title: string;
    subtitle?: string;
}) {
    return (
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
                style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "12px",
                    color: "var(--h-accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "12px",
                }}
            >
                {eyebrow}
            </div>
            <h2
                style={{
                    fontSize: "34px",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    margin: 0,
                    color: "var(--h-text)",
                }}
            >
                {title}
            </h2>
            {subtitle && (
                <p
                    style={{
                        fontSize: "16px",
                        color: "var(--h-text-2)",
                        maxWidth: "600px",
                        margin: "16px auto 0",
                        lineHeight: 1.6,
                    }}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}

export default function Home(): ReactNode {
    return (
        <Layout
            title="JS Recon — Blackbox JS Enumeration & SAST"
            description="JS Recon crawls, maps, and statically analyzes JavaScript in any target — surfacing endpoints, secrets, and dangerous sinks without needing source access."
        >
            {/* ── HERO ─────────────────────────────────────────────────── */}
            <div style={{ position: "relative", background: "var(--h-bg)" }}>
                {/* Full-width gradient orbs — outside the max-width container */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        overflow: "hidden",
                        pointerEvents: "none",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: "-120px",
                            right: "-80px",
                            width: "480px",
                            height: "480px",
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle, oklch(0.65 0.19 25 / 0.14), transparent 70%)",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: "40px",
                            left: "-100px",
                            width: "420px",
                            height: "420px",
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle, oklch(0.75 0.14 210 / 0.12), transparent 70%)",
                        }}
                    />
                </div>

                {/* Constrained content */}
                <div
                    style={{
                        position: "relative",
                        padding: "96px 40px 80px",
                        maxWidth: "1240px",
                        margin: "0 auto",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "56px",
                            alignItems: "center",
                        }}
                        className={styles.heroGrid}
                    >
                        {/* Left column */}
                        <div>
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "6px 12px",
                                    borderRadius: "999px",
                                    background: "var(--h-chip)",
                                    border: "1px solid var(--h-border)",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: "12px",
                                    color: "var(--h-accent)",
                                    marginBottom: "24px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        background: "var(--h-red)",
                                    }}
                                />
                                BLACKBOX JS ENUMERATION + SAST
                            </div>

                            <h1
                                style={{
                                    fontSize: "56px",
                                    lineHeight: "1.04",
                                    fontWeight: 800,
                                    letterSpacing: "-0.03em",
                                    margin: "0 0 20px",
                                    color: "var(--h-text)",
                                }}
                            >
                                Find what's hiding
                                <br />
                                in the client bundle.
                            </h1>

                            <p
                                style={{
                                    fontSize: "18px",
                                    lineHeight: "1.6",
                                    color: "var(--h-text-2)",
                                    maxWidth: "460px",
                                    margin: "0 0 32px",
                                }}
                            >
                                JS Recon crawls, maps, and statically analyzes
                                JavaScript in any target — surfacing endpoints,
                                secrets, and dangerous sinks without needing
                                source access.
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    marginBottom: "40px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <Link
                                    to="/docs/docs/installation"
                                    style={{
                                        padding: "13px 22px",
                                        borderRadius: "8px",
                                        background: "var(--h-btn-bg)",
                                        color: "var(--h-btn-fg)",
                                        fontWeight: 700,
                                        fontSize: "15px",
                                        textDecoration: "none",
                                    }}
                                >
                                    Get Started
                                </Link>
                                <a
                                    href="https://github.com/shriyanss/js-recon"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        padding: "13px 22px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--h-border)",
                                        fontWeight: 700,
                                        fontSize: "15px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        color: "var(--h-text)",
                                        textDecoration: "none",
                                    }}
                                >
                                    <svg
                                        width="17"
                                        height="17"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1.1 2 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.7 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
                                    </svg>
                                    GitHub
                                </a>
                            </div>

                            <div style={{ display: "flex", gap: "28px" }}>
                                {[
                                    { value: "15", label: "Modules" },
                                    { value: "6", label: "Frameworks" },
                                    { value: "100%", label: "Client-side" },
                                ].map(({ value, label }) => (
                                    <div key={label}>
                                        <div
                                            style={{
                                                fontFamily:
                                                    "'JetBrains Mono', monospace",
                                                fontWeight: 700,
                                                fontSize: "20px",
                                                color: "var(--h-text)",
                                            }}
                                        >
                                            {value}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "var(--h-text-3)",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.04em",
                                            }}
                                        >
                                            {label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Terminal — stays dark in both themes */}
                        <div
                            style={{
                                borderRadius: "12px",
                                background: "var(--h-term-bg)",
                                border: "1px solid var(--h-term-border)",
                                boxShadow:
                                    "0 30px 80px -20px oklch(0 0 0 / 0.6)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "12px 16px",
                                    background: "var(--h-term-header)",
                                    borderBottom:
                                        "1px solid var(--h-term-border)",
                                }}
                            >
                                <div
                                    style={{
                                        width: "11px",
                                        height: "11px",
                                        borderRadius: "50%",
                                        background: "oklch(0.65 0.19 25)",
                                    }}
                                />
                                <div
                                    style={{
                                        width: "11px",
                                        height: "11px",
                                        borderRadius: "50%",
                                        background: "oklch(0.78 0.15 75)",
                                    }}
                                />
                                <div
                                    style={{
                                        width: "11px",
                                        height: "11px",
                                        borderRadius: "50%",
                                        background: "oklch(0.72 0.13 150)",
                                    }}
                                />
                                <div
                                    style={{
                                        marginLeft: "8px",
                                        fontFamily:
                                            "'JetBrains Mono', monospace",
                                        fontSize: "12px",
                                        color: "var(--h-term-muted)",
                                    }}
                                >
                                    js-recon run -u https://app.example.com
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: "22px 20px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: "13px",
                                    lineHeight: "1.9",
                                }}
                            >
                                <div style={{ color: "var(--h-term-muted)" }}>
                                    $ js-recon run -u https://app.example.com
                                </div>
                                <div style={{ color: "oklch(0.75 0.14 210)" }}>
                                    ✓ lazyload — 48 files fetched
                                </div>
                                <div style={{ color: "oklch(0.75 0.14 210)" }}>
                                    ✓ strings — 312 paths, 19 endpoints
                                </div>
                                <div style={{ color: "oklch(0.75 0.14 210)" }}>
                                    ✓ map — 1,204 functions indexed
                                </div>
                                <div style={{ color: "oklch(0.78 0.15 75)" }}>
                                    ⚠ analyze — 3 medium findings
                                </div>
                                <div style={{ color: "oklch(0.65 0.19 25)" }}>
                                    ✗ analyze — hardcoded AWS key in
                                    bundle.42a1.js
                                </div>
                                <div style={{ color: "oklch(0.65 0.19 25)" }}>
                                    ✗ analyze — eval() sink reachable from URL
                                    param
                                </div>
                                <div style={{ color: "var(--h-term-muted)" }}>
                                    → report written to ./report.json
                                </div>
                                <div
                                    style={{
                                        color: "var(--h-term-text)",
                                        display: "flex",
                                        alignItems: "center",
                                        marginTop: "4px",
                                    }}
                                >
                                    $ <span className={styles.blinkCursor} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PLATFORM MARQUEE ─────────────────────────────────────── */}
            <PlatformMarquee />

            {/* ── CAPABILITIES ─────────────────────────────────────────── */}
            <div style={{ ...SECTION, paddingTop: "80px" }}>
                <SectionHeading
                    eyebrow="What it does"
                    title="Recon and exploitability, built in"
                    subtitle="Every module targets a real step in an offensive JavaScript workflow — from pulling the bundle to reaching a vulnerable sink."
                />
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "1px",
                        background: "var(--h-border)",
                        border: "1px solid var(--h-border)",
                        borderRadius: "16px",
                        overflow: "hidden",
                    }}
                    className={styles.capGrid}
                >
                    {CAPABILITIES.map((cap) => (
                        <div
                            key={cap.title}
                            style={{
                                background: "var(--h-card)",
                                padding: "32px",
                            }}
                        >
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "9px",
                                    background: `color-mix(in oklch, ${cap.accent} 15%, transparent)`,
                                    color: cap.accent,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "20px",
                                }}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    {cap.icon}
                                </svg>
                            </div>
                            <div
                                style={{
                                    fontWeight: 700,
                                    fontSize: "17px",
                                    marginBottom: "10px",
                                    color: "var(--h-text)",
                                }}
                            >
                                {cap.title}
                            </div>
                            <div
                                style={{
                                    fontSize: "14px",
                                    lineHeight: "1.65",
                                    color: "var(--h-text-2)",
                                }}
                            >
                                {cap.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── PIPELINE ─────────────────────────────────────────────── */}
            <div style={SECTION}>
                <SectionHeading
                    eyebrow="The pipeline"
                    title="One command, full recon"
                />
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: "16px",
                    }}
                    className={styles.pipelineGrid}
                >
                    {PIPELINE_STEPS.map((step) => (
                        <div
                            key={step.num}
                            style={{
                                border: "1px solid var(--h-border)",
                                borderRadius: "10px",
                                padding: "20px 18px",
                                background: "var(--h-card-raised)",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: "12px",
                                    color: "var(--h-text-3)",
                                    marginBottom: "8px",
                                }}
                            >
                                {step.num}
                            </div>
                            <div
                                style={{
                                    fontWeight: 700,
                                    fontSize: "15px",
                                    marginBottom: "6px",
                                    color: "var(--h-text)",
                                }}
                            >
                                {step.name}
                            </div>
                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "var(--h-text-2)",
                                    lineHeight: "1.5",
                                }}
                            >
                                {step.desc}
                            </div>
                        </div>
                    ))}

                    {/* report — highlighted */}
                    <div
                        style={{
                            border: "1px solid oklch(0.65 0.19 25 / 0.4)",
                            borderRadius: "10px",
                            padding: "20px 18px",
                            background: "oklch(0.65 0.19 25 / 0.08)",
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "12px",
                                color: "var(--h-red)",
                                marginBottom: "8px",
                            }}
                        >
                            05
                        </div>
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: "15px",
                                marginBottom: "6px",
                                color: "var(--h-red)",
                            }}
                        >
                            report
                        </div>
                        <div
                            style={{
                                fontSize: "13px",
                                color: "var(--h-text-2)",
                                lineHeight: "1.5",
                            }}
                        >
                            Structured output, ready to act on
                        </div>
                    </div>
                </div>
            </div>

            {/* ── INTEGRATIONS ─────────────────────────────────────────── */}
            <div style={SECTION}>
                <SectionHeading
                    eyebrow="Run it anywhere"
                    title="Install once, ship it everywhere"
                    subtitle="Pick the surface that fits your workflow — a local CLI, a container, a CI step, or infrastructure-as-code across the major clouds."
                />
                {CATEGORY_ORDER.map((cat) => (
                    <div key={cat} style={{ marginBottom: "28px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "14px",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    color: "var(--h-text-3)",
                                    textTransform: "uppercase",
                                }}
                            >
                                {cat}
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    height: "1px",
                                    background: "var(--h-border)",
                                }}
                            />
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "14px",
                            }}
                            className={styles.integrationGrid}
                        >
                            {INTEGRATIONS.filter(
                                (it) => it.category === cat
                            ).map((it) => (
                                <IntegrationCard key={it.label} it={it} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Result strip */}
                <div
                    style={{
                        marginTop: "4px",
                        borderRadius: "12px",
                        background: "var(--h-code-bg)",
                        border: "1px solid var(--h-term-border)",
                        padding: "16px 20px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "13.5px",
                        color: "var(--h-code-text)",
                    }}
                >
                    <span style={{ color: "var(--h-term-muted)" }}>$</span> npm
                    i -g @shriyanss/js-recon{"  "}
                    <span style={{ color: "var(--h-green)" }}>
                        ✓ js-recon@{VERSION} installed
                    </span>
                </div>
            </div>
        </Layout>
    );
}
