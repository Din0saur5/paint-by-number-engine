# UI PR Roadmap

Target: React/Vite/Tailwind/DaisyUI/AOS app in `Frontend/` that uploads an image, calls `/generate/`, and presents downloads (outline PNG, painted preview, palette legend PDF) plus palette display.

## PR1 – Scaffolding & Tooling
- Init Vite React+TS project in `Frontend/`; add Tailwind, DaisyUI, AOS.
- Add base theme (custom DaisyUI palette), global fonts, layout shell, lint/format config.
- Wire `.env` handling for `VITE_API_BASE_URL`; add example in `Frontend/.env.example`.

## PR2 – Upload & Validation
- Build `UploadPanel` with drag-and-drop + file picker; client-side type/size validation (match backend limits).
- Add controls for `num_colors` and `max_width` with min/max hints; persist in state.
- Include load/error states and disable submit while pending.

## PR3 – API Integration & Data Handling
- Implement `callGenerate` using `fetch` + `FormData`; handle 400 errors gracefully.
- Add helper to convert base64 to Blob/object URLs; clean up URLs on unmount/change.
- Store response slices (outline, preview, palette, legend) in typed state; add simple unit test for helper.

## PR4 – Results UI & Downloads
- Create results layout (tabs or cards) showing outline, painted preview, palette swatches, legend CTA.
- Download buttons for outline PNG, preview PNG, legend PDF; “Print outline” flow (print-friendly view).
- Palette grid with numbered badges and hex labels; include total regions/percentages if available.

## PR5 – UX Polish & Animations
- Apply AOS to hero/sections; add Tailwind transitions to interactive elements.
- Add hero, steps, FAQ, footer content mirroring pnbify.com flow with modern styling.
- Ensure responsive breakpoints (mobile-first, two-column on md+); accessibility pass (labels, focus, alt).

## PR6 – QA & Hardening
- Manual QA checklist: type/size validation, num_colors/max_width bounds, empty file, network errors, mobile layout, downloads work, print dialog works, PDF opens.
- Add Vitest coverage for helper utilities and a render smoke test for key components.
- Prep deploy scripts (e.g., `npm run build`, static hosting instructions) and update README snippet in `Frontend/`.

## Notes
- Keep PRs tight and reviewable; attach before/after screenshots for results UI changes.
- Do not commit large binaries; use sample `test-image.png` in repo root for demos.
