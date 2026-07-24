"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

import styles from "./HomeScene.module.css";

type HomeSceneProps = {
  header?: ReactNode;
};

const PARALLAX_STRENGTH = [4, 8, 13, 19] as const;

export function HomeScene({ header }: HomeSceneProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  const applyParallax = () => {
    const scene = sceneRef.current;

    if (!scene) {
      frameRef.current = null;
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

    frameRef.current = null;
  };

  const queueParallax = () => {
    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(applyParallax);
    }
  };

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

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

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
      <div className={`${styles.layer} ${styles.background}`} aria-hidden />
      <div className={`${styles.layer} ${styles.parallaxOne}`} aria-hidden />
      <div className={`${styles.layer} ${styles.parallaxTwo}`} aria-hidden />
      <div className={`${styles.layer} ${styles.parallaxThree}`} aria-hidden />
      <div className={`${styles.layer} ${styles.parallaxFour}`} aria-hidden />
      <div className={styles.mask} aria-hidden />

      {header && <div className={styles.header}>{header}</div>}

      <Link
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
