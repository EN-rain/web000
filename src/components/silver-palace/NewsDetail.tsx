"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SiteHeader } from "./SiteHeader";
import styles from "./NewsDetail.module.css";

type NewsDetailProps = {
  id: string;
};

type ArticleSummary = {
  title: string;
  date: string;
  category: "News" | "Notices" | "Events";
  excerpt: string;
  image: string;
};

type CombatSection = {
  heading: string;
  body?: React.ReactNode;
  image?: string;
  level?: 1 | 2;
};

const ARTICLE_SUMMARIES: Record<string, ArticleSummary> = {
  "93": {
    title: "The Science of All Things - Combat Edition",
    date: "2026-07-22",
    category: "News",
    excerpt:
      "During this test, you'll not only experience a completely refreshed combat system, but also face off against a host of formidable foes making their first appearances in Silvernia. Each enemy features unique combat mechanics, striking visual design, and spectacular battle performances, all crafted to deliver exhilarating combat and a feast for the eyes.",
    image: "/silver-palace/cf2dbfa68b6560c1e92be41adb530e0e.jpg",
  },
  "88": {
    title: '"Dichotomy" Beta Test Twitch Drops: Watch Livestreams to Gain Test Access',
    date: "2026-07-23",
    category: "Events",
    excerpt: 'The "Dichotomy" Beta Test Twitch Drops event has officially started!',
    image: "/silver-palace/e24ae811f9b65458734c93b8ae76660b.png",
  },
  "86": {
    title: "Silver Palace Fan Content & Streaming Guidelines",
    date: "2026-07-20",
    category: "Notices",
    excerpt:
      "Elementa has established these Silver Palace Fan Content & Streaming Guidelines to encourage the creation of Silver Palace-related content, including game livestreams and videos, promote the game, and foster a welcoming environment in which creators can produce, share, and publish their works.",
    image: "/silver-palace/e3ffcc450a3aa1ec6d03e37b9d93f25b.png",
  },
  "71": {
    title: "The Science of All Things - Local Edition: Morgue Street",
    date: "2026-07-14",
    category: "News",
    excerpt:
      "Morgue Street undoubtedly stands as one of the most iconic enclaves within High Peers. Serving as a vital thoroughfare connecting multiple districts, it acts as a sprawling crucible in which those of all social spheres and distant lands converge.",
    image: "/silver-palace/4d9dc0d197981c63a422344473aca217.jpg",
  },
  "65": {
    title: '"Dichotomy" Beta Test News and Important Rewards',
    date: "2026-07-23",
    category: "Notices",
    excerpt:
      'Log in for a total of 3 days to receive the 5-star character Saviour "Red Rose | Dancer". Complete the In-Game Experience Survey I & II and any one In-Depth Survey, and you will automatically be invited to the third beta test when it begins.',
    image: "/silver-palace/046779ee99d6f64a4f6053b1048eeb93.png",
  },
  "60": {
    title: '"Dichotomy" Beta Test Pre-Download & Launch Guide',
    date: "2026-07-20",
    category: "Notices",
    excerpt:
      '"Dichotomy" Beta Test access distribution is in progress. Detectives with test access may pre-download the test client by following the instructions.',
    image: "/silver-palace/475114fe9c79a16d278e1da7fcf8daff.png",
  },
};

