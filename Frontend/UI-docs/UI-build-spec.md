# Paint-By-Number UI Build Spec

Goal: build a sleek, modern React + Vite + Tailwind + DaisyUI + AOS frontend (lives entirely in `Frontend/`) that mirrors pnbify.com’s flow: upload an image, tune options, send to the FastAPI engine, then display/download the outputs (outline PNG, preview PNG, palette legend PDF, and color list).

## Stack & Project Layout
- Tooling: Vite (React + TS), TailwindCSS, DaisyUI (theme + components), AOS for scroll/entrance animations.
- Location: everything under `Frontend/` (e.g., `Frontend/package.json`, `src/`, etc.).
- Env: `.env` with `VITE_API_BASE_URL` (default `http://127.0.0.1:8000`).
- Icons/graphics: use Feather/Tabler (via React icons) and minimalist gradients; avoid default system fonts by setting a custom Tailwind font stack (e.g., `["Space Grotesk", "Inter", "sans-serif"]` served via CSS import).

## Backend Contract (FastAPI)
Base URL: `${VITE_API_BASE_URL}`

- `POST /generate/`
  - Multipart form fields:
    - `file`: uploaded image (`image/png`, `image/jpeg`, `image/jpg`)
    - `num_colors` (int, optional): default 10; allowed range from config (server enforces 3–16 by default)
    - `max_width` (int, optional): default 2550; allowed range 400–4000 by default
  - Errors: 400 for bad type/size/range; empty file; too large.
  - Response JSON:
    - `image`: `{ filename, content_type, width, height, data (base64) }`  // final outline PNG
    - `preview`: `{ filename, content_type, width, height, data (base64) }`  // painted preview PNG
    - `palette`: `{ colors: [{hex, rgb, count, percent, label/index?}], total_regions }` (exact fields come from backend palette metadata)
    - `legend`: `{ filename, content_type, data (base64) }`  // PDF palette legend

Display/download strategy:
- Convert `data` fields to `Blob` URLs for `<img>`/`<a download>`.
- Keep base64 in state only long enough to make object URLs; revoke on unmount/changes.
- Include pixel dimensions for layout skeleton.

## Core User Flow
1) Land hero: headline + CTA to upload; subtle gradient background; AOS fade-up.
2) Upload & controls card:
   - Dropzone + file picker (accept PNG/JPEG, limit 15 MB).
   - Sliders/inputs for `num_colors`, `max_width` (with min/max hints).
   - Submit button; show spinner/progress.
3) Results section:
   - Tabs or side-by-side cards for:
     - Outline PNG preview with download/print buttons.
     - Painted preview PNG.
     - Palette swatches grid (hex badges, region counts, %).
     - Palette legend PDF download button (and in-browser preview via `<embed>` or open in new tab).
   - Provide “Start over” / “Upload another” CTA.
4) Education/FAQ: short steps on how to print and paint; list constraints (file types/sizes).

## UI Requirements
- Theme: DaisyUI custom theme (cool-gray + accent color). Use utility-driven layout; avoid default component look by overriding rounded corners, border, and shadow tokens.
- Animations: AOS on section entrances; Tailwind transitions for hover states; keep it performant (no huge parallax).
- Responsiveness: Mobile-first; single column -> two-column on md+; ensure images scale but maintain aspect ratio.
- Accessibility: labeled inputs, focus states, keyboard-accessible buttons/links, alt text describing outputs.
- Feedback: inline error banners for API failures, file validation messages (type/size), loading skeletons for previews.

## Components (suggested)
- `UploadPanel`: dropzone + controls + validation messages.
- `OptionsForm`: number inputs/sliders for `num_colors`, `max_width`; debounced or on-change updates.
- `ResultsTabs`:
  - `OutlinePreviewCard`
  - `PaintedPreviewCard`
  - `PaletteSwatches`
  - `LegendDownload`
- `HeroSection`, `StepsSection`, `FAQSection`, `Footer`.

## Networking & Data Handling
- Fetch with `fetch` and `FormData`; example:
  ```ts
  const form = new FormData();
  form.append("file", file);
  form.append("num_colors", String(numColors));
  form.append("max_width", String(maxWidth));
  const res = await fetch(`${apiBase}/generate/`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  ```
- Convert base64 to Blob:
  ```ts
  const toBlobUrl = (b64: string, type: string) => {
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type });
    return URL.createObjectURL(blob);
  };
  ```
- Guard rails: prevent multiple in-flight requests; cancel/reject if new upload starts; surface 400 errors clearly.

## Printing & Downloads
- Outline PNG: download via `download` attribute; provide “Print outline” button that opens print dialog with the outline URL in a print-friendly page (white background, centered, true size if possible).
- Palette legend PDF: download button and “Open” link to view in-browser.
- Painted preview: download and share link (copy to clipboard).

## Styling Notes
- Use gradients/background shapes instead of flat white; keep contrast high.
- Typography: bold headline font (Space Grotesk), readable body (Inter).
- Buttons: DaisyUI primary/secondary variants; add subtle glow/underline for links.
- Swatches: show hex and region count; include numbered badges that match legend numbers.

## Testing & Quality
- Add minimal Vitest tests for helpers (base64->Blob, validators).
- Manual QA checklist: upload types, size >15 MB rejection, num_colors constraints, max_width constraints, bad network handling, mobile layout, print dialog from outline, PDF opens and downloads.

## Setup Commands (inside `Frontend/`)
- `npm create vite@latest . -- --template react-ts`
- `npm install -D tailwindcss postcss autoprefixer`
- `npm install daisyui aos @heroicons/react` (or chosen icon set)
- `npx tailwindcss init -p`
- Configure Tailwind to scan `index.html`, `src/**/*.{ts,tsx}`; add DaisyUI plugin; import `aos/dist/aos.css`.
