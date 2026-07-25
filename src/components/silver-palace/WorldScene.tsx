"use client";
/* eslint-disable @next/next/no-img-element */

import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { SiteHeader } from "./SiteHeader";
import styles from "./WorldScene.module.css";

const ASSET_ROOT = "/silver-palace";
const PAPER_COUNT = 4;

const overlayAssets: Record<number, { normal: string; hover: string }> = {
  1: { normal: "world_img_1.B-s_rvt0.png", hover: "world_img_1_hover.uqJjob_e.png" },
  2: { normal: "world_img_2.D2mt0pfH.png", hover: "world_img_2_hover.BZbdmepY.png" },
  3: { normal: "world_img_3.DVoFvdm3.png", hover: "world_img_3_hover.CivfJ8qG.png" },
  4: { normal: "world_img_4.DbjEKUDU.png", hover: "world_img_4_hover.DnPQtC9t.png" },
  5: { normal: "world_img_5.CNf6ljCc.png", hover: "world_img_5_hover.QAC7iZ-O.png" },
  6: { normal: "world_img_6.Bcv9TQGi.png", hover: "world_img_6_hover.B54sAfP4.png" },
  7: { normal: "world_img_7.bDn4m13k.png", hover: "world_img_7_hover.DNiEylnG.png" },
  8: { normal: "world_img_8.CCIUd8gh.png", hover: "world_img_8_hover.ivNEPki2.png" },
  9: { normal: "world_img_9.amO_NhWj.png", hover: "world_img_9_hover.DqhdcC3N.png" },
  10: { normal: "world_img_10.CpaPquFL.png", hover: "world_img_10_hover.BOinG3_V.png" },
  14: { normal: "world_img_14.C9uAfl6R.png", hover: "world_img_14_hover.zf6q6qyX.png" },
  15: { normal: "world_img_15.BFS5JvU6.png", hover: "world_img_15_hover.DmGA89rN.png" },
  16: { normal: "world_img_16.-jbnwod0.png", hover: "world_img_16_hover.C5yyQ7T3.png" },
  17: { normal: "world_img_17.BEGxWo47.png", hover: "world_img_17_hover.B-zv4cw2.png" },
};

type Overlay = {
  image: number;
  left: number;
  top: number;
  width: number;
};

const papers = [
  {
    label: "Silvernia Observer",
    background: "world_paper_1.Bp11zWZ_.jpg",
    copy: "world_paper1_txt_en.Ch_KHRmw.png",
    thumbnail: "world_paper_1.DFyXVgb-.png",
    overlays: [
      { image: 7, left: 30.4, top: 25.3, width: 66.6 },
      { image: 5, left: 4.2, top: 47.5, width: 52 },
      { image: 14, left: 58.7, top: 65.3, width: 38 },
      { image: 10, left: 4.2, top: 78.7, width: 51.3 },
      { image: 6, left: 58.7, top: 83.5, width: 38 },
    ] satisfies Overlay[],
  },
  {
    label: "The Art of Survival",
    background: "world_paper_2_bg.D-OSo_EA.png",
    copy: "world_paper2_txt_en.BvJ9s0u-.png",
    thumbnail: "world_paper_2.K4Yk8VU_.png",
    overlays: [
      { image: 15, left: 19.2, top: 25.8, width: 63.7 },
      { image: 16, left: 19.2, top: 49.8, width: 63.7 },
      { image: 17, left: 19.2, top: 74.1, width: 63.7 },
    ] satisfies Overlay[],
  },
  {
    label: "Silvernia in View",
    background: "world_paper_3_bg.YCKr8oUu.png",
    copy: "world_paper3_txt_en.bQX_PPtj.png",
    thumbnail: "world_paper_3.6YiZhceW.png",
    overlays: [
      { image: 1, left: 23.2, top: 29.9, width: 55.7 },
      { image: 2, left: 47.2, top: 52.5, width: 45 },
      { image: 3, left: 20.8, top: 70.3, width: 58.6 },
    ] satisfies Overlay[],
  },
  {
    label: "The Science of All Things",
    background: "world_paper_4_bg.0HSQ_FQ9.png",
    copy: "world_paper4_txt_en.DKQyjoiP.png",
    thumbnail: "world_paper_4.BF6yeVwn.png",
    overlays: [
      { image: 4, left: 39.6, top: 32.8, width: 55.5 },
      { image: 8, left: 6.4, top: 53.5, width: 56 },
      { image: 9, left: 37.8, top: 74, width: 56 },
    ] satisfies Overlay[],
  },
] as const;

