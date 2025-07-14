import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
    title: string;
    // Svg: React.ComponentType<React.ComponentProps<"svg">>;
    description: ReactNode;
};

const FeatureList: FeatureItem[] = [
    {
        title: "Specialized for popular JS Frameworks",
        // Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
        description: (
            <>
                JS Recon goes beyond one-size-fits-all techniques — it delivers
                framework-specific analysis, adapting its approach to each
                framework's unique structure and attack surface
            </>
        ),
    },
    {
        title: "Get the security perspective",
        // Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
        description: (
            <>
                JS Recon isn't your typical development tool — it's
                purpose-built for security professionals, putting offensive
                analysis and recon at the core, not an afterthought
            </>
        ),
    },
    {
        title: "Written in JavaScript",
        // Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
        description: (
            <>
                JS Recon is written in the same language it analyzes —
                JavaScript. This makes it fast, extensible, and deeply
                integrated with the JavaScript ecosystem you're securing.
            </>
        ),
    },
];

// function Feature({ title, Svg, description }: FeatureItem) {
function Feature({ title, description }: FeatureItem) {
    return (
        <div className={clsx("col col--4")}>
            {/* <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div> */}
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): ReactNode {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
