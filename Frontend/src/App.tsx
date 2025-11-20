import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  ServerStackIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import AOS from 'aos'
import { apiBaseUrl, appName } from './lib/config'
import {
  ACCEPTED_TYPES,
  DEFAULT_COLORS,
  DEFAULT_WIDTH,
  MAX_COLORS,
  MAX_UPLOAD_BYTES,
  MAX_WIDTH,
  MIN_COLORS,
  MIN_WIDTH,
} from './lib/constants'
import { validateFile, validateForm, type ValidationIssue } from './lib/validation'

const formatBytes = (bytes: number) => {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [numColors, setNumColors] = useState<number>(DEFAULT_COLORS)
  const [maxWidth, setMaxWidth] = useState<number>(DEFAULT_WIDTH)
  const [issue, setIssue] = useState<ValidationIssue | null>(null)
  const [validated, setValidated] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 80 })
  }, [])

  const trySetFile = (incoming: File | null) => {
    const fileIssue = validateFile(incoming)
    setIssue(fileIssue)
    if (!fileIssue && incoming) {
      setFile(incoming)
      setValidated(false)
    } else {
      setFile(null)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const droppedFile = event.dataTransfer.files?.[0]
    trySetFile(droppedFile ?? null)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    trySetFile(event.target.files?.[0] ?? null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidated(false)
    const fileIssue = validateFile(file)
    if (fileIssue) {
      setIssue(fileIssue)
      return
    }
    const formIssue = validateForm(numColors, maxWidth)
    if (formIssue) {
      setIssue(formIssue)
      return
    }
    setIssue(null)
    setValidated(true)
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-card">
              <SparklesIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Paint-By-Number Engine</p>
              <h1 className="text-xl font-semibold text-slate-900">{appName}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-white px-3 py-1 text-slate-600 shadow-sm">
              API base: <span className="font-medium text-slate-800">{apiBaseUrl}</span>
            </span>
            <span className="rounded-full bg-primary text-primary-content px-3 py-1 shadow-card">
              PR2 · Upload + validation ready
            </span>
          </div>
        </header>

        <section className="grid gap-8 rounded-3xl bg-white/80 p-8 shadow-card backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6" data-aos="fade-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              Modern UI track
            </p>
            <h2 className="text-4xl font-semibold leading-tight">
              Upload, validate, and prep your paint-by-number run.
            </h2>
            <p className="text-lg text-slate-600">
              Drag-and-drop, file picker, and guardrails mirror the FastAPI engine: PNG/JPEG only, 15&nbsp;MB max,
              colors and resize width within the backend limits. Next PR wires the /generate/ call.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#upload"
                className="btn btn-primary btn-lg no-underline shadow-lg shadow-primary/30"
              >
                Try the upload
              </a>
              <a
                href="#stack"
                className="btn btn-ghost btn-lg text-slate-700 hover:bg-slate-100 no-underline"
              >
                View stack
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Vite + React + TS + Tailwind + DaisyUI + AOS are wired',
                'Env-driven API base URL (VITE_API_BASE_URL)',
                'Client-side validation matches backend limits',
                'UI ready for /generate/ integration (PR3)',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm font-medium text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-6 shadow-inner"
            data-aos="fade-left"
          >
            <div className="absolute inset-x-10 top-10 h-52 rounded-full bg-white/70 blur-3xl" />
            <div className="relative space-y-4 text-sm text-slate-700">
              <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow">
                <div className="flex items-center gap-3">
                  <CloudArrowUpIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Upload panel</p>
                    <p className="text-xs text-slate-500">Drag + drop, type/size guards</p>
                  </div>
                </div>
                <span className="badge badge-primary badge-outline">Live</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow">
                <div className="flex items-center gap-3">
                  <ServerStackIcon className="h-5 w-5 text-slate-700" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">/generate/ wiring</p>
                    <p className="text-xs text-slate-500">FormData → FastAPI</p>
                  </div>
                </div>
                <span className="badge badge-outline border-slate-200 text-slate-700">PR3</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow">
                <div className="flex items-center gap-3">
                  <ArrowDownTrayIcon className="h-5 w-5 text-orange-500" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Outline & preview</p>
                    <p className="text-xs text-slate-500">Downloads + print</p>
                  </div>
                </div>
                <span className="badge badge-outline border-orange-300 bg-orange-50 text-orange-600">
                  PR4
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow">
                <div className="flex items-center gap-3">
                  <Cog6ToothIcon className="h-5 w-5 text-secondary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">UX polish</p>
                    <p className="text-xs text-slate-500">AOS & microinteractions</p>
                  </div>
                </div>
                <span className="badge badge-secondary badge-outline">PR5</span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="upload"
          className="grid gap-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-card lg:grid-cols-[1.05fr_0.95fr]"
          data-aos="fade-up"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-outline">PR2</span>
              <p className="text-sm font-medium text-slate-600">Upload + validation</p>
            </div>
            <h3 className="text-2xl font-semibold">Upload workspace</h3>
            <p className="text-slate-600">
              Drop a PNG or JPEG, tune the number of colors, and set a resize width. Validation matches the backend:
              3–16 colors, 400–4000px width, and 15&nbsp;MB max uploads. Submitting here validates locally; PR3 will
              post to <code className="font-mono text-xs">/generate/</code>.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 px-6 py-8 text-center transition hover:border-primary hover:bg-primary/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CloudArrowUpIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">Drag and drop your image</p>
                  <p className="text-sm text-slate-600">
                    or{' '}
                    <button
                      type="button"
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      browse files
                    </button>
                    .
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Accepted: PNG, JPEG · Max size {formatBytes(MAX_UPLOAD_BYTES)}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={ACCEPTED_TYPES.join(',')}
                  onChange={handleFileChange}
                />
              </div>

              {file && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
                  <div>
                    <p className="font-semibold text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-600">
                      {formatBytes(file.size)} · {file.type || 'image'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setFile(null)
                      setValidated(false)
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">Number of colors</span>
                    <span className="badge badge-ghost text-xs">
                      {MIN_COLORS}–{MAX_COLORS}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={MIN_COLORS}
                    max={MAX_COLORS}
                    value={numColors}
                    onChange={(e) => setNumColors(Number(e.target.value))}
                    className="input input-bordered w-full"
                  />
                  <p className="text-xs text-slate-500">Backend default: {DEFAULT_COLORS}</p>
                </label>

                <label className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">Max width (px)</span>
                    <span className="badge badge-ghost text-xs">
                      {MIN_WIDTH}–{MAX_WIDTH}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={MIN_WIDTH}
                    max={MAX_WIDTH}
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(Number(e.target.value))}
                    className="input input-bordered w-full"
                  />
                  <p className="text-xs text-slate-500">Backend default: {DEFAULT_WIDTH}</p>
                </label>
              </div>

              {issue && (
                <div className="alert alert-error bg-error/10 text-sm text-error">
                  <div className="flex-1">
                    <p className="font-semibold">Validation failed</p>
                    <p>{issue.message}</p>
                  </div>
                </div>
              )}

              {validated && (
                <div className="alert alert-success bg-success/10 text-sm text-success">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                    Ready for /generate/
                  </div>
                  <div className="text-slate-700">
                    <p className="text-sm">
                      Looks good. Next step (PR3) will post this image and settings to the FastAPI engine.
                    </p>
                    <p className="text-xs text-slate-600">
                      File: {file?.name} · Colors: {numColors} · Max width: {maxWidth}px
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="btn btn-primary">
                  Validate input
                </button>
                <span className="text-sm text-slate-600">
                  We will convert these values into <code className="font-mono text-xs">FormData</code> for the
                  <code className="font-mono text-xs"> /generate/</code> endpoint in PR3.
                </span>
              </div>
            </form>
          </div>

          <div className="space-y-4 rounded-2xl bg-slate-50 p-6 shadow-inner">
            <p className="text-sm font-semibold text-slate-800">Backend guardrails (mirrored here)</p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                PNG or JPEG only; max size {formatBytes(MAX_UPLOAD_BYTES)}.
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                num_colors between {MIN_COLORS} and {MAX_COLORS} (default {DEFAULT_COLORS}).
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                max_width between {MIN_WIDTH}px and {MAX_WIDTH}px (default {DEFAULT_WIDTH}px).
              </li>
            </ul>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Preview: request payload</p>
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-700">
                POST /generate/ (multipart/form-data)<br />
                • file: &lt;binary&gt;<br />
                • num_colors: {numColors}<br />
                • max_width: {maxWidth}
              </p>
              <p className="mt-2 text-slate-600">
                Response includes outline PNG, painted preview, palette metadata, and legend PDF (handled in PR3–PR4).
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-primary/40 bg-white p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Next</p>
              <p className="mt-1">
                Wire <code className="font-mono text-xs">fetch</code> with <code className="font-mono text-xs">FormData</code>,
                stream base64 responses to Blob URLs, and render outline/preview downloads.
              </p>
            </div>
          </div>
        </section>

        <section
          id="stack"
          className="grid gap-6 rounded-3xl bg-white/90 p-8 shadow-card lg:grid-cols-[1.1fr_0.9fr]"
          data-aos="fade-up"
        >
          <div className="space-y-4">
            <p className="badge badge-outline">Stack</p>
            <h3 className="text-2xl font-semibold">Ready for feature work</h3>
            <p className="text-slate-600">
              Tailwind, DaisyUI, and AOS are installed and configured. Use{' '}
              <span className="font-mono">npm run dev</span> in <span className="font-mono">Frontend/</span> to start the UI.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Upload ready', desc: 'Drag/drop + file picker with validation.', icon: CloudArrowUpIcon },
                { title: '/generate/ next', desc: 'FormData integration planned for PR3.', icon: ServerStackIcon },
                { title: 'Downloads coming', desc: 'Outline, preview, palette legend in PR4.', icon: ArrowDownTrayIcon },
                { title: 'Polish queued', desc: 'Animations, swatches, print view in PR5.', icon: Cog6ToothIcon },
              ].map(({ title, desc, icon: Icon }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <p className="font-semibold text-slate-900">{title}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
            <p className="text-sm font-semibold text-slate-800">Developer quickstart</p>
            <ol className="mt-3 space-y-2 text-sm text-slate-700">
              <li>1) <code className="font-mono">cd Frontend && npm install</code></li>
              <li>
                2) Add <code className="font-mono">VITE_API_BASE_URL</code> to{' '}
                <code className="font-mono">.env</code> (see example).
              </li>
              <li>3) <code className="font-mono">npm run dev</code> — try the upload flow.</li>
            </ol>
            <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-white p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Roadmap</p>
              <p className="mt-1">
                PR2: upload + validation (done), PR3: API wiring, PR4: results UI, PR5: polish + AOS choreography.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
