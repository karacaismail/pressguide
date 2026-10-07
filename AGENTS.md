# Press eğitim rehberi

- Astro static HTML carries every reading step. React + Mantine powers only the explicitly opened personal checklist. Phosphor SVG icons render on the build server. Do not introduce hydration for the reading journey.
- Data ownership: `src/data/guide.json` holds reviewed instructional content. Screenshots live in `public/evidence/`. Never publish passwords, build tokens, private identifiers or unchecked screenshots.
- Semantic design tokens in `src/styles/tokens.css` govern colors, spacing, font sizes and interaction. Minimum readable text is 1rem. Root font size preserves browser preference.
- Start at 320 CSS px, then 360, 375, 390, landscape, tablet and desktop. This is modern browser CSS-width support, not iPhone 4 OS/browser certification.
- Touch targets are 44 CSS px, 48 for any coarse pointer. Focus uses one `:focus-visible` outline on the control. No container focus frames or native dropdowns.
- Only fresh agent-captured Press screenshots are published. Thin SVG stroke frames contain no fill; numbers stay in an external gutter and all text in captions. Never reuse user-supplied annotated screenshots.
- Optional checklist imports only after semantic button activation. Its errors preserve reading. Verify production network requests before claiming isolation.
- Commands: `npm ci`, `npm run format:check`, `npm run check`, `npm run build`, `npm run test:320`, `npm test`. `npm run test:visual` compares only independently approved references when `VISUAL_REFERENCE_REVIEW=1`.
- Lockfile contains exact versions. Node >=22.12.0; observed setup Node24.21.0/npm11.19.0. React19.3.0, Astro7.3.6, Mantine9.7.1. TypeScript6.0.2 satisfies Astro check peer contract; do not force incompatible TypeScript7.
- Never bypass personal Git author guard. Author and committer must be `karacaismail <35493655+karacaismail@users.noreply.github.com>`. No AI/bot trailers. Do not select a license without user approval.
- Public Pages documentation is separate from production server access. Do not change Press infrastructure while editing this guide.
- QA statuses must separate automated Chromium/Firefox/WebKit from physical Safari, iOS/Android, screen reader, CI and independent review. Not run is not passed.
