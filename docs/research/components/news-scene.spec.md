# NewsScene specification

## Overview

- Target: `src/components/silver-palace/NewsScene.tsx`
- Styles: `src/components/silver-palace/NewsScene.module.css`
- Screenshot: `docs/design-references/silver-palace-news-desktop.png`
- Interaction model: internal scroll, tabs, pagination, hover previews

## Desktop geometry

- Full viewport with fixed header.
- `.news-scroll`: 900px viewport, about 1717px content, overflow-y auto.
- Main width about 1080px, left x=180.
- News heading at x=180, y=165.
- Hero list x=194, y=320, width about 400.
- Layered preview x=730, y=214, width about 565.
- Category row y=689.
- Cards form a three-column grid below y=780.

## Assets and content

- Background `news_bg.LVNfMlKE.jpg`.
- Layered hero paper and stamp assets.
- Six extracted card images and exact titles/dates/categories/excerpts.
- Tabs: Latest, News, Notices, Events.

## States and behavior

- Hovering a hero headline changes the preview image with a 300ms crossfade and highlights the row.
- Category changes crossfade the card grid and filters by category.
- Cards rise 8px, brighten, and gain shadow on hover.
- Cards link to `/en-us/newsDetail?id=<id>`.
- Content reveals when entering the internal scroll viewport.
- Pager changes visible records and smoothly returns to the grid.
- Vertical wheel input continues to scroll `.news-scroll` normally until its
  bottom boundary.
- Further wheel-down starts the WebGL route transition from top-aligned
  `news_bg` to `feature_bg2`; contours are applied to the incoming gallery
  texture and `#04 Media Gallery` rises before `/en-us/features`.
- At the top boundary, wheel-up runs the same shader in reverse toward
  `char_bg`; `#02 Character Introduction` rises before `/en-us/roles`.
- Opposite wheel input reverses an in-progress transition before its commit
  threshold.