const roleStyles = [
  { name: "active", x: "0vw", y: "0vh", scale: 1, parallax: 0.6, z: 5 },
  {
    name: "next",
    x: "29.3vw",
    y: "69.4vh",
    scale: 0.75,
    parallax: 0.2,
    z: 3,
  },
  {
    name: "far",
    x: "-9.45vw",
    y: "37.4vh",
    scale: 1.09,
    parallax: 0.3,
    z: 1,
  },
  {
    name: "previous",
    x: "4.1vw",
    y: "8.5vh",
    scale: 1.09,
    parallax: 0.4,
    z: 2,
  },
] as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function WorldScene() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transition, setTransition] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const paperRefs = useRef<Array<HTMLElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentScrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const maximumScrollRef = useRef(0);

  const paintScroll = useCallback((value: number) => {
    const scene = sceneRef.current;
    scene?.style.setProperty("--paper-scroll", `${value}px`);
    scene?.style.setProperty("--scroll-20", `${value * 0.2}px`);
    scene?.style.setProperty("--scroll-30", `${value * 0.3}px`);
    scene?.style.setProperty("--scroll-40", `${value * 0.4}px`);
    scene?.style.setProperty("--scroll-60", `${value * 0.6}px`);
    const maximum = maximumScrollRef.current || 1;
    scene?.style.setProperty(
      "--scroll-progress",
      `${clamp(value / maximum, 0, 1)}`,
    );
  }, []);

  const requestScrollFrame = useCallback(() => {
    if (frameRef.current !== null) return;

    function tick() {
      const current = currentScrollRef.current;
      const target = targetScrollRef.current;
      const next = current + (target - current) * 0.16;

      currentScrollRef.current = Math.abs(target - next) < 0.12 ? target : next;
      paintScroll(currentScrollRef.current);

      if (currentScrollRef.current !== target) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
  }, [paintScroll]);

  const setScrollTarget = useCallback(
    (nextTarget: number) => {
      targetScrollRef.current = clamp(
        nextTarget,
        0,
        maximumScrollRef.current,
      );
      requestScrollFrame();
    },
    [requestScrollFrame],
  );

  const measureScrollRange = useCallback(() => {
    const paper = paperRefs.current[activeIndex];
    if (!paper) return;

    const paperHeight = paper.offsetHeight;
    const topInset = window.innerHeight * 0.135;
    maximumScrollRef.current = Math.max(
      0,
      (paperHeight + topInset - window.innerHeight + 30) / 1.6,
    );
    targetScrollRef.current = clamp(
      targetScrollRef.current,
      0,
      maximumScrollRef.current,
    );
    currentScrollRef.current = clamp(
      currentScrollRef.current,
      0,
      maximumScrollRef.current,
    );
    paintScroll(currentScrollRef.current);
  }, [activeIndex, paintScroll]);

  useEffect(() => {
    measureScrollRange();
    window.addEventListener("resize", measureScrollRange);
    return () => window.removeEventListener("resize", measureScrollRange);
  }, [measureScrollRange]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const handleWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      if (transition) return;

      const multiplier =
        event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? innerHeight : 1;
      setScrollTarget(targetScrollRef.current + event.deltaY * multiplier);
    };

    scene.addEventListener("wheel", handleWheel, { passive: false });
    return () => scene.removeEventListener("wheel", handleWheel);
  }, [setScrollTarget, transition]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    },
    [],
  );

  const selectPaper = useCallback(
    (index: number) => {
      if (index === activeIndex || transition) return;

      setTransition({ from: activeIndex, to: index });
      setActiveIndex(index);
      targetScrollRef.current = 0;
      currentScrollRef.current = 0;
      paintScroll(0);

      transitionTimerRef.current = setTimeout(() => {
        setTransition(null);
        transitionTimerRef.current = null;
      }, 920);
    },
    [activeIndex, paintScroll, transition],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (transition) return;

    const steps: Partial<Record<string, number>> = {
      ArrowDown: 120,
      ArrowUp: -120,
      PageDown: innerHeight * 0.72,
      PageUp: -innerHeight * 0.72,
    };

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setScrollTarget(event.key === "Home" ? 0 : maximumScrollRef.current);
      return;
    }

    const step = steps[event.key];
    if (step !== undefined) {
      event.preventDefault();
      setScrollTarget(targetScrollRef.current + step);
    }
  };

  return (
    <main
      aria-label="Silver Palace world archive"
      className={`${styles.scene} ${transition ? styles.switching : ""}`}
      onKeyDown={handleKeyDown}
      ref={sceneRef}
      tabIndex={0}
    >
      <SiteHeader />

      <div className={styles.scrollHint} aria-hidden="true">
        <span>SCROLL TO EXPLORE</span>
        <i />
      </div>

      <div className={styles.worldStage}>
        <div className={styles.worldScrollContent}>
          <div className={styles.paperStack}>
            <div className={styles.paperCanvas}>
              {papers.map((paper, index) => {
                const relativeRole =
                  (index - activeIndex + PAPER_COUNT) % PAPER_COUNT;
                const role = roleStyles[relativeRole];
                const isOutgoing = transition?.from === index;
                const isIncoming = transition?.to === index;
                const paperStyle = {
                  "--base-x": role.x,
                  "--base-y": role.y,
                  "--paper-scale": role.scale,
                  zIndex: role.z,
                } as CSSProperties;

                return (
                  <article
                    aria-hidden={index !== activeIndex}
                    aria-label={paper.label}
                    className={`${styles.paperCard} ${
                      styles[`role${role.name}`]
                    }`}
                    key={paper.label}
                    ref={(node) => {
                      paperRefs.current[index] = node;
                    }}
                    style={paperStyle}
                  >
                    <div
                      className={`${styles.paperMotion} ${
                        isOutgoing ? styles.paperOutgoing : ""
                      } ${isIncoming ? styles.paperIncoming : ""}`}
                    >
                      <img
                        alt=""
                        className={styles.paperBackground}
                        draggable={false}
                        onLoad={
                          index === activeIndex ? measureScrollRange : undefined
                        }
                        src={`${ASSET_ROOT}/${paper.background}`}
                      />
                      <img
                        alt={paper.label}
                        className={`${styles.paperCopy} ${
                          index === 2 ? styles.viewCopy : ""
                        }`}
                        draggable={false}
                        src={`${ASSET_ROOT}/${paper.copy}`}
                      />
                      {paper.overlays.map((overlay) => (
                        <span
                          className={styles.overlay}
                          key={overlay.image}
                          style={
                            {
                              left: `${overlay.left}%`,
                              top: `${overlay.top}%`,
                              width: `${overlay.width}%`,
                            } as CSSProperties
                          }
                        >
                          <img
                            alt=""
                            className={styles.overlayNormal}
                            draggable={false}
                            src={`${ASSET_ROOT}/${overlayAssets[overlay.image].normal}`}
                          />
                          <img
                            alt=""
                            className={styles.overlayHover}
                            draggable={false}
                            src={`${ASSET_ROOT}/${overlayAssets[overlay.image].hover}`}
                          />
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="Silver Palace world sections" className={styles.paperNav}>
        {papers.map((paper, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className={`${styles.thumbnailButton} ${
                isActive ? styles.thumbnailButtonActive : ""
              }`}
              disabled={Boolean(transition)}
              key={paper.label}
              onClick={() => selectPaper(index)}
              type="button"
            >
              <span className={styles.thumbnailLabel}>{paper.label}</span>
              <img
                alt=""
                className={styles.thumbnailImage}
                draggable={false}
                src={`${ASSET_ROOT}/${paper.thumbnail}`}
              />
            </button>
          );
        })}
      </nav>
    </main>
  );
}

export default WorldScene;
