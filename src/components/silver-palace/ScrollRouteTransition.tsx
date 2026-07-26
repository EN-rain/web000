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

export type ScrollRouteDestination = RouteTransitionOptions & {
  destination: string;
  routeNumber: string;
  routeName: string;
};

type TransitionKey = "forward" | "backward";

type ScrollRouteTransitionProps = {
  sceneRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  forward?: ScrollRouteDestination;
  backward?: ScrollRouteDestination;
  enabled?: boolean;
  canStartForward?: () => boolean;
  canStartBackward?: () => boolean;
};

export function ScrollRouteTransition({
  sceneRef,
  contentRef,
  forward,
  backward,
  enabled = true,
  canStartForward,
  canStartBackward,
}: ScrollRouteTransitionProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const forwardCanvasRef = useRef<HTMLCanvasElement>(null);
  const backwardCanvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const forwardRendererRef = useRef<RouteTransitionRenderer | null>(null);
  const backwardRendererRef = useRef<RouteTransitionRenderer | null>(null);
  const activeRef = useRef<TransitionKey | null>(null);
  const frameRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const wheelSpeedRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const shaderTimeRef = useRef(0);
  const navigatingRef = useRef(false);
  const enabledRef = useRef(enabled);
  const canStartForwardRef = useRef(canStartForward);
  const canStartBackwardRef = useRef(canStartBackward);

  useEffect(() => {
    enabledRef.current = enabled;
    canStartForwardRef.current = canStartForward;
    canStartBackwardRef.current = canStartBackward;
  });

  useEffect(() => {
    const scene = sceneRef.current;
    const content = contentRef.current;
    const forwardCanvas = forwardCanvasRef.current;
    const backwardCanvas = backwardCanvasRef.current;
    if (!scene || !content || !forwardCanvas || !backwardCanvas) return;

    let disposed = false;

    const transitionFor = (key: TransitionKey) =>
      key === "forward" ? forward : backward;
    const rendererFor = (key: TransitionKey) =>
      key === "forward"
        ? forwardRendererRef.current
        : backwardRendererRef.current;
    const reset = () => {
      activeRef.current = null;
      progressRef.current = 0;
      wheelSpeedRef.current = 0;
      lastFrameTimeRef.current = 0;
      content.style.opacity = "";
      content.style.pointerEvents = "";
      if (overlayRef.current) {
        overlayRef.current.style.opacity = "0";
      }
      if (titleRef.current) {
        titleRef.current.style.opacity = "0";
        titleRef.current.style.transform = "translate3d(0, 300px, 0)";
      }
      forwardCanvas.style.display = "none";
      backwardCanvas.style.display = "none";
    };

    const activate = (key: TransitionKey) => {
      const transition = transitionFor(key);
      if (!transition) return false;

      activeRef.current = key;
      forwardCanvas.style.display = key === "forward" ? "block" : "none";
      backwardCanvas.style.display = key === "backward" ? "block" : "none";
      if (overlayRef.current) {
        overlayRef.current.style.backgroundImage =
          `url("${transition.currentImage}")`;
      }
      if (numberRef.current) {
        numberRef.current.textContent = transition.routeNumber;
      }
      if (nameRef.current) {
        nameRef.current.textContent = transition.routeName;
      }
      rendererFor(key)?.draw(0, shaderTimeRef.current);
      return true;
    };

    const paint = (progress: number) => {
      const active = activeRef.current;
      if (!active) return;

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
      rendererFor(active)?.draw(progress, shaderTimeRef.current);
    };

    const animate = (timestamp: number) => {
      const active = activeRef.current;
      if (!active) {
        frameRef.current = null;
        return;
      }

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

      const transition = transitionFor(active);
      if (!navigatingRef.current && next >= 1 && transition) {
        navigatingRef.current = true;
        router.push(transition.destination);
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
        if (next <= 0) reset();
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
      const inputDirection = Math.sign(delta);
      let active = activeRef.current;

      if (!active) {
        const nextKey: TransitionKey =
          inputDirection > 0 ? "forward" : "backward";
        const transition = transitionFor(nextKey);
        const canStart =
          nextKey === "forward"
            ? canStartForwardRef.current
            : canStartBackwardRef.current;
        if (!transition || inputDirection === 0 || (canStart && !canStart())) {
          return;
        }
        if (!activate(nextKey)) return;
        active = nextKey;
      }

      event.preventDefault();
      const targetDirection = active === "forward" ? 1 : -1;
      const aligned = inputDirection === targetDirection;
      const magnitude = Math.max(0.85, Math.min(Math.abs(delta) / 80, 2));

      if (aligned) {
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

    const initialize = async (
      key: TransitionKey,
      canvas: HTMLCanvasElement,
      transition: ScrollRouteDestination | undefined,
    ) => {
      if (!transition) return;
      const renderer = await createRouteTransitionRenderer(canvas, transition);
      if (disposed) {
        renderer.dispose();
        return;
      }
      if (key === "forward") {
        forwardRendererRef.current = renderer;
      } else {
        backwardRendererRef.current = renderer;
      }
    };

    void initialize("forward", forwardCanvas, forward);
    void initialize("backward", backwardCanvas, backward);
    reset();
    scene.addEventListener("wheel", handleWheel, { passive: false });
    const resize = () => {
      forwardRendererRef.current?.resize();
      backwardRendererRef.current?.resize();
    };
    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      scene.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", resize);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      forwardRendererRef.current?.dispose();
      backwardRendererRef.current?.dispose();
      forwardRendererRef.current = null;
      backwardRendererRef.current = null;
      content.style.opacity = "";
      content.style.pointerEvents = "";
    };
  }, [
    backward,
    contentRef,
    forward,
    router,
    sceneRef,
  ]);

  return (
    <div ref={overlayRef} className={styles.transition} aria-hidden="true">
      <canvas
        ref={forwardCanvasRef}
        className={styles.canvas}
        style={{ display: "none" }}
      />
      <canvas
        ref={backwardCanvasRef}
        className={styles.canvas}
        style={{ display: "none" }}
      />
      <div ref={titleRef} className={styles.routeTitle}>
        <span ref={numberRef} className={styles.routeNumber} />
        <span ref={nameRef} className={styles.routeName} />
      </div>
    </div>
  );
}
