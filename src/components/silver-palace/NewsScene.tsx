"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { SiteHeader } from "./SiteHeader";
import {
  ScrollRouteTransition,
  type ScrollRouteDestination,
} from "./ScrollRouteTransition";
import { useRouteEntrance } from "./useRouteEntrance";
import styles from "./NewsScene.module.css";

const NEXT_ROUTE = {
  currentImage: "/silver-palace/news_bg.LVNfMlKE.jpg",
  nextImage: "/silver-palace/feature_bg2.DhK7u9hK.jpg",
  currentFitTop: true,
  currentEdgeMultiplier: 0,
  destination: "/en-us/features",
  routeNumber: "#04",
  routeName: "Media Gallery",
} satisfies ScrollRouteDestination;

const PREVIOUS_ROUTE = {
  currentImage: "/silver-palace/news_bg.LVNfMlKE.jpg",
  nextImage: "/silver-palace/char_bg.C_73WKtR.jpg",
  currentFitTop: true,
  currentEdgeMultiplier: 0,
  direction: -1,
  destination: "/en-us/roles",
  routeNumber: "#02",
  routeName: "Character Introduction",
} satisfies ScrollRouteDestination;

type Category = "Latest" | "News" | "Notices" | "Events";

type NewsItem = {
  id: number;
  title: string;
  date: string;
  category: Exclude<Category, "Latest">;
  excerpt: string;
  image: string;
};

const NEWS_ITEMS: readonly NewsItem[] = [
  {
    id: 99,
    title: "The Science of All Things - Curious Deductions Edition",
    date: "2026-07-24",
    category: "News",
    excerpt:
      "Follow the latest curious deductions and discoveries from Silvernia.",
    image: "/silver-palace/ca712a13b015578dc3ec3411c223fd36.png",
  },
  {
    id: 93,
    title: "The Science of All Things - Combat Edition",
    date: "2026-07-22",
    category: "News",
    excerpt:
      "During this test, you'll not only experience a completely refreshed combat system, but also face off against a host of formidable foes making their first appearances in Silvernia. Each enemy features unique combat mechanics, striking visual design, and spectacular battle performances, all crafted to deliver exhilarating combat and a feast for the eyes.",
    image: "/silver-palace/cf2dbfa68b6560c1e92be41adb530e0e.jpg",
  },
  {
    id: 88,
    title:
      '"Dichotomy" Beta Test Twitch Drops: Watch Livestreams to Gain Test Access',
    date: "2026-07-23",
    category: "Events",
    excerpt:
      'The "Dichotomy" Beta Test Twitch Drops event has officially started!',
    image: "/silver-palace/e24ae811f9b65458734c93b8ae76660b.png",
  },
  {
    id: 86,
    title: "Silver Palace Fan Content & Streaming Guidelines",
    date: "2026-07-20",
    category: "Notices",
    excerpt:
      "has established these Silver Palace Fan Content & Streaming Guidelines to encourage the creation of Silver Palace-related content, including game livestreams and videos, promote the game, and foster a welcoming environment in which creators can produce, share, and publish their works.",
    image: "/silver-palace/e3ffcc450a3aa1ec6d03e37b9d93f25b.png",
  },
  {
    id: 71,
    title: "The Science of All Things - Local Edition: Morgue Street",
    date: "2026-07-14",
    category: "News",
    excerpt:
      "Morgue Street undoubtedly stands as one of the most iconic enclaves within High Peers. Serving as a vital thoroughfare connecting multiple districts, it acts as a sprawling crucible in which those of all social spheres and distant lands converge.",
    image: "/silver-palace/4d9dc0d197981c63a422344473aca217.jpg",
  },
  {
    id: 65,
    title: '"Dichotomy" Beta Test News and Important Rewards',
    date: "2026-07-23",
    category: "Notices",
    excerpt:
      "Log in for a total of 3 days to receive the 5-star character Saviour \"Red Rose | Dancer\". Complete the In-Game Experience Survey I & II and any one In-Depth Survey, and you will automatically be invited to the third beta test when it begins.",
    image: "/silver-palace/046779ee99d6f64a4f6053b1048eeb93.png",
  },
  {
    id: 60,
    title: '"Dichotomy" Beta Test Pre-Download & Launch Guide',
    date: "2026-07-20",
    category: "Notices",
    excerpt:
      '"Dichotomy" Beta Test access distribution is in progress. Detectives with test access may pre-download the test client by following the instructions.',
    image: "/silver-palace/475114fe9c79a16d278e1da7fcf8daff.png",
  },
] as const;

const CATEGORIES: readonly Category[] = [
  "Latest",
  "News",
  "Notices",
  "Events",
];
const PAGE_SIZE = 3;

