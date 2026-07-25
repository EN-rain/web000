# HomeScene specification

## Overview

- Target: `src/components/silver-palace/HomeScene.tsx`
- Styles: `src/components/silver-palace/HomeScene.module.css`
- Screenshot: `docs/design-references/silver-palace-home-desktop.png`
- Mobile: `docs/design-references/silver-palace-home-mobile.png`
- Interaction model: pointer parallax plus wheel-driven cinematic navigation

## Structure and exact assets

- Viewport container: 100vw x 100svh, overflow hidden, black fallback.
- Five full-scene layers use `home_bg`, `home_para1` through `home_para4`.
- A fixed transition/shader layer beneath them uses `home_bg3.wAGjrSHo.jpg`.
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
- Desktop wheel-down is captured by the fixed Home viewport; the body never
  scrolls.
- The first downward wheel movement fades the five-layer hero to reveal the
  `home_bg3` transition background. Live timing is about 320ms, with the hero
  class losing its ready state immediately and reaching opacity 0 around 320ms.
- The CTA/ticket exits separately with opacity 1 -> 0, translateY(0 -> 6px),
  and blur(0 -> 3px), also over about 320ms.
- Continued wheel-down advances a transition title for the next route:
  `#02 Character Introduction`.
- At 1920x1080 the transition title is positioned around x=232, top=225,
  centered vertically by its own transform. `#02` is 18px and muted gray;
  `Character Introduction` is 90px/90px white serif.
- Title progress changes opacity 0 -> 1 and translateY(300px -> 0). It is
  driven continuously by accumulated wheel distance, not a one-shot timeout.
- At the end of the title movement, navigation changes to `/en-us/roles`.
- Wheel-up before the route threshold reverses the title and restores the Home
  artwork. Arrow/Page Down and Up mirror the wheel progress.
- The transition background uses slight scale, brightness, and chromatic
  movement to emulate the original WebGL shader while remaining asset-local.
- Reduced motion: no parallax.
