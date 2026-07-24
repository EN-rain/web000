# HomeScene specification

## Overview

- Target: `src/components/silver-palace/HomeScene.tsx`
- Styles: `src/components/silver-palace/HomeScene.module.css`
- Screenshot: `docs/design-references/silver-palace-home-desktop.png`
- Mobile: `docs/design-references/silver-palace-home-mobile.png`
- Interaction model: pointer-driven parallax and click navigation

## Structure and exact assets

- Viewport container: 100vw x 100svh, overflow hidden, black fallback.
- Five full-scene layers use `home_bg`, `home_para1` through `home_para4`.
- Every source layer is 2667x1440 and is centered with cover sizing.
- Dark edge vignette uses `home_mask.CVVcUCr3.png`.
- Ticket uses `check_en_us.B0Ccx4QE.png`.

## Desktop

- Main artwork fills 1440x900.
- Logo/header starts at x=180, width=1080, top=15, height about 60.
- Ticket is near right: 63% left, 73% top, about 370px wide.
- Pointer movement offsets layers by increasing amounts from background to foreground.

## Mobile

- Header height: 59px.
- Artwork begins immediately under header and crops around the central character.
- Ticket width: about 350px; centered; bottom about 105px.
- Parallax is disabled.

## States and behavior

- Ticket hover: translateY(-3px), slightly brighter.
- Scene transition: subtle fade-in.
- Reduced motion: no parallax.

