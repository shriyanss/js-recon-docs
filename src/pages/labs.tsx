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
    markdown: string; // relative path under static/labs_md/
}

const videos: VideoMeta[] = [
    {
        title: "ReconJS Lab 1: Introduction",
        youtubeId: "dQw4w9WgXcQ",
        markdown: "lab1.md",
    },
    {
        title: "ReconJS Lab 2: Advanced Topics",
        youtubeId: "3GwjfUFyY6M",
        markdown: "lab2.md",
    },
];

interface ModalProps {
    open: boolean;
    markdownFile?: string;
    onClose: () => void;
}

function Modal({ open, markdownFile, onClose }: ModalProps): ReactNode {
    const [content, setContent] = useState<string>("");

    useEffect(() => {
        if (!open || !markdownFile) return;
        fetch(`/labs_md/${markdownFile}`)
            .then((res) => res.text())
            .then(setContent)
            .catch(() => setContent("Failed to load steps."));
    }, [open, markdownFile]);

    if (!open) return null;
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "#fff",
                    maxWidth: "90%",
                    maxHeight: "90%",
                    overflowY: "auto",
                    padding: "2rem",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    style={{ float: "right", fontSize: "1.25rem", border: "none", background: "none" }}
                    onClick={onClose}
                >
                    ✖
                </button>
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        </div>
    );
}

function VideoGrid(): ReactNode {
    const [modalOpen, setModalOpen] = useState(false);
    const [activeMarkdown, setActiveMarkdown] = useState<string | undefined>();

    const openModal = (md: string) => {
        setActiveMarkdown(md);
        setModalOpen(true);
    };

    return (
        <>
            <div
                className={clsx("container", styles.videoGrid)}
                style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
            >
                {videos.map(({ title, youtubeId, markdown }) => (
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
                        <button
                            onClick={() => openModal(markdown)}
                            style={{
                                marginTop: "0.25rem",
                                background: "#eee",
                                border: "none",
                                padding: "0.5rem 1rem",
                                cursor: "pointer",
                            }}
                        >
                            Read Steps
                        </button>
                    </div>
                ))}
            </div>
            <Modal open={modalOpen} markdownFile={activeMarkdown} onClose={() => setModalOpen(false)} />
        </>
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
