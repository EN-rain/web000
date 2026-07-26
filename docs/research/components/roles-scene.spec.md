# RolesScene specification

## Overview

- Target: `src/components/silver-palace/RolesScene.tsx`
- Styles: `src/components/silver-palace/RolesScene.module.css`
- Screenshot: `docs/design-references/silver-palace-roles-desktop.png`
- Interaction model: click carousel, timed reveal, looping background video

## Desktop geometry

- Viewport: 1440x900, overflow hidden.
- Shared header: x=180, y=15, width=1080, height=59.
- Text block starts x=180, title around y=230, width about 430.
- Full-body artwork occupies the right 55% and reaches beyond the bottom edge.
- Portrait carousel starts x=180, y=603, width about 415, height 92.

## Content and assets

- Background video: `char_bg.mp4`; fallback `char_bg.C_73WKtR.jpg`.
- Technical overlay: `char_back.VAWs2PDN.png`.
- Fifteen `char_2d_img_*` artworks, fifteen `char_avatar_*` portraits, and fourteen name images.
- First two portraits are the two Detective variants sharing the Detective name image.
- Preserve extracted character epithets, quotes, and biographies.

## States and behavior

- Selecting a portrait sets the active character.
- Outgoing text/art fades and translates 18px down over 220ms.
- Incoming text staggers in over 450ms; artwork rises 30px and fades in.
- Active portrait receives a cream circular ring and glow.
- Prev/next wrap around all 15 characters.
- Background particles drift continuously.
- Faction Gallery opens a dark full-viewport panel using camp assets.
- Desktop wheel-down fades the character scene into a WebGL transition from
  `char_bg` to the top-aligned `news_bg`.
- The outgoing character texture becomes white etched contours along the
  mud-normal boundary; `#03 News` rises before navigation to `/en-us/news`.
- Wheel-up reverses an in-progress transition. The Faction Gallery disables
  route scrolling while open.

## Reduced motion

- Disable particle drift and use immediate state replacement.
