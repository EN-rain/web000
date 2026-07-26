# Silver Palace behaviors

- Header remains fixed and translucent over both scenes.
- `Show More` opens navigation; the clone exposes Home and World destinations.
- Header controls brighten on hover.
- Home layers move at different rates with pointer movement on desktop.
- Home uses a fixed 2667:1440 artwork composition with `cover`-style cropping.
- Home captures desktop wheel input as cinematic route progress: the layered
  hero fades to `home_bg3`, the `#02 Character Introduction` title rises from
  300px below, and completion navigates to `/en-us/roles`. Wheel-up reverses it.
- The Home transition uses a live WebGL mud-normal reveal: the outgoing
  artwork becomes white etched contours along an irregular rising boundary,
  while the Character Introduction background replaces the lower field.
- World is primarily wheel-driven: a fixed viewport consumes wheel input and
  smoothly translates the full desk while each stacked paper moves at a
  different parallax rate. Continued wheel input at a boundary remains clamped.
- World keeps all four papers mounted and uses roughly 900ms translated,
  rotated, scaled stack transitions when a thumbnail selects another paper.
- Active world thumbnail is brighter and slightly enlarged.
- World overlays crossfade from normal to hover artwork.
- Mobile replaces the wide desktop header with logo, pre-register, icon, and hamburger.
- Mobile home crops the artwork around the central character and centers the ticket near the bottom.
- Reduced-motion users receive no pointer parallax or decorative drift.
- Shared menu expands into five numbered route rows and staggers them into view.
- Character selection crossfades the name, quote, biography, and full-body artwork while the artwork slides upward.
- Character background video loops silently; decorative particles drift continuously.
- News uses an internal scroll container; hero and cards reveal with opacity/translate transitions.
- News category buttons crossfade and filter cards; pagination scrolls the content region back to the card grid.
- Character Introduction continues to News through the shared mud-normal WebGL
  wheel reveal. News preserves its internal scroll and starts the same route
  effect only after the scroll container reaches the bottom.
- News transitions into Media Gallery with `feature_bg2` rising beneath the
  irregular contour boundary.
- Wheel-up mirrors that WebGL route chain: Media Gallery returns to News, News
  returns to Character Introduction at its top boundary, and Character
  Introduction returns to Home.
- Article headings, paragraphs, and images reveal as they enter the internal scroll viewport.
- Media Gallery uses a horizontally translated track. The active card scales to 1 while neighbors dim and scale down.
- Gallery supports buttons, thumbnails, mouse wheel, keyboard arrows, and pointer drag.
- All motion is disabled or shortened under `prefers-reduced-motion`.
