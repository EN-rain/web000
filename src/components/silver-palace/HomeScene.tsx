"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

import {
  createHomeTransitionRenderer,
  type HomeTransitionRenderer,
} from "./HomeTransitionRenderer";
import styles from "./HomeScene.module.css";

type HomeSceneProps = {
  header?: ReactNode;
};

const PARALLAX_STRENGTH = [4, 8, 13, 19] as const;
const FRAME_DURATION = 1000 / 60;
const MAX_PROGRESS_STEP = 0.006;

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
  const shaderCanvasRef = useRef<HTMLCanvasElement>(null);
  const shaderRendererRef = useRef<HomeTransitionRenderer | null>(null);
  const chromaticRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLAnchorElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const wheelSpeedRef = useRef(0);
  const lastTransitionTimeRef = useRef(0);
  const shaderTimeRef = useRef(0);
  const navigatingRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const setTargetProgressRef = useRef<(next: number) => void>(() => undefined);

  const renderShader = (progress: number) => {
    shaderRendererRef.current?.draw(progress, shaderTimeRef.current);
  };

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
    const heroProgress = smoothstep(range(progress, 0, 0.06));
    const ticketProgress = smoothstep(range(progress, 0.18, 0.38));
    const titleProgress = smoothstep(range(progress, 0.52, 0.95));

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
        300 - titleProgress * 78 - titleProgress * titleProgress * 51
      }px, 0)`;
    }

    if (chromaticRef.current) {
      chromaticRef.current.style.opacity = "0";
      chromaticRef.current.style.transform = `translate3d(${
        (progress - 0.5) * 13
      }px, 0, 0)`;
    }

    renderShader(progress);
  };

  const animateTransition = (timestamp: number) => {
    const elapsed = lastTransitionTimeRef.current
      ? Math.min(50, timestamp - lastTransitionTimeRef.current)
      : FRAME_DURATION;
    const frameScale = elapsed / FRAME_DURATION;
    lastTransitionTimeRef.current = timestamp;
    shaderTimeRef.current += 0.01 * frameScale;

    const current = currentProgressRef.current;
    let next = current;

    if (current >= 0.8 && current < 1) {
      next = Math.min(1, current + 0.006 * frameScale);
    } else if (wheelSpeedRef.current !== 0) {
      const increment = Math.max(
        -MAX_PROGRESS_STEP,
        Math.min(MAX_PROGRESS_STEP, wheelSpeedRef.current * frameScale),
      );
      next = clamp(current + increment);
      const decay = wheelSpeedRef.current < 0 ? 0.96 : 0.9;
      wheelSpeedRef.current *= Math.pow(decay, frameScale);
      if (Math.abs(wheelSpeedRef.current) < 0.0002) {
        wheelSpeedRef.current = 0;
      }
    }

    currentProgressRef.current = next;
    targetProgressRef.current = next;
    paintTransition(next);

    if (
      !navigatingRef.current &&
      next >= 1
    ) {
      navigatingRef.current = true;
      router.push("/en-us/roles");
      transitionFrameRef.current = null;
      return;
    }

    if (
      (next < 1 && wheelSpeedRef.current !== 0) ||
      (next >= 0.8 && next < 1)
    ) {
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
    const direction = Math.sign(next - currentProgressRef.current);
    const magnitude = Math.max(
      0.85,
      Math.min(Math.abs(next - currentProgressRef.current) * 12, 2),
    );
    if (direction > 0) {
      wheelSpeedRef.current += 0.095 * magnitude;
    } else if (wheelSpeedRef.current > 0) {
      wheelSpeedRef.current -= 0.016 * magnitude;
    } else {
      wheelSpeedRef.current -= 0.016 * 0.72 * magnitude;
    }
    wheelSpeedRef.current = Math.max(-0.045, Math.min(0.045, wheelSpeedRef.current));
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

    let disposed = false;

    const initializeShader = async () => {
      const canvas = shaderCanvasRef.current;
      if (!canvas) return;

      shaderRendererRef.current?.dispose();
      const renderer = await createHomeTransitionRenderer(canvas);
      if (disposed) {
        renderer.dispose();
        return;
      }
      shaderRendererRef.current = renderer;
      renderer.draw(currentProgressRef.current, shaderTimeRef.current);
    };

    void initializeShader();
    const resizeShader = () => shaderRendererRef.current?.resize();
    window.addEventListener("resize", resizeShader);

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
      const delta = normalizeWheelDelta(event);
      const direction = Math.sign(delta);
      const magnitude = Math.max(0.85, Math.min(Math.abs(delta) / 80, 2));

      if (direction > 0) {
        wheelSpeedRef.current += 0.095 * magnitude;
      } else if (wheelSpeedRef.current > 0) {
        wheelSpeedRef.current -= 0.016 * magnitude;
      } else {
        wheelSpeedRef.current -= 0.016 * 0.72 * magnitude;
      }
      wheelSpeedRef.current = Math.max(
        -0.045,
        Math.min(0.045, wheelSpeedRef.current),
      );
      queueTransition();
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
      disposed = true;
      scene?.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      motionQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("resize", resizeShader);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;

      if (parallaxFrameRef.current !== null) {
        window.cancelAnimationFrame(parallaxFrameRef.current);
      }

      if (transitionFrameRef.current !== null) {
        window.cancelAnimationFrame(transitionFrameRef.current);
      }

      shaderRendererRef.current?.dispose();
      shaderRendererRef.current = null;
    };
    // The transition engine owns mutable animation refs and is installed once
    // for this route instance; rebuilding listeners per frame would reset it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        className={styles.transitionBackground}
        aria-hidden
      >
        <canvas ref={shaderCanvasRef} className={styles.shaderCanvas} />
      </div>
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
