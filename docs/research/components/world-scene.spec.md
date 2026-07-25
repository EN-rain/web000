# WorldScene specification

## Overview

- Target: `src/components/silver-palace/WorldScene.tsx`
- Styles: `src/components/silver-palace/WorldScene.module.css`
- Screenshot: `docs/design-references/silver-palace-world-desktop.png`
- Interaction model: wheel-driven paper scrolling, click-driven stack
  switching, and hover overlays

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
- The body and page viewport remain fixed (`overflow: hidden`); wheel input is
  consumed by the world scene.
- Each paper remains a full-height document. Wheel movement changes a target
  scroll value and an animation-frame loop eases the rendered value toward it.
- Repeated wheel input at either boundary remains clamped and does not change
  the active paper. Paper selection is separate from document scrolling.
- The full `.world-scroll-content` translates upward. At 1920x1080, the
  observed lower boundary was about `translateY(-836.875px)`.
- Every sheet also receives an additional role-based parallax translation. At
  the lower boundary, the active sheet moved another `-502.125px` (~.60 of the
  scroll value), the next sheet `-167.375px` (~.20), the far sheet `-251.062px`
  (~.30), and the previous sheet `-334.75px` (~.40). This differential motion
  is the defining desk/paper scroll effect.
- All four papers remain mounted in an absolute stack rather than replacing one
  DOM node. This is required for the visible "paper tossed onto the desk"
  choreography.
- Resting stack transforms observed at 1920x1080:
  - active: `translate(0, 0) scale(1)`, z-index 5
  - next: `translate(562.5px, 750px) scale(.75)`, z-index 3
  - previous/far papers: `translate(-181.5px, 404px) scale(1.09)` and
    `translate(78.75px, 92px) scale(1.09)`
- Switching 0 -> 1 lasts about 850-900ms. The active sheet first throws
  downward with rotation; the incoming sheet rises from below/right and settles
  at `translate(0, 0) scale(1)`.
- Motion uses a paper-like overshoot curve close to
  `cubic-bezier(.43, .14, .14, .93)`, with rotation during the middle phase.
- Wheel input is accumulated into the target and smoothly interpolated; five
  `deltaY=300` samples produced rendered content positions around -209, -455,
  -580, -742, and -794 before easing to the -836.875 boundary.
- Click navigation runs the paper-stack transition rather than crossfading or
  replacing the active image, and resets the paper scroll position to the top.
- Active thumbnail opacity 1; inactive opacity about .55.
- Hoverable image overlays crossfade to matching `_hover` assets.
- Arrow Up/Down and Page Up/Down adjust the paper scroll target; Home and End
  move to the top and bottom. They do not select another paper.

## Mobile

- Header occupies 59px.
- Side navigation becomes a bottom horizontal thumbnail rail.
- Paper scales to fit width while remaining vertically scrollable.
