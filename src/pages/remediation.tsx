import React, { ReactNode, useEffect, useState } from "react";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import clsx from "clsx";
import styles from "./index.module.css";

const REMEDIATION_URL =
    "https://raw.githubusercontent.com/js-recon/js-recon-rules/main/remediation.json";

type RemediationMap = Record<string, string>;

function useRemediationMap() {
    const [map, setMap] = useState<RemediationMap | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(REMEDIATION_URL)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(setMap)
            .catch(() => setError(true));
    }, []);

    return { map, error };
}

function GenericRemediation(): ReactNode {
    return (
        <div>
            <p style={{ margin: 0 }}>
                No specific remediation found for this rule ID. As general
                guidance: validate and sanitize any value that originates from
                the URL, a postMessage, or a server response before it reaches a
                DOM sink (innerHTML, href, style, eval, etc.), and verify
                security-relevant checks (authorization, origin validation) are
                enforced server-side rather than only in the client.
            </p>
            <p style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                See the{" "}
                <a href="/docs/rules/predefined-rules">
                    predefined rule catalog
                </a>{" "}
                for the full list of rule IDs.
            </p>
        </div>
    );
}

export default function Remediation(): ReactNode {
    const { map, error } = useRemediationMap();
    const [query, setQuery] = useState("");

    const trimmed = query.trim();
    const match = map && trimmed ? map[trimmed] : undefined;

    return (
        <Layout
            title="Remediation"
            description="Look up remediation guidance for a JS Recon rule ID"
        >
            <header className={clsx("hero hero--primary", styles.heroBanner)}>
                <div className="container">
                    <Heading as="h1">Rule Remediation Lookup</Heading>
                    <p className="hero__subtitle">
                        Enter a rule ID to see how to fix the finding it
                        detected.
                    </p>
                </div>
            </header>
            <main style={{ padding: "2rem 0" }}>
                <div className={clsx("container")} style={{ maxWidth: 720 }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. detect_dom_xss_innerHTML_url_source"
                        aria-label="Rule ID"
                        style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            fontSize: "1rem",
                            borderRadius: "8px",
                            border: "1px solid var(--ifm-color-emphasis-300)",
                            marginBottom: "1.5rem",
                        }}
                    />

                    {trimmed && (
                        <div
                            style={{
                                backgroundColor:
                                    "var(--ifm-background-surface-color-light)",
                                padding: "1.5rem",
                                borderRadius: "8px",
                                boxShadow: "var(--ifm-global-shadow-lw)",
                            }}
                        >
                            <Heading
                                as="h3"
                                style={{ marginBottom: "0.75rem" }}
                            >
                                {match ? trimmed : "Not found"}
                            </Heading>
                            {error ? (
                                <p style={{ margin: 0 }}>
                                    Couldn&apos;t load the remediation data
                                    right now. Please try again shortly.
                                </p>
                            ) : !map ? (
                                <p style={{ margin: 0 }}>Loading…</p>
                            ) : match ? (
                                <p style={{ margin: 0 }}>{match}</p>
                            ) : (
                                <GenericRemediation />
                            )}
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}
