import React, { ReactNode, useState, useEffect } from "react";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import styles from "./index.module.css";

// Define your YouTube videos here. Add more objects to the array to display more videos.
interface VideoMeta {
    title: string;
    youtubeId: string;
}

const videos: VideoMeta[] = [
    {
        title: "ReconJS Lab 1: Introduction",
        youtubeId: "dQw4w9WgXcQ",
    },
    {
        title: "ReconJS Lab 2: Advanced Topics",
        youtubeId: "3GwjfUFyY6M",
    },
];

interface ModalProps {
    open: boolean;
    markdownFile?: string;
    onClose: () => void;
}


function VideoGrid(): ReactNode {
    return (
        <div
            className={clsx("container", styles.videoGrid)}
            style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
        >
            {videos.map(({ title, youtubeId }) => (
                <div key={youtubeId} style={{ textAlign: "center" }}>
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            title={title}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                border: 0,
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                    <p style={{ marginTop: "0.5rem", fontWeight: 600 }}>{title}</p>
                </div>
            ))}
        </div>
    );
}

export default function Labs(): ReactNode {
    return (
        <Layout title="Labs" description="Hands-on labs with video walkthroughs">
            <header className={clsx("hero hero--primary", styles.heroBanner)}>
                <div className="container">
                    <Heading as="h1" className="hero__title">
                        Labs
                    </Heading>
                    <p className="hero__subtitle">Watch video walkthroughs and follow along!</p>
                </div>
            </header>
            <main style={{ padding: "2rem 0" }}>
                <VideoGrid />
            </main>
        </Layout>
    );
}
