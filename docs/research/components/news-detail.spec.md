# NewsDetail specification

## Overview

- Target: `src/components/silver-palace/NewsDetail.tsx`
- Styles: `src/components/silver-palace/NewsDetail.module.css`
- Screenshot: `docs/design-references/silver-palace-news-detail-desktop.png`
- Interaction model: internal scroll with viewport reveals

## Desktop geometry

- Fixed header over a paper-texture background.
- Internal `.detail-scroll` is 900px high; sample article content is about 6791px.
- Centered article width 960px with title/date at the top.
- Content images are 960x540.

## Content

- Support query IDs 93, 88, 86, 71, 65, and 60.
- ID 93 uses the extracted full Combat Edition content and nine local 960x540 images.
- Other IDs use their extracted title/date/category/card image/excerpt in the same article layout.

## Behavior

- Title fades up on load.
- Article sections and images reveal with IntersectionObserver rooted to the internal scroll container.
- Images use a subtle clip-path and scale reveal.
- Back-to-news control remains sticky near the upper content edge.
- Reduced motion disables reveals.

