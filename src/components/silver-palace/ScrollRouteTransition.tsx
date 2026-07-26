"use client";

import { useRouter } from "next/navigation";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import {
  createRouteTransitionRenderer,
  type RouteTransitionOptions,
  type RouteTransitionRenderer,
} from "./RouteTransitionRenderer";
import styles from "./ScrollRouteTransition.module.css";

const FRAME_DURATION = 1000 / 60;
const MAX_PROGRESS_STEP = 0.006;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));
const smoothstep = (value: number) => value * value * (3 - 2 * value);

type ScrollRouteTransitionProps = RouteTransitionOptions & {
  sceneRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  destination: string;
  routeNumber: string;
  routeName: string;
  enabled?: boolean;
  canStart?: () => boolean;
};

export function ScrollRouteTransition({
  sceneRef,
  contentRef,
  destination,
  routeNumber,
  routeName,
  enabled = true,
  canStart,
  currentImage,
  nextImage,
  currentFitTop,
  nextFitTop,
  currentEdgeMultiplier,
  nextEdgeMultiplier,
}: ScrollRouteTransitionProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<RouteTransitionRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const wheelSpeedRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const shaderTimeRef = useRef(0);
  const navigatingRef = useRef(false);
  const enabledRef = useRef(enabled);
  const canStartRef = useRef(canStart);

  useEffect(() => {
    enabledRef.current = enabled;
    canStartRef.current = canStart;
  });

  useEffect(() => {
    const scene = sceneRef.current;
    const content = contentRef.current;
    const canvas = canvasRef.current;
    if (!scene || !content || !canvas) return;

    let disposed = false;

    const paint = (progress: number) => {
      const contentProgress = smoothstep(range(progress, 0, 0.16));
      const titleProgress = smoothstep(range(progress, 0.43, 0.92));

      if (overlayRef.current) {
        overlayRef.current.style.opacity = progress > 0.001 ? "1" : "0";
      }
      content.style.opacity = `${1 - contentProgress}`;
      content.style.pointerEvents = contentProgress > 0.5 ? "none" : "";
      if (titleRef.current) {
        titleRef.current.style.opacity = `${titleProgress}`;
        titleRef.current.style.transform = `translate3d(0, ${
          300 - titleProgress * 78 - titleProgress * titleProgress * 51
        }px, 0)`;
      }

      rendererRef.current?.draw(progress, shaderTimeRef.current);
    };

    const animate = (timestamp: number) => {
      const elapsed = lastFrameTimeRef.current
        ? Math.min(50, timestamp - lastFrameTimeRef.current)
        : FRAME_DURATION;
      const frameScale = elapsed / FRAME_DURATION;
      lastFrameTimeRef.current = timestamp;
      shaderTimeRef.current += 0.01 * frameScale;

      const current = progressRef.current;
      let next = current;

      if (current >= 0.8 && current < 1) {
        next = Math.min(1, current + 0.006 * frameScale);
      } else if (wheelSpeedRef.current !== 0) {
        next = clamp(
          current +
            Math.max(
              -MAX_PROGRESS_STEP,
              Math.min(MAX_PROGRESS_STEP, wheelSpeedRef.current * frameScale),
            ),
        );
        const decay = wheelSpeedRef.current < 0 ? 0.96 : 0.9;
        wheelSpeedRef.current *= Math.pow(decay, frameScale);
        if (Math.abs(wheelSpeedRef.current) < 0.0002) {
          wheelSpeedRef.current = 0;
        }
      }

      progressRef.current = next;
      paint(next);

      if (!navigatingRef.current && next >= 1) {
        navigatingRef.current = true;
        router.push(destination);
        frameRef.current = null;
        return;
      }

      if (
        (next < 1 && wheelSpeedRef.current !== 0) ||
        (next >= 0.8 && next < 1)
      ) {
        frameRef.current = window.requestAnimationFrame(animate);
      } else {
        frameRef.current = null;
        lastFrameTimeRef.current = 0;
      }
    };

    const queue = () => {
      if (frameRef.current === null && !navigatingRef.current) {
        frameRef.current = window.requestAnimationFrame(animate);
      }
    };

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
      if (!enabledRef.current || navigatingRef.current) return;

      const delta = normalizeWheelDelta(event);
      const active = progressRef.current > 0 || wheelSpeedRef.current !== 0;
      if (
        !active &&
        (delta <= 0 || (canStartRef.current && !canStartRef.current()))
      ) {
        return;
      }

      event.preventDefault();
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
      queue();
    };

    const initialize = async () => {
      const renderer = await createRouteTransitionRenderer(
        canvas,
        {
          currentImage,
          nextImage,
          currentFitTop,
          nextFitTop,
          currentEdgeMultiplier,
          nextEdgeMultiplier,
        },
      );
      if (disposed) {
        renderer.dispose();
        return;
      }
      rendererRef.current = renderer;
      renderer.draw(progressRef.current, shaderTimeRef.current);
    };

    void initialize();
    paint(0);
    scene.addEventListener("wheel", handleWheel, { passive: false });
    const resize = () => rendererRef.current?.resize();
    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      scene.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", resize);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      rendererRef.current?.dispose();
      rendererRef.current = null;
      content.style.opacity = "";
      content.style.pointerEvents = "";
    };
  }, [
    contentRef,
    destination,
    currentEdgeMultiplier,
    currentFitTop,
    currentImage,
    nextEdgeMultiplier,
    nextFitTop,
    nextImage,
    router,
    sceneRef,
  ]);

  return (
    <div
      ref={overlayRef}
      className={styles.transition}
      style={{ backgroundImage: `url("${currentImage}")` }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={titleRef} className={styles.routeTitle}>
        <span className={styles.routeNumber}>{routeNumber}</span>
        <span className={styles.routeName}>{routeName}</span>
      </div>
    </div>
  );
}
