# Local browser, device and accessibility playtest matrix

This is an **evidence log**, not a claim that a device was tested. Start all
cells as unverified. Record the date, browser/OS/device, viewport/DPR,
test command or manual actions, result and a screenshot/log or issue reference.
Automated emulation is **not** equivalent to a real phone, GPU or screen reader.

| Scenario | Automated coverage available | Local run result | Real-device / assistive-tech evidence |
| --- | --- | --- | --- |
| Production build starts; visible WebGL scene, 2D marker, DOM; no console errors | Playwright Chromium smoke | Unverified | Unverified |
| Desktop pointer raycast, marker alignment, pause/reset, keyboard Enter/Space/R | Playwright Chromium smoke | Unverified | Unverified |
| Phone portrait with touch and DPR 2 backing surfaces | Playwright mobile-context smoke | Unverified | Unverified |
| Phone landscape, resize, unclipped controls | Playwright viewport smoke | Unverified | Unverified |
| Safe-area insets, display cutouts and high-zoom scrolling | Viewport smoke covers scrolling only | Unverified | Unverified |
| Pointer routing (2D overlay does not consume world taps) | Playwright touch/pointer smoke | Unverified | Unverified |
| Held input releases on cancel, blur and lost pointer capture (if implemented) | Game-specific regression | Not applicable to starter | Unverified |
| Real WebGL loss and restoration | Playwright, only where extension is supported | Unverified | Unverified |
| Keyboard-only navigation and visible focus | Playwright focus smoke + manual review | Unverified | Unverified |
| Reduced-motion preference | Manual assessment of game-relevant vs decorative motion | Unverified | Unverified |
| Screen reader labels and announcements | Semantic checks + VoiceOver/NVDA/TalkBack | Unverified | Unverified |
| Real iOS Safari / Android Chrome, orientation changes and thermal load | Manual physical devices | Not automated | Unverified |
| Safari / Firefox desktop and WebGL fallback | Manual cross-browser tests | Not automated | Unverified |
| Stable frame time and bounded Canvas-to-GPU texture uploads | Local performance profiler on target hardware | Not automated | Unverified |

For this starter, Canvas 2D is a separate transparent surface and is **not**
uploaded into a Three.js texture every frame. Camera movement, drag gestures,
save/load UI and multiplayer are not sample features; add corresponding test
rows if a generated game implements them.

To fill the automated column locally:

```bash
npm run check
npx playwright install chromium
npm run test:browser
```

The Playwright server builds and previews the **production** bundle. It fails
nonzero on build/startup/browser errors; missing browser or WebGL availability
is a blocker, not a pass. Device rows remain unverified until actually tested.
No GitHub Actions or hosted CI are used.
