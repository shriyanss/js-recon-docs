import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import styles from "./index.module.css";

const PIPELINE_STEPS = [
  { num: "01", name: "lazyload", desc: "Fetch JS from the target URL" },
  { num: "02", name: "strings", desc: "Extract paths, URLs, secrets" },
  { num: "03", name: "map", desc: "Index functions & relationships" },
  { num: "04", name: "analyze", desc: "Run static rules for findings" },
];

export default function Home(): ReactNode {
  return (
    <Layout
      title="JS Recon — Blackbox JS Enumeration & SAST"
      description="JS Recon crawls, maps, and statically analyzes JavaScript in any target — surfacing endpoints, secrets, and dangerous sinks without needing source access."
    >
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>
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
                background: "oklch(0.23 0.015 250)",
                border: "1px solid oklch(0.30 0.014 250)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                color: "oklch(0.75 0.14 210)",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "oklch(0.65 0.19 25)",
                }}
              />
              BLACKBOX JS ENUMERATION + SAST
            </div>

            <h1
              style={{
                fontSize: "56px",
                lineHeight: "1.04",
                fontWeight: "800",
                letterSpacing: "-0.03em",
                margin: "0 0 20px",
                color: "oklch(0.95 0.004 250)",
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
                color: "oklch(0.68 0.012 250)",
                maxWidth: "460px",
                margin: "0 0 32px",
              }}
            >
              JS Recon crawls, maps, and statically analyzes JavaScript in any
              target — surfacing endpoints, secrets, and dangerous sinks without
              needing source access.
            </p>

            <div
              style={{ display: "flex", gap: "12px", marginBottom: "40px" }}
            >
              <Link
                to="/docs/docs/installation"
                style={{
                  padding: "13px 22px",
                  borderRadius: "8px",
                  background: "oklch(0.95 0.004 250)",
                  color: "oklch(0.15 0.012 250)",
                  fontWeight: "700",
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
                  border: "1px solid oklch(0.30 0.014 250)",
                  fontWeight: "700",
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "oklch(0.95 0.004 250)",
                  textDecoration: "none",
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="oklch(0.95 0.004 250)"
                >
                  <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1.1 2 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.7 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
                </svg>
                GitHub
              </a>
            </div>

            <div style={{ display: "flex", gap: "28px" }}>
              {[
                { value: "17", label: "Modules" },
                { value: "4", label: "Frameworks" },
                { value: "100%", label: "Client-side" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: "700",
                      fontSize: "20px",
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "oklch(0.50 0.012 250)",
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

          {/* Terminal */}
          <div
            style={{
              borderRadius: "12px",
              background: "oklch(0.12 0.012 250)",
              border: "1px solid oklch(0.30 0.014 250)",
              boxShadow: "0 30px 80px -20px oklch(0 0 0 / 0.6)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                background: "oklch(0.19 0.014 250)",
                borderBottom: "1px solid oklch(0.30 0.014 250)",
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
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  color: "oklch(0.50 0.012 250)",
                }}
              >
                js-recon run --target app.example.com
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
              <div style={{ color: "oklch(0.50 0.012 250)" }}>
                $ js-recon run --target app.example.com
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
                ✗ analyze — hardcoded AWS key in bundle.42a1.js
              </div>
              <div style={{ color: "oklch(0.65 0.19 25)" }}>
                ✗ analyze — eval() sink reachable from URL param
              </div>
              <div style={{ color: "oklch(0.68 0.012 250)" }}>
                → report written to ./report.json
              </div>
              <div
                style={{
                  color: "oklch(0.95 0.004 250)",
                  display: "flex",
                  alignItems: "center",
                  marginTop: "4px",
                }}
              >
                ${" "}
                <span className={styles.blinkCursor} />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <div
        style={{
          padding: "40px 40px 100px",
          maxWidth: "1240px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "oklch(0.30 0.014 250)",
            border: "1px solid oklch(0.30 0.014 250)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Feature: Framework-aware */}
          <div
            style={{ background: "oklch(0.15 0.012 250)", padding: "32px" }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "9px",
                background: "oklch(0.65 0.19 25 / 0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z"
                  stroke="oklch(0.65 0.19 25)"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div
              style={{
                fontWeight: "700",
                fontSize: "17px",
                marginBottom: "10px",
              }}
            >
              Framework-aware analysis
            </div>
            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.65",
                color: "oklch(0.68 0.012 250)",
              }}
            >
              Next.js, Vue, Svelte, and Astro each get a tailored crawl and
              analysis pipeline instead of one generic pass.
            </div>
          </div>

          {/* Feature: Built for offense */}
          <div
            style={{ background: "oklch(0.15 0.012 250)", padding: "32px" }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "9px",
                background: "oklch(0.75 0.14 210 / 0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12h16M4 6h16M4 18h10"
                  stroke="oklch(0.75 0.14 210)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div
              style={{
                fontWeight: "700",
                fontSize: "17px",
                marginBottom: "10px",
              }}
            >
              Built for offense
            </div>
            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.65",
                color: "oklch(0.68 0.012 250)",
              }}
            >
              Every module is written for security researchers first — recon and
              exploitability at the core, not bolted onto a build tool.
            </div>
          </div>

          {/* Feature: Written in JS */}
          <div
            style={{ background: "oklch(0.15 0.012 250)", padding: "32px" }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "9px",
                background: "oklch(0.78 0.15 75 / 0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3v18M3 12h18"
                  stroke="oklch(0.78 0.15 75)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="oklch(0.78 0.15 75)"
                  strokeWidth="1.6"
                />
              </svg>
            </div>
            <div
              style={{
                fontWeight: "700",
                fontSize: "17px",
                marginBottom: "10px",
              }}
            >
              Written in JavaScript
            </div>
            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.65",
                color: "oklch(0.68 0.012 250)",
              }}
            >
              JS Recon analyzes the language it's written in — fast, extensible,
              and native to the ecosystem you're targeting.
            </div>
          </div>

          {/* Feature: Automate (spans 2 cols) */}
          <div
            style={{
              background: "oklch(0.15 0.012 250)",
              padding: "32px",
              gridColumn: "span 2",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "9px",
                background: "oklch(0.72 0.13 150 / 0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12a9 9 0 1 1-3-6.7"
                  stroke="oklch(0.72 0.13 150)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M21 4v5h-5"
                  stroke="oklch(0.72 0.13 150)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div
              style={{
                fontWeight: "700",
                fontSize: "17px",
                marginBottom: "10px",
              }}
            >
              Automate your recon
            </div>
            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.65",
                color: "oklch(0.68 0.012 250)",
                maxWidth: "480px",
              }}
            >
              Run JS Recon on every build. Surface source maps, exposed
              endpoints, and client-side vulnerabilities before defenders notice
              — available as a{" "}
              <a
                href="https://github.com/shriyanss/js-recon"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Action
              </a>
              .
            </div>
          </div>

          {/* Feature: Install snippet */}
          <div
            style={{
              background: "oklch(0.15 0.012 250)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                color: "oklch(0.68 0.012 250)",
              }}
            >
              <div
                style={{
                  marginBottom: "6px",
                  color: "oklch(0.50 0.012 250)",
                }}
              >
                $ npm i -g js-recon
              </div>
              <div style={{ color: "oklch(0.75 0.14 210)" }}>
                js-recon@1.4.1 installed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PIPELINE ─────────────────────────────────────────────── */}
      <div
        style={{
          padding: "0 40px 100px",
          maxWidth: "1240px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              color: "oklch(0.75 0.14 210)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            The pipeline
          </div>
          <h2
            style={{
              fontSize: "34px",
              fontWeight: "800",
              letterSpacing: "-0.02em",
              margin: "0",
              color: "oklch(0.95 0.004 250)",
            }}
          >
            One command, full recon
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "16px",
          }}
        >
          {PIPELINE_STEPS.map((step) => (
            <div
              key={step.num}
              style={{
                border: "1px solid oklch(0.30 0.014 250)",
                borderRadius: "10px",
                padding: "20px 18px",
                background: "oklch(0.19 0.014 250)",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  color: "oklch(0.50 0.012 250)",
                  marginBottom: "8px",
                }}
              >
                {step.num}
              </div>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "15px",
                  marginBottom: "6px",
                }}
              >
                {step.name}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "oklch(0.68 0.012 250)",
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
                color: "oklch(0.65 0.19 25)",
                marginBottom: "8px",
              }}
            >
              05
            </div>
            <div
              style={{
                fontWeight: "700",
                fontSize: "15px",
                marginBottom: "6px",
                color: "oklch(0.65 0.19 25)",
              }}
            >
              report
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "oklch(0.68 0.012 250)",
                lineHeight: "1.5",
              }}
            >
              Structured output, ready to act on
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
