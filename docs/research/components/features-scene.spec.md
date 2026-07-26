# FeaturesScene specification

## Overview

- Target: `src/components/silver-palace/FeaturesScene.tsx`
- Styles: `src/components/silver-palace/FeaturesScene.module.css`
- Screenshot: `docs/design-references/silver-palace-features-desktop.png`
- Interaction model: horizontal carousel driven by click, wheel, drag, and keyboard

## Desktop geometry

- Full 1440x900 viewport, overflow hidden.
- Heading x=175, y=115, font about 72px Georgia.
- Thumbnail strip x=807, y=136, width about 430.
- Main carousel top about 340px, width 2343px.
- Active card width about 644px, height 400px, centered.
- Neighbor cards remain partially visible.

## Assets and content

- Backgrounds: `feature_bg2.DhK7u9hK.jpg`, `feature_bg.CW8kmxgY.jpg`.
- Four 1920x1080 gallery images and exact extracted titles/dates.
- Card information hover background: `feature_info_bg_hover.CFcIQiaQ.png`.

## States and behavior

- Active card scale 1 and opacity 1; neighbors scale .88 and opacity .55.
- Track uses a 600ms cubic-bezier transform.
- Thumbnail click and arrow controls set the active slide.
- Horizontal wheel, pointer drag, and keyboard arrows switch slides.
- Card hover adds a subtle zoom and reveals a play glyph.
- Autoplay advances every 6 seconds and pauses on hover/focus.
- Vertical wheel-up starts the reverse mud-normal WebGL reveal from
  `feature_bg2` to top-aligned `news_bg`; `#03 News` rises before navigation
  to `/en-us/news`.
