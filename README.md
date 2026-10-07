# Press eğitim rehberi

Turkish operational guide for the Press learning journey. Static Astro output remains readable without JavaScript. Mantine React checklist is downloaded on explicit activation. Phosphor icons are server-rendered SVG.

## Local checks

```sh
npm ci
npm run format:check
npm run check
npm run build
npm run test:320
npm test
```

GitHub Pages base: `/pressguide/`. Deploy only `dist/`; source remains in the public repository. Licensing requires explicit user choice. `private:true` prevents npm publication and does not set GitHub repository visibility.

Instructional content comes from `src/data/guide.json`. Missing content displays an honest preparation state. Screenshots are reviewed before publication, loaded lazily and highlighted with thin transparent SVG frames and external numbered captions; user-supplied screenshots are excluded. A historical screenshot is never labeled live verification.

Capture policy: only agent-captured `public/evidence/fresh-*.jpg` files are published (18 files). Each is cropped at capture time so private fields stay outside the frame; App Source captures are 1280×585 so the GitHub Installation ID is not in the image. A step whose screenshot was not re-captured keeps its text but states that it records a past observation, not a live image. Current content: 54 steps, 25 with screenshots, 25 step detail pages, 26 built pages.

QA runs the built site through a loopback-only test server on port47321. Astro7 preview is daemonized, so the browser test runner uses a deterministic local static server. Critical widths320/360/375/390, landscape480×320, content boundary639/640/641, tablet768/1024 and desktop1280 run in Chromium, Firefox and WebKit. Real Safari and physical devices require separate evidence.

Initial budget on a cold built-route journey excluding lazy user screenshots: HTML <=50KiB gzip, shared CSS <=8KiB gzip, bootstrap <=4KiB gzip. Optional checklist resources must receive zero requests before activation. Compressed bundle bytes are separate from real transferred-byte evidence. No visual baseline is approved automatically; candidate screenshots need independent review.

TDD evidence: the initial semantic placeholder served successfully; Chromium320 critical reading test failed because navigation named `Rehber bölümleri` was absent. The complete guide implements this journey; rerun checks before deployment.
