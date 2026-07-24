# WorldScene specification

## Overview

- Target: `src/components/silver-palace/WorldScene.tsx`
- Styles: `src/components/silver-palace/WorldScene.module.css`
- Screenshot: `docs/design-references/silver-palace-world-desktop.png`
- Interaction model: click-driven state switching and hover overlays

## Structure and exact assets

- Viewport container: 100vw x 100svh, overflow hidden.
- Background: `world_bg.D5LtmynE.jpg`, cover, centered.
- Active paper backgrounds:
  - Observer: `world_paper_1.Bp11zWZ_.jpg`
  - Survival: `world_paper_2_bg.D-OSo_EA.png`
  - View: `world_paper_3_bg.YCKr8oUu.png`
  - Science: `world_paper_4_bg.0HSQ_FQ9.png`
- Matching text overlays use `world_paper1_txt_en` through `world_paper4_txt_en`.
- Thumbnail assets use `world_paper_1.DFyXVgb-.png` through `world_paper_4.BF6yeVwn.png`.
- Decorative sheet uses `world_baiyin_ele.CKmsAp8R.png`.

## Desktop

- Main observer paper is centered around x=242, y=129, width about 810px at 1440x900.
- Layered sheets peek from the left, right, and bottom.
- Right navigation begins around x=1305, y=100 and is 105px wide.
- Main paper is taller than the viewport and clips at the bottom.

## States and behavior

- Four buttons: Silvernia Observer, The Art of Survival, Silvernia in View, The Science of All Things.
- Click changes the active paper with 300ms opacity/translate transition.
- Active thumbnail opacity 1; inactive opacity about .55.
- Hoverable image overlays crossfade to matching `_hover` assets.
- Paper area accepts wheel scrolling without moving the body.

## Mobile

- Header occupies 59px.
- Side navigation becomes a bottom horizontal thumbnail rail.
- Paper scales to fit width while remaining vertically scrollable.

