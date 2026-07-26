"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type WheelEvent,
} from "react";

import { SiteHeader } from "./SiteHeader";
import {
  ScrollRouteTransition,
  type ScrollRouteDestination,
} from "./ScrollRouteTransition";
import { useRouteEntrance } from "./useRouteEntrance";
import styles from "./FeaturesScene.module.css";

const slides = [
  {
    image: "/silver-palace/cdebcaf09b07539a15ad9352ec0c3466.png",
    title:
      "Silver Palace丨Dichotomy Beta Test Gameplay Showcase - The Raven and the Rose",
    date: "2026-07-02",
  },
  {
    image: "/silver-palace/6521893e681e3d011bd249e6ff16c917.jpg",
    title: "Silver Palace丨Dichotomy Beta Test Trailer - Black Knights' Tango",
    date: "2026-06-26",
  },
  {
    image: "/silver-palace/0c75f1e391b3dc5b4063a90bdcac03e1.jpg",
    title: "Silver Palace丨Monotype Beta Test Trailer",
    date: "2025-12-19",
  },
  {
    image: "/silver-palace/043165b117087a3c0bcb19c6dbf6f201.jpg",
    title: "Silver Palace Trailer | The Golden Age of Detectives",
    date: "2025-05-13",
  },
] as const;

const DRAG_THRESHOLD = 55;
const WHEEL_COOLDOWN = 650;
const PREVIOUS_ROUTE = {
  currentImage: "/silver-palace/feature_bg2.DhK7u9hK.jpg",
  nextImage: "/silver-palace/news_bg.LVNfMlKE.jpg",
  nextFitTop: true,
  nextEdgeMultiplier: 0,
  direction: -1,
  destination: "/en-us/news",
  routeNumber: "#03",
  routeName: "News",
} satisfies ScrollRouteDestination;

function relativeOffset(index: number, activeIndex: number) {
  const offset = (index - activeIndex + slides.length) % slides.length;
  return offset > slides.length / 2 ? offset - slides.length : offset;
}

export function FeaturesScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const routeContentRef = useRef<HTMLDivElement>(null);
  useRouteEntrance(sceneRef, "/en-us/features");
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const dragged = useRef(false);
  const lastWheel = useRef(0);

  const selectSlide = useCallback((index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  }, []);

  const step = useCallback((direction: number) => {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isHovered || hasFocus) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      return;
    }

    const timer = window.setInterval(() => step(1), 6000);
    return () => window.clearInterval(timer);
  }, [hasFocus, isHovered, step]);

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    if (Math.abs(event.deltaX) < 8 || Math.abs(event.deltaX) < Math.abs(event.deltaY)) {
      return;
    }

    event.preventDefault();
    const now = performance.now();
    if (now - lastWheel.current < WHEEL_COOLDOWN) {
      return;
    }

    lastWheel.current = now;
    step(event.deltaX > 0 ? 1 : -1);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }

    pointerStart.current = event.clientX;
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (pointerStart.current === null) {
      return;
    }

    const distance = event.clientX - pointerStart.current;
    dragged.current = Math.abs(distance) > 6;
    setDragOffset(Math.max(-150, Math.min(150, distance)));
  };

  const finishDrag = (event: PointerEvent<HTMLElement>) => {
    if (pointerStart.current === null) {
      return;
    }

    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    setDragOffset(0);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (Math.abs(distance) >= DRAG_THRESHOLD) {
      step(distance < 0 ? 1 : -1);
    }
  };

  return (
    <main
      ref={sceneRef}
      className={styles.scene}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHasFocus(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          step(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          step(1);
        }
      }}
    >
      <SiteHeader />

      <div ref={routeContentRef} className={styles.routeContent}>
        <div className={styles.background} aria-hidden />
        <section className={styles.gallery} aria-roledescription="carousel" aria-label="Media Gallery">
        <h1>Media Gallery</h1>

        <div className={styles.thumbnails}>
          <button
            className={styles.arrow}
            type="button"
            aria-label="Previous gallery item"
            onClick={() => step(-1)}
          >
            ‹
          </button>
          <div className={styles.thumbnailStrip}>
            {slides.map((slide, index) => (
              <button
                className={`${styles.thumbnail} ${
                  index === activeIndex ? styles.activeThumbnail : ""
                }`}
                type="button"
                key={slide.image}
                aria-label={`Show ${slide.title}`}
                aria-current={index === activeIndex}
                onClick={() => selectSlide(index)}
              >
                <Image src={slide.image} alt="" fill sizes="96px" />
              </button>
            ))}
          </div>
          <button
            className={styles.arrow}
            type="button"
            aria-label="Next gallery item"
            onClick={() => step(1)}
          >
            ›
          </button>
        </div>

        <div
          className={styles.carousel}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <div className={styles.track}>
            {slides.map((slide, index) => {
              const offset = relativeOffset(index, activeIndex);
              const isActive = index === activeIndex;

              return (
                <article
                  className={`${styles.card} ${isActive ? styles.activeCard : ""}`}
                  key={slide.image}
                  aria-hidden={!isActive}
                  style={
                    {
                      "--card-offset": offset,
                      "--drag-offset": `${dragOffset}px`,
                    } as CSSProperties
                  }
                >
                  <button
                    className={styles.cardButton}
                    type="button"
                    tabIndex={isActive ? 0 : -1}
                    aria-label={`Play ${slide.title}`}
                    onClick={() => {
                      if (!dragged.current) {
                        selectSlide(index);
                      }
                      dragged.current = false;
                    }}
                  >
                    <span className={styles.imageFrame}>
                      <Image
                        className={styles.cardImage}
                        src={slide.image}
                        alt={slide.title}
                        fill
                        sizes="644px"
                        priority={index < 2}
                        draggable={false}
                      />
                      <span className={styles.play} aria-hidden="true">
                        ▶
                      </span>
                    </span>
                    <span className={styles.cardInfo}>
                      <strong>{slide.title}</strong>
                      <time dateTime={slide.date}>{slide.date}</time>
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <p className={styles.status} aria-live="polite">
          {activeIndex + 1} of {slides.length}: {slides[activeIndex].title}
        </p>
        </section>
      </div>
      <ScrollRouteTransition
        sceneRef={sceneRef}
        contentRef={routeContentRef}
        backward={PREVIOUS_ROUTE}
      />
    </main>
  );
}

export default FeaturesScene;