const COMBAT_SECTIONS: CombatSection[] = [
  {
    heading: "Revamped Combat",
    level: 1,
    body: (
      <>
        During this test, you&apos;ll not only experience a completely refreshed combat
        system, but also face off against a host of formidable foes making their first
        appearances in Silvernia. Each enemy features{" "}
        <em>unique combat mechanics, striking visual design, and spectacular battle performances</em>,
        all crafted to deliver exhilarating combat and a feast for the eyes.
      </>
    ),
  },
  {
    heading: "Enhanced Performance Quality",
    image: "/silver-palace/c00c394f7ebc98382cd8a2d76e44d005.jpg",
  },
  {
    heading: "All-New Battle Mechanics",
    image: "/silver-palace/97ed095134eb087715cec83675025e3d.jpg",
  },
  {
    heading: "Stunning Visual Effects",
    image: "/silver-palace/173ed7d781e73dbe0a9c12183e558432.jpg",
  },
  { heading: "Combat Features", level: 1 },
  {
    heading: "Parries",
    body: (
      <>
        When a yellow circle appears as an enemy prepares to attack, parry just before the
        hit lands to reduce DMG taken and deal DMG to the enemy. Additionally,{" "}
        <em>successful parries</em> can be chained into combos, allowing you to rapidly
        unleash powerful attacks.
      </>
    ),
    image: "/silver-palace/70bb4ba828639cabe5d9b3082daa798a.jpg",
  },
  {
    heading: "Executions",
    body:
      "Once an enemy has been Stunned, you can perform an Execution on them to deal significant DMG.",
    image: "/silver-palace/93bfa85a9e56001f746a9feda85ac630.jpg",
  },
  {
    heading: "Synchronised Combat",
    body: (
      <>
        When a character performs a Charged Attack or unleashes a Charged Skill, switching
        to another character will cause the outgoing character to remain on the field until
        their current action is complete. By making clever use of this technique, you can
        have multiple characters fighting on the field at once.{" "}
        <em>Combine their skills to unlock even more combat potential</em>.
      </>
    ),
    image: "/silver-palace/2a0a99ff57f3d43776a8a00ddd416a21.jpg",
  },
  { heading: "Battle Mechanics", level: 1 },
  {
    heading: "Weakened States",
    body:
      "After suffering an Execution, enemies will be left in a temporarily weakened state. Make use of this opportunity to unleash unrelenting attacks.",
    image: "/silver-palace/0d3450c1ffd7ed4c16a4db037e716b26.jpg",
  },
  {
    heading: "Resonance Effects",
    body:
      "Characters build their Resonance meters as they attack. Once full, a Resonance Effect is triggered based on their Reactor attribute, significantly increasing their DMG dealt.",
    image: "/silver-palace/290a032d33b1f5f82b1a56ec7e1a2160.jpg",
  },
  {
    heading: "Casual Mode",
    level: 1,
    body: (
      <>
        While we continue to expand the strategic depth and gameplay possibilities offered
        by the game&apos;s combat, we want to make sure that every Detective can enjoy the
        thrill of battle. If you prefer a more relaxed combat experience,{" "}
        <em>
          try switching to &quot;Casual Mode&quot;. By repeatedly clicking the left mouse
          button, you can trigger a variety of stylish combos with ease
        </em>
        , allowing you to quickly get the hang of combat and defeat formidable foes.
        <br />
        <br />
        Additionally, when &quot;Casual Mode&quot; is enabled,{" "}
        <em>
          characters will trigger a Time Dilation effect and be shown a prompt when they
          are about to be hit
        </em>
        . Even Detectives experiencing Silvernia for the first time can remain calm amid
        the clash of blades, responding to danger with composure.
      </>
    ),
    image: "/silver-palace/c82863cbbde5fdabf8f9824e8ef193ae.jpg",
  },
];

function RevealingImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className={styles.imageReveal} data-reveal="image">
      <Image src={src} alt={alt} width={960} height={540} sizes="960px" />
    </div>
  );
}

export function NewsDetail({ id }: NewsDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const article = ARTICLE_SUMMARIES[id] ?? ARTICLE_SUMMARIES["93"];
  const isCombatArticle = id === "93" || !(id in ARTICLE_SUMMARIES);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const revealNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => {
        node.dataset.visible = "true";
      });
      return;
    }

    revealNodes.forEach((node) => {
      delete node.dataset.visible;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { root, rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [id]);

  return (
    <main className={styles.page}>
      <SiteHeader />
      <div className={styles.detailScroll} ref={scrollRef}>
        <div className={styles.articleShell}>
          <Link className={styles.backLink} href="/en-us/news">
            <span aria-hidden="true">←</span> Back to News
          </Link>

          <article className={styles.article}>
            <header className={styles.articleHeader}>
              <p className={styles.category}>{article.category}</p>
              <h1 key={`${id}-title`}>{article.title}</h1>
              <time dateTime={article.date}>
                <span aria-hidden="true">◆</span>
                {article.date}
                <span aria-hidden="true">◆</span>
              </time>
            </header>

            {isCombatArticle ? (
              <div className={styles.content}>
                {COMBAT_SECTIONS.map((section, index) => (
                  <section
                    className={section.level === 1 ? styles.majorSection : styles.section}
                    data-reveal="section"
                    key={`${section.heading}-${index}`}
                  >
                    {section.level === 1 ? <h2>{section.heading}</h2> : <h3>{section.heading}</h3>}
                    {section.body ? <p>{section.body}</p> : null}
                    {section.image ? (
                      <RevealingImage src={section.image} alt={`${section.heading} gameplay`} />
                    ) : null}
                  </section>
                ))}
              </div>
            ) : (
              <div className={styles.content}>
                <section className={styles.summarySection} data-reveal="section">
                  <h2>{article.category}</h2>
                  <RevealingImage src={article.image} alt={article.title} />
                  <p>{article.excerpt}</p>
                </section>
              </div>
            )}
          </article>

          <footer className={styles.footer} data-reveal="section">
            <nav aria-label="Legal">
              <a href="https://silverpalace.elementagames.com/en-us/terms-of-service">
                Terms of Service
              </a>
              <span aria-hidden="true">|</span>
              <a href="https://silverpalace.elementagames.com/en-us/privacy-policy">
                Privacy Policy
              </a>
            </nav>
            <p>Copyright © Elementa. All Rights Reserved.</p>
            <p>
              Player Support Email:{" "}
              <a href="mailto:service_global@elementagames.com">
                service_global@elementagames.com
              </a>
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
