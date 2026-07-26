"use client";

import type { RefObject } from "react";
import { useLayoutEffect } from "react";

const ROUTE_ENTRY_KEY = "silver-palace-route-entry";
const ROUTE_ENTRY_MAX_AGE = 5000;
const ROUTE_ENTRY_DATASET_KEY = "silverRouteEntry";
const ROUTE_ENTRY_BACKGROUND_HOLD = 420;

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

    if (
      !marker ||
      marker.destination !== routePath ||
      Date.now() - marker.createdAt > ROUTE_ENTRY_MAX_AGE
    ) {
      try {
        window.sessionStorage.removeItem(ROUTE_ENTRY_KEY);
        delete document.documentElement.dataset[ROUTE_ENTRY_DATASET_KEY];
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

    const startEntrance = () => {
      scene.dataset.routeEntry = marker.direction;
      scene.dataset.routeEntryReady = "false";
      delete document.documentElement.dataset[ROUTE_ENTRY_DATASET_KEY];

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
      clearRouteEntrance(scene);
    };
  }, [routePath, sceneRef]);
}
