import React, { ReactNode } from "react";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import clsx from "clsx";
import styles from "./index.module.css";
import useBaseUrl from '@docusaurus/useBaseUrl';

// Define your YouTube videos here. Add more objects to the array to display more videos.
interface VideoMeta {
    title: string;
    youtubeId: string;
    section: number;
}

const videoSectionIndex: { [key: number]: string } = {
    1: "Lab Setup",
};

const videos: VideoMeta[] = [
    {
        title: "ReconJS Lab 1: Introduction",
        youtubeId: "dQw4w9WgXcQ",
        section: 1,
    },
    {
        title: "ReconJS Lab 2: Advanced Topics",
        youtubeId: "3GwjfUFyY6M",
        section: 1,
    },
];

function VideoGrid(): ReactNode {
    const videosBySection: { [key: string]: VideoMeta[] } = videos.reduce(
        (acc, video) => {
            const sectionTitle = videoSectionIndex[video.section];
            if (!acc[sectionTitle]) {
                acc[sectionTitle] = [];
            }
            acc[sectionTitle].push(video);
            return acc;
        },
        {}
    );

    return (
        <div className={clsx("container")}>
            {Object.entries(videosBySection).map(
                ([sectionTitle, videosInSection]) => (
                    <div key={sectionTitle}>
                        <Heading
                            as="h2"
                            style={{ marginTop: "2rem", marginBottom: "1rem" }}
                        >
                            {sectionTitle}
                        </Heading>
                        <div
                            className={styles.videoGrid}
                            style={{
                                display: "grid",
                                gap: "2rem",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(320px, 1fr))",
                            }}
                        >
                            {videosInSection.map(({ title, youtubeId }) => (
                                <div
                                    key={youtubeId}
                                    style={{ textAlign: "center" }}
                                >
                                    <div
                                        style={{
                                            position: "relative",
                                            paddingBottom: "56.25%",
                                            height: 0,
                                        }}
                                    >
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
                                    <p
                                        style={{
                                            marginTop: "0.5rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

export default function Labs(): ReactNode {
    return (
        <Layout
            title="Labs"
            description="Hands-on labs with video walkthroughs"
        >
            <header className={clsx("hero hero--primary", styles.heroBanner)}>
                <div className="container">
                <Heading as="h1" className="hero__title">
                        Labs
                    </Heading>
                    <p className="hero__subtitle">
                        Watch video walkthroughs and follow along!
                    </p>
                                        <img
                        src={useBaseUrl("img/labs-banner.png")}
                        alt="Labs Banner"
                        style={{
                            display: "block",
                            margin: "0 auto 2rem auto",
                            maxHeight: "250px",
                            borderRadius: "8px",
                        }}
                    />
                </div>
            </header>
            <main style={{ padding: "2rem 0" }}>
                <VideoGrid />
            </main>
        </Layout>
    );
}
