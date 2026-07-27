"use client";

import type { RefObject } from "react";
import { useLayoutEffect } from "react";

const ROUTE_ENTRY_KEY = "silver-palace-route-entry";
const ROUTE_ENTRY_MAX_AGE = 5000;
const ROUTE_ENTRY_DATASET_KEY = "silverRouteEntry";
const ROUTE_ENTRY_BACKGROUND_HOLD = 0;
const ROUTE_BACKGROUNDS: Record<string, string> = {
  "/en-us/home": "/silver-palace/home_bg3.wAGjrSHo.jpg",
  "/en-us/roles": "/silver-palace/char_bg.C_73WKtR.jpg",
  "/en-us/news": "/silver-palace/news_bg.LVNfMlKE.jpg",
  "/en-us/features": "/silver-palace/feature_bg2.DhK7u9hK.jpg",
};
const ROUTE_LABELS: Record<string, { number: string; name: string }> = {
  "/en-us/home": { number: "#01", name: "Home" },
  "/en-us/roles": { number: "#02", name: "Character Introduction" },
  "/en-us/news": { number: "#03", name: "News" },
  "/en-us/features": { number: "#04", name: "Media Gallery" },
};

type RouteEntryDirection = "forward" | "backward";

type RouteEntryMarker = {
  destination: string;
  direction: RouteEntryDirection;
  createdAt: number;
};

export function markRouteEntrance(
  destination: string,
  direction: RouteEntryDirection,
) {
  try {
    const marker: RouteEntryMarker = {
      destination,
      direction,
      createdAt: Date.now(),
    };
    window.sessionStorage.setItem(ROUTE_ENTRY_KEY, JSON.stringify(marker));
    document.documentElement.dataset[ROUTE_ENTRY_DATASET_KEY] = direction;
    document.documentElement.dataset.silverRouteCarry = "active";
    const background = ROUTE_BACKGROUNDS[destination];
    if (background) {
      document.documentElement.style.setProperty(
        "--silver-route-entry-background",
        `url("${background}")`,
      );
    }
    const label = ROUTE_LABELS[destination];
    if (label) {
      document.documentElement.style.setProperty(
        "--silver-route-number",
        `"${label.number}"`,
      );
      document.documentElement.style.setProperty(
        "--silver-route-name",
        `"${label.name}"`,
      );
    }
  } catch {
    // Route navigation still works when storage is unavailable.
  }
}

export function clearRouteEntrance(element: HTMLElement | null) {
  element?.removeAttribute("data-route-entry");
  element?.removeAttribute("data-route-entry-ready");
}

export function useRouteEntrance(
  sceneRef: RefObject<HTMLElement | null>,
  routePath: string,
) {
  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    let marker: RouteEntryMarker | null = null;
    try {
      const stored = window.sessionStorage.getItem(ROUTE_ENTRY_KEY);
      if (stored) {
        marker = JSON.parse(stored) as RouteEntryMarker;
      }
    } catch {
      return;
    }

    if (!marker || marker.destination !== routePath) {
      return;
    }

    if (Date.now() - marker.createdAt > ROUTE_ENTRY_MAX_AGE) {
      try {
        window.sessionStorage.removeItem(ROUTE_ENTRY_KEY);
        delete document.documentElement.dataset[ROUTE_ENTRY_DATASET_KEY];
        document.documentElement.style.removeProperty(
          "--silver-route-entry-background",
        );
        delete document.documentElement.dataset.silverRouteCarry;
      } catch {
        // Ignore storage cleanup failures.
      }
      return;
    }

    let commitFrame = 0;
    let startTimer = 0;
    let firstFrame = 0;
    let secondFrame = 0;
    let cleanupTimer = 0;
    let storageTimer = 0;
    let carryTimer = 0;

    const startEntrance = () => {
      scene.dataset.routeEntry = marker.direction;
      scene.dataset.routeEntryReady = "false";
      delete document.documentElement.dataset[ROUTE_ENTRY_DATASET_KEY];
      document.documentElement.dataset.silverRouteCarry = "out";
      document.documentElement.style.removeProperty(
        "--silver-route-entry-background",
      );

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          scene.dataset.routeEntryReady = "true";
        });
      });
      cleanupTimer = window.setTimeout(
        () => clearRouteEntrance(scene),
        1250,
      );
      storageTimer = window.setTimeout(() => {
        try {
          window.sessionStorage.removeItem(ROUTE_ENTRY_KEY);
        } catch {
          // Ignore storage cleanup failures.
        }
      }, 100);
      carryTimer = window.setTimeout(() => {
        delete document.documentElement.dataset.silverRouteCarry;
        document.documentElement.style.removeProperty("--silver-route-number");
        document.documentElement.style.removeProperty("--silver-route-name");
      }, 700);
    };

    const waitForRouteCommit = () => {
      const mainScenes = document.querySelectorAll("main");
      if (
        window.location.pathname === routePath &&
        mainScenes.length === 1 &&
        mainScenes[0] === scene
      ) {
        startTimer = window.setTimeout(
          startEntrance,
          ROUTE_ENTRY_BACKGROUND_HOLD,
        );
      } else {
        commitFrame = window.requestAnimationFrame(waitForRouteCommit);
      }
    };

    waitForRouteCommit();

    return () => {
      window.cancelAnimationFrame(commitFrame);
      window.clearTimeout(startTimer);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(cleanupTimer);
      window.clearTimeout(storageTimer);
      window.clearTimeout(carryTimer);
      clearRouteEntrance(scene);
    };
  }, [routePath, sceneRef]);
}
