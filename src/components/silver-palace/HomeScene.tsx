"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

import styles from "./HomeScene.module.css";

type HomeSceneProps = {
  header?: ReactNode;
};

const PARALLAX_STRENGTH = [4, 8, 13, 19] as const;
const WHEEL_TRAVEL = 2000;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));

const smoothstep = (value: number) => value * value * (3 - 2 * value);

export function HomeScene({ header }: HomeSceneProps) {
  const router = useRouter();
  const sceneRef = useRef<HTMLElement>(null);
  const parallaxFrameRef = useRef<number | null>(null);
  const transitionFrameRef = useRef<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const transitionBackgroundRef = useRef<HTMLDivElement>(null);
  const chromaticRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLAnchorElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const navigatingRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const setTargetProgressRef = useRef<(next: number) => void>(() => undefined);

  const applyParallax = () => {
    const scene = sceneRef.current;

    if (!scene) {
      parallaxFrameRef.current = null;
      return;
    }

    PARALLAX_STRENGTH.forEach((strength, index) => {
      const layer = index + 1;
      scene.style.setProperty(
        `--layer-${layer}-x`,
        `${pointerRef.current.x * strength}px`,
      );
      scene.style.setProperty(
        `--layer-${layer}-y`,
        `${pointerRef.current.y * strength * 0.65}px`,
      );
    });

    parallaxFrameRef.current = null;
  };

  const queueParallax = () => {
    if (parallaxFrameRef.current === null) {
      parallaxFrameRef.current = window.requestAnimationFrame(applyParallax);
    }
  };

  const paintTransition = (progress: number) => {
    const heroProgress = smoothstep(range(progress, 0, 0.08));
    const ticketProgress = smoothstep(range(progress, 0.18, 0.38));
    const titleProgress = smoothstep(range(progress, 0.5, 0.98));

    if (heroRef.current) {
      heroRef.current.style.opacity = `${1 - heroProgress}`;
    }

    if (ticketRef.current) {
      ticketRef.current.style.opacity = `${1 - ticketProgress}`;
      ticketRef.current.style.transform = `translate3d(0, ${ticketProgress * 6}px, 0)`;
      ticketRef.current.style.filter = `blur(${ticketProgress * 3}px) brightness(1)`;
      ticketRef.current.style.pointerEvents =
        ticketProgress > 0.5 ? "none" : "auto";
    }

    if (titleRef.current) {
      titleRef.current.style.opacity = `${titleProgress}`;
      titleRef.current.style.transform = `translate3d(0, ${
        (1 - titleProgress) * 300
      }px, 0)`;
    }

    if (transitionBackgroundRef.current) {
      transitionBackgroundRef.current.style.transform = `scale(${
        1.075 - progress * 0.045
      })`;
      transitionBackgroundRef.current.style.filter = `brightness(${
        0.52 + progress * 0.42
      }) saturate(${0.88 + progress * 0.12})`;
    }

    if (chromaticRef.current) {
      chromaticRef.current.style.opacity = `${range(progress, 0.08, 0.82) * 0.3}`;
      chromaticRef.current.style.transform = `translate3d(${
        (progress - 0.5) * 13
      }px, 0, 0)`;
    }
  };

  const animateTransition = () => {
    const current = currentProgressRef.current;
    const target = targetProgressRef.current;
    const ease = reducedMotionRef.current ? 0.34 : 0.105;
    const next =
      Math.abs(target - current) < 0.0005
        ? target
        : current + (target - current) * ease;

    currentProgressRef.current = next;
    paintTransition(next);

    if (
      !navigatingRef.current &&
      target >= 1 &&
      next >= (reducedMotionRef.current ? 0.94 : 0.985)
    ) {
      navigatingRef.current = true;
      router.push("/en-us/roles");
      transitionFrameRef.current = null;
      return;
    }

    if (next !== target) {
      transitionFrameRef.current =
        window.requestAnimationFrame(animateTransition);
    } else {
      transitionFrameRef.current = null;
    }
  };

  const queueTransition = () => {
    if (
      transitionFrameRef.current === null &&
      !navigatingRef.current
    ) {
      transitionFrameRef.current =
        window.requestAnimationFrame(animateTransition);
    }
  };

  const setTargetProgress = (next: number) => {
    targetProgressRef.current = clamp(next);
    queueTransition();
  };

  useEffect(() => {
    setTargetProgressRef.current = setTargetProgress;
  });

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (
      event.pointerType !== "mouse" ||
      !window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      ).matches
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: (event.clientX - bounds.left) / bounds.width - 0.5,
      y: (event.clientY - bounds.top) / bounds.height - 0.5,
    };
    queueParallax();
  };

  const handlePointerLeave = () => {
    pointerRef.current = { x: 0, y: 0 };
    queueParallax();
  };

  useEffect(() => {
    const scene = sceneRef.current;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    reducedMotionRef.current = motionQuery.matches;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    paintTransition(0);

    const normalizeWheelDelta = (event: WheelEvent) => {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        return event.deltaY * 16;
      }

      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        return event.deltaY * window.innerHeight;
      }

      return event.deltaY;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setTargetProgressRef.current(
        targetProgressRef.current + normalizeWheelDelta(event) / WHEEL_TRAVEL,
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      let next: number | null = null;

      if (event.key === "ArrowDown" || event.key === "PageDown") {
        next = targetProgressRef.current + 0.18;
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        next = targetProgressRef.current - 0.18;
      } else if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = 1;
      }

      if (next !== null) {
        event.preventDefault();
        setTargetProgressRef.current(next);
      }
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
    };

    scene?.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      scene?.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      motionQuery.removeEventListener("change", handleMotionChange);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;

      if (parallaxFrameRef.current !== null) {
        window.cancelAnimationFrame(parallaxFrameRef.current);
      }

      if (transitionFrameRef.current !== null) {
        window.cancelAnimationFrame(transitionFrameRef.current);
      }
    };
  }, [router]);

  return (
    <main
      ref={sceneRef}
      className={styles.scene}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--layer-1-x": "0px",
          "--layer-1-y": "0px",
          "--layer-2-x": "0px",
          "--layer-2-y": "0px",
          "--layer-3-x": "0px",
          "--layer-3-y": "0px",
          "--layer-4-x": "0px",
          "--layer-4-y": "0px",
        } as CSSProperties
      }
    >
      <div
        ref={transitionBackgroundRef}
        className={styles.transitionBackground}
        aria-hidden
      />
      <div ref={chromaticRef} className={styles.chromatic} aria-hidden />

      <div ref={heroRef} className={styles.hero}>
        <div className={`${styles.layer} ${styles.background}`} aria-hidden />
        <div className={`${styles.layer} ${styles.parallaxOne}`} aria-hidden />
        <div className={`${styles.layer} ${styles.parallaxTwo}`} aria-hidden />
        <div className={`${styles.layer} ${styles.parallaxThree}`} aria-hidden />
        <div className={`${styles.layer} ${styles.parallaxFour}`} aria-hidden />
        <div className={styles.mask} aria-hidden />
      </div>

      <div ref={titleRef} className={styles.nextRoute} aria-hidden="true">
        <span className={styles.routeNumber}>#02</span>
        <span className={styles.routeTitle}>Character Introduction</span>
      </div>

      {header && <div className={styles.header}>{header}</div>}

      <Link
        ref={ticketRef}
        className={styles.ticket}
        href="/en-us/world"
        aria-label="Check test access"
      >
        <Image
          className={styles.ticketButton}
          src="/silver-palace/check_en_us.B0Ccx4QE.png"
          alt=""
          width={221}
          height={71}
          priority
          draggable={false}
        />
      </Link>
    </main>
  );
}

export default HomeScene;
