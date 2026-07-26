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
const WHEEL_TRAVEL = 1450;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));

const smoothstep = (value: number) => value * value * (3 - 2 * value);

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );
}

function buildEdgeMap(
  source: CanvasRenderingContext2D,
  target: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const sourceData = source.getImageData(0, 0, width, height);
  const output = target.createImageData(width, height);
  const grayscale = new Float32Array(width * height);

  for (let index = 0; index < grayscale.length; index += 1) {
    const sourceIndex = index * 4;
    grayscale[index] =
      sourceData.data[sourceIndex] * 0.2126 +
      sourceData.data[sourceIndex + 1] * 0.7152 +
      sourceData.data[sourceIndex + 2] * 0.0722;
  }

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const gx =
        -grayscale[index - width - 1] +
        grayscale[index - width + 1] -
        grayscale[index - 1] * 2 +
        grayscale[index + 1] * 2 -
        grayscale[index + width - 1] +
        grayscale[index + width + 1];
      const gy =
        -grayscale[index - width - 1] -
        grayscale[index - width] * 2 -
        grayscale[index - width + 1] +
        grayscale[index + width - 1] +
        grayscale[index + width] * 2 +
        grayscale[index + width + 1];
      const strength = Math.min(255, Math.hypot(gx, gy) * 1.6);
      const outputIndex = index * 4;

      output.data[outputIndex] = 232;
      output.data[outputIndex + 1] = 242;
      output.data[outputIndex + 2] = 255;
      output.data[outputIndex + 3] = strength;
    }
  }

  target.putImageData(output, 0, 0);
}

export function HomeScene({ header }: HomeSceneProps) {
  const router = useRouter();
  const sceneRef = useRef<HTMLElement>(null);
  const parallaxFrameRef = useRef<number | null>(null);
  const transitionFrameRef = useRef<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const transitionBackgroundRef = useRef<HTMLDivElement>(null);
  const shaderCanvasRef = useRef<HTMLCanvasElement>(null);
  const shaderBaseRef = useRef<HTMLCanvasElement | null>(null);
  const shaderEdgesRef = useRef<HTMLCanvasElement | null>(null);
  const chromaticRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLAnchorElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const navigatingRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const setTargetProgressRef = useRef<(next: number) => void>(() => undefined);

  const renderShader = (progress: number) => {
    const canvas = shaderCanvasRef.current;
    const base = shaderBaseRef.current;
    const edges = shaderEdgesRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !base || !edges || !context) return;

    const width = canvas.width;
    const height = canvas.height;
    const eased = smoothstep(range(progress, 0.04, 0.9));
    const sweepY = height * (1.02 - eased * 0.78);
    const bandTop = sweepY - height * 0.19;
    const bandBottom = sweepY + height * 0.1;

    context.clearRect(0, 0, width, height);
    context.drawImage(base, 0, 0, width, height);

    const darkness = context.createLinearGradient(0, bandTop, 0, height);
    darkness.addColorStop(0, "rgba(10, 18, 42, 0)");
    darkness.addColorStop(0.18, `rgba(9, 16, 38, ${0.5 + eased * 0.2})`);
    darkness.addColorStop(1, `rgba(14, 22, 48, ${0.84 + eased * 0.1})`);
    context.fillStyle = darkness;
    context.fillRect(0, bandTop, width, height - bandTop);

    context.save();
    context.beginPath();
    context.rect(0, bandTop, width, Math.max(0, bandBottom - bandTop));
    context.clip();
    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.8;
    context.drawImage(edges, 0, 0, width, height);
    context.restore();

    context.save();
    context.globalAlpha = 0.05 + eased * 0.06;
    for (let y = Math.max(0, bandTop); y < height; y += 7) {
      const distance = Math.abs(y - sweepY) / Math.max(1, height * 0.28);
      const amplitude = Math.max(0, 1 - distance) * (7 + eased * 10);
      const offset = Math.sin(y * 0.041 + progress * 19) * amplitude;
      context.drawImage(
        base,
        0,
        (y / height) * base.height,
        base.width,
        Math.max(1, (7 / height) * base.height),
        offset,
        y,
        width,
        8,
      );
    }
    context.restore();

    context.fillStyle = `rgba(215, 228, 255, ${0.025 + eased * 0.035})`;
    for (let y = 0; y < height; y += 4) {
      context.fillRect(0, y, width, 1);
    }
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

    renderShader(progress);
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
      next >= (reducedMotionRef.current ? 0.84 : 0.88)
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

    const initializeShader = () => {
      const canvas = shaderCanvasRef.current;
      if (!canvas) return;

      const scale = 0.67;
      const width = Math.max(1, Math.round(window.innerWidth * scale));
      const height = Math.max(1, Math.round(window.innerHeight * scale));
      const image = new window.Image();

      image.onload = () => {
        const base = document.createElement("canvas");
        const edges = document.createElement("canvas");
        base.width = width;
        base.height = height;
        edges.width = width;
        edges.height = height;

        const baseContext = base.getContext("2d", { willReadFrequently: true });
        const edgeContext = edges.getContext("2d");
        if (!baseContext || !edgeContext) return;

        drawCover(baseContext, image, width, height);
        buildEdgeMap(baseContext, edgeContext, width, height);

        canvas.width = width;
        canvas.height = height;
        shaderBaseRef.current = base;
        shaderEdgesRef.current = edges;
        renderShader(currentProgressRef.current);
      };

      image.src = "/silver-palace/home_bg3.wAGjrSHo.jpg";
    };

    initializeShader();
    window.addEventListener("resize", initializeShader);

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
      window.removeEventListener("resize", initializeShader);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;

      if (parallaxFrameRef.current !== null) {
        window.cancelAnimationFrame(parallaxFrameRef.current);
      }

      if (transitionFrameRef.current !== null) {
        window.cancelAnimationFrame(transitionFrameRef.current);
      }
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
        ref={transitionBackgroundRef}
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
