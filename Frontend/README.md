# Paint-By-Number UI

React + Vite + TypeScript UI that fronts the FastAPI paint-by-number engine. Tailwind, DaisyUI, and AOS are wired for styling and motion. Everything lives under `Frontend/`.

Current state (PR2):
- Upload workspace with drag/drop + file picker
- Client-side validation mirroring the backend (PNG/JPEG, 15 MB, colors 3–16, width 400–4000)
- AOS/Tailwind/DaisyUI theme initialized; API wiring lands in PR3

## Stack
- React 19 + Vite + TypeScript
- TailwindCSS 3 + DaisyUI (custom theme)
- AOS for entrance/scroll animations
- Heroicons for inline SVG icons

## Setup
1) Install deps (from `Frontend/`):
   ```bash
   npm install
   ```
2) Create `.env` (see `.env.example`):
   ```bash
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```
   This points the UI at the FastAPI engine’s base URL.
3) Run the dev server:
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — type-check + production build
- `npm run lint` — ESLint
- `npm run preview` — preview the production bundle

## Project structure
- `src/App.tsx` — layout shell and onboarding sections
- `src/lib/config.ts` — API base URL helper
- `src/index.css` — global Tailwind layers, fonts, background styling
- `tailwind.config.js` — Tailwind + DaisyUI theme (pbn)
- `UI-docs/` — planning/build docs for the UI track

## Backend contract (for upcoming PRs)
- `POST /generate/` (multipart):
  - `file`: PNG/JPEG
  - `num_colors`: integer (defaults to backend value)
  - `max_width`: integer (defaults to backend value)
  - Response: base64 outline PNG, painted preview PNG, palette metadata, palette legend PDF.

We’ll convert the base64 payloads to Blob URLs for previews, downloads, and printing in subsequent PRs.