export function NewsScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLElement>(null);
  useRouteEntrance(sceneRef, "/en-us/news");
  const [activeHero, setActiveHero] = useState<NewsItem>(NEWS_ITEMS[2]);
  const [category, setCategory] = useState<Category>("Latest");
  const [visibleCategory, setVisibleCategory] =
    useState<Category>("Latest");
  const [page, setPage] = useState(1);
  const [gridVisible, setGridVisible] = useState(true);

  const filteredItems = useMemo(
    () =>
      visibleCategory === "Latest"
        ? NEWS_ITEMS
        : NEWS_ITEMS.filter((item) => item.category === visibleCategory),
    [visibleCategory],
  );
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pageItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observed = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { root, threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );

    observed.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [visibleCategory, page]);

  const changeCategory = (nextCategory: Category) => {
    if (nextCategory === category) return;
    setCategory(nextCategory);
    setGridVisible(false);
    window.setTimeout(() => {
      setVisibleCategory(nextCategory);
      setPage(1);
      setGridVisible(true);
    }, 180);
  };

  const changePage = (nextPage: number) => {
    if (nextPage === page) return;
    setGridVisible(false);
    window.setTimeout(() => {
      setPage(nextPage);
      setGridVisible(true);
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
  };

  return (
    <main ref={sceneRef} className={styles.scene}>
      <SiteHeader />

      <div ref={scrollRef} className={styles.newsScroll}>
        <div className={styles.content}>
          <header className={styles.titleBlock} data-reveal>
            <h1>News</h1>
            <Image
              src="/silver-palace/news_title_eles2.Bus7s6_o.png"
              alt=""
              width={896}
              height={168}
              priority
            />
          </header>

          <section className={styles.hero} aria-label="Featured news">
            <div className={styles.headlines} data-reveal>
              {NEWS_ITEMS.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href={`/en-us/newsDetail?id=${item.id}`}
                  className={`${styles.headline} ${
                    activeHero.id === item.id ? styles.activeHeadline : ""
                  }`}
                  onMouseEnter={() => setActiveHero(item)}
                  onFocus={() => setActiveHero(item)}
                >
                  <span>{item.title}</span>
                  <b aria-hidden="true">+</b>
                </Link>
              ))}
            </div>

            <div className={styles.preview} data-reveal>
              <Image
                className={styles.previewBack}
                src="/silver-palace/news_banner_paper3.BSNN3bdW.png"
                alt=""
                width={544}
                height={564}
                priority
              />
              <Image
                className={styles.previewPaper}
                src="/silver-palace/news_banner_paper1.iamDkDFZ.png"
                alt=""
                width={1064}
                height={751}
                priority
              />
              <div className={styles.previewImage}>
                {NEWS_ITEMS.map((item) => (
                  <Image
                    key={item.id}
                    className={
                      item.id === activeHero.id ? styles.previewImageActive : ""
                    }
                    src={item.image}
                    alt={item.id === activeHero.id ? item.title : ""}
                    fill
                    sizes="565px"
                    priority={item.id === 86}
                    unoptimized
                  />
                ))}
              </div>
              <Image
                className={styles.previewFrame}
                src="/silver-palace/news_banner_paper2.C8ey2wH-.png"
                alt=""
                width={818}
                height={509}
                priority
              />
              <Image
                className={styles.stamp}
                src="/silver-palace/news_stamp.DxbbmV9a.png"
                alt=""
                width={119}
                height={122}
                priority
              />
            </div>
          </section>

          <section ref={gridRef} className={styles.newsGridSection}>
            <div
              className={styles.categories}
              role="tablist"
              aria-label="News categories"
              data-reveal
            >
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={category === item}
                  className={category === item ? styles.activeCategory : ""}
                  onClick={() => changeCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div
              className={`${styles.cards} ${
                gridVisible ? styles.cardsVisible : ""
              }`}
              aria-live="polite"
            >
              {pageItems.map((item) => (
                <article key={item.id} className={styles.card} data-reveal>
                  <Link href={`/en-us/newsDetail?id=${item.id}`}>
                    <div className={styles.cardImage}>
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="340px"
                        unoptimized
                      />
                    </div>
                    <div className={styles.cardCopy}>
                      <div className={styles.meta}>
                        <span>{item.category}</span>
                        <time dateTime={item.date}>{item.date}</time>
                      </div>
                      <h2>{item.title}</h2>
                      <p>{item.excerpt}</p>
                      <span className={styles.readMore}>
                        Read more <b aria-hidden="true">+</b>
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            <nav className={styles.pager} aria-label="News pages" data-reveal>
              <button
                type="button"
                aria-label="Previous page"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
              >
                ←
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    aria-current={page === pageNumber ? "page" : undefined}
                    className={page === pageNumber ? styles.activePage : ""}
                    onClick={() => changePage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
              <button
                type="button"
                aria-label="Next page"
                disabled={page === pageCount}
                onClick={() => changePage(page + 1)}
              >
                →
              </button>
            </nav>
          </section>
        </div>
      </div>

      <ScrollRouteTransition
        sceneRef={sceneRef}
        contentRef={scrollRef}
        forward={NEXT_ROUTE}
        backward={PREVIOUS_ROUTE}
        canStartForward={() => {
          const root = scrollRef.current;
          return (
            !!root &&
            root.scrollTop >= root.scrollHeight - root.clientHeight - 2
          );
        }}
        canStartBackward={() => {
          const root = scrollRef.current;
          return !!root && root.scrollTop <= 2;
        }}
      />
    </main>
  );
}

export default NewsScene;
