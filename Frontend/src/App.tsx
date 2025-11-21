import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ServerStackIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import AOS from 'aos'
import { buildObjectUrls, generatePaintByNumber, type GenerateResponse } from './lib/api'
import { appName } from './lib/config'
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
import { revokeObjectUrls } from './lib/blobs'
import { openPrintWindow } from './lib/print'
import { validateFile, validateForm } from './lib/validation'

type ResultState = {
  payload: GenerateResponse
  outlineUrl: string
  previewUrl: string
  legendUrl: string
}

const formatBytes = (bytes: number) => {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`
}

const formatDimensions = (asset: { width?: number; height?: number }) => {
  if (!asset.width || !asset.height) return '—'
  return `${asset.width} × ${asset.height}px`
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [numColors, setNumColors] = useState<number>(DEFAULT_COLORS)
  const [maxWidth, setMaxWidth] = useState<number>(DEFAULT_WIDTH)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)
  const [activeTab, setActiveTab] = useState<'outline' | 'preview' | 'palette' | 'legend'>('outline')
  const [toast, setToast] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(
    null,
  )
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlsRef = useRef<string[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const loadingTimerRef = useRef<number | null>(null)

  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 80 })
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      revokeObjectUrls(objectUrlsRef.current)
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current)
      }
    }
  }, [])

  const cleanupObjectUrls = () => {
    revokeObjectUrls(objectUrlsRef.current)
    objectUrlsRef.current = []
  }

  const trySetFile = (incoming: File | null) => {
    const fileIssue = validateFile(incoming)
    if (!fileIssue && incoming) {
      setFile(incoming)
      setResult(null)
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(null)
    setToast(null)

    const fileIssue = validateFile(file)
    if (fileIssue) {
      setToast({ type: 'error', message: fileIssue.message })
      toastTimerRef.current = window.setTimeout(() => setToast(null), 4000)
      return
    }
    const formIssue = validateForm(numColors, maxWidth)
    if (formIssue) {
      setToast({ type: 'error', message: formIssue.message })
      toastTimerRef.current = window.setTimeout(() => setToast(null), 4000)
      return
    }

    setIsSubmitting(true)
    cleanupObjectUrls()
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setToast({ type: 'info', message: 'Generating your kit…' })
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }

    try {
      const payload = await generatePaintByNumber({
        file: file as File,
        numColors,
        maxWidth,
        signal: controller.signal,
      })
      const urls = buildObjectUrls(payload)
      objectUrlsRef.current = [urls.outlineUrl, urls.previewUrl, urls.legendUrl]
      setResult({ payload, ...urls })
      setActiveTab('outline')
      setToast({ type: 'success', message: 'Your kit is ready. Scroll down to view and download.' })
      toastTimerRef.current = window.setTimeout(() => setToast(null), 4000)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      const message = err instanceof Error ? err.message : 'Request failed. Try again.'
      setToast({ type: 'error', message: message || 'Request failed. Try again.' })
      toastTimerRef.current = window.setTimeout(() => setToast(null), 4500)
    } finally {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current)
      }
      loadingTimerRef.current = window.setTimeout(() => {
        setIsSubmitting(false)
      }, 2000)
      abortRef.current = null
    }
  }

  const handleButtonRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const ripple = document.createElement('span')
    ripple.className = 'btn-ripple-outline'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    button.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
  }

  const handleButtonPointer = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    event.currentTarget.style.setProperty('--mx', `${x}px`)
    event.currentTarget.style.setProperty('--my', `${y}px`)
  }

  const paletteSummary = useMemo(() => {
    const total = result?.payload.palette.length ?? 0
    const first = result?.payload.palette[0]?.hex
    const last = result?.payload.palette.at(-1)?.hex
    return { total, first, last }
  }, [result])

  return (
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 lg:px-8">
        {toast && (
          <div
            className={`fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm shadow-lg ${
              toast.type === 'error'
                ? 'bg-error text-white shadow-error/40'
                : toast.type === 'success'
                  ? 'bg-success text-white shadow-success/40'
                  : 'bg-primary text-white shadow-primary/30'
            }`}
          >
            {toast.message}
          </div>
        )}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-card">
              <SparklesIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Upload, generate, download</p>
              <h1 className="text-xl font-semibold text-slate-900">{appName}</h1>
            </div>
          </div>
          <span className="rounded-full bg-primary text-primary-content px-3 py-1 shadow-card">
            Ready to generate
          </span>
        </header>

        <section className="grid gap-8 rounded-3xl bg-white/90 p-8 shadow-card backdrop-blur lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-4" data-aos="fade-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              Turn your photo into a kit
            </p>
            <h2 className="text-4xl font-semibold leading-tight">Upload, get your outline and palette.</h2>
            <p className="text-lg text-slate-600">
              Drop a PNG or JPEG, choose how many colors you want, and we’ll return an outline, a painted preview, your
              palette, and a printable legend PDF.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 ">
              {[
                'PNG/JPEG up to 15 MB',
                '3–16 colors, resize up to 4000px',
                'Downloads: outline, preview, legend PDF',
                'Print-friendly outline built-in',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 shadow-inner px-4 py-3"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm font-medium text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4" data-aos="fade-left">
            <form className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-card" onSubmit={handleSubmit}>
              <h4 className="text-lg font-semibold text-slate-900">Upload & options</h4>
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
                <p className="text-xs text-slate-500">PNG/JPEG · Max {formatBytes(MAX_UPLOAD_BYTES)}</p>
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
                      setResult(null)
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
                  <p className="text-xs text-slate-500">Default {DEFAULT_COLORS}</p>
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
                  <p className="text-xs text-slate-500">Default {DEFAULT_WIDTH}</p>
                </label>
              </div>

              <button
                type="submit"
                className={`btn btn-primary rounded-full w-full btn-liquid ${isSubmitting ? 'btn-liquid-loading' : ''}`}
                disabled={isSubmitting}
                onClick={(e) => {
                  handleButtonRipple(e)
                  if (isSubmitting) {
                    e.preventDefault()
                  }
                }}
                onMouseMove={handleButtonPointer}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner" aria-hidden="true" />
                    Loading…
                  </>
                ) : (
                  'Generate kit'
                )}
              </button>
              <p className="text-xs text-slate-500 text-center">
                You’ll get an outline, painted preview, palette, and legend PDF—ready to download or print.
              </p>
            </form>

            {result && (
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-inner">
                <div className="flex items-center justify-between gap-2 text-sm text-success">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                    <span>Generated via /generate/. Assets below are ready.</span>
                  </div>
                  <span className="badge badge-ghost text-xs text-slate-600">
                    Palette: {paletteSummary.total} colors{' '}
                    {paletteSummary.first ? `(${paletteSummary.first}…${paletteSummary.last})` : ''}
                  </span>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Result</p>
                    <h4 className="text-lg font-semibold text-slate-900">Outline & Preview</h4>
                    <p className="text-sm text-slate-600">
                      Toggle outline or painted preview, download files, or open a print-friendly outline view.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(['outline', 'preview'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
                        >
                          {tab === 'outline' ? 'Outline' : 'Preview'}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{activeTab === 'outline' ? 'Outline PNG' : 'Painted preview'}</span>
                        <span>
                          {activeTab === 'outline'
                            ? formatDimensions(result.payload.image)
                            : formatDimensions(result.payload.preview)}
                        </span>
                      </div>
                      <div className="mt-3 overflow-hidden rounded-md bg-slate-50">
                        <img
                          src={activeTab === 'outline' ? result.outlineUrl : result.previewUrl}
                          alt={activeTab === 'outline' ? 'Generated outline' : 'Painted preview'}
                          className="mx-auto max-h-72 w-full object-contain"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        {activeTab === 'outline' ? (
                          <>
                            <a
                              href={result.outlineUrl}
                              download={result.payload.image.filename}
                              className="btn btn-sm btn-primary"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
                              Download outline
                            </a>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              onClick={() => openPrintWindow(result.outlineUrl, 'Paint-By-Number Outline')}
                            >
                              <PrinterIcon className="h-4 w-4" aria-hidden="true" />
                              Print outline
                            </button>
                          </>
                        ) : (
                          <a
                            href={result.previewUrl}
                            download={result.payload.preview.filename}
                            className="btn btn-sm btn-secondary"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
                            Download preview
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Palette</p>
                    <h4 className="text-lg font-semibold text-slate-900">Colors & swatches</h4>
                    <p className="text-sm text-slate-600">
                      Numbered swatches from the engine. Match these with the legend PDF when printing.
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {result.payload.palette.map((entry) => (
                        <div
                          key={entry.number}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <span className="badge badge-ghost text-xs font-semibold">#{entry.number}</span>
                            <span className="font-mono text-xs">{entry.hex}</span>
                          </div>
                          <span
                            className="h-6 w-6 rounded-md border border-slate-200"
                            style={{ backgroundColor: entry.hex }}
                            aria-label={`Color ${entry.number} ${entry.hex}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Palette legend</p>
                    <h4 className="text-lg font-semibold text-slate-900">PDF download</h4>
                    <p className="text-sm text-slate-600">
                      Download or open the legend in-browser. Pair it with the outline for printing.
                    </p>
                    <dl className="mt-3 space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <dt>Filename</dt>
                        <dd className="font-mono">{result.payload.legend.filename}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Type</dt>
                        <dd>{result.payload.legend.content_type}</dd>
                      </div>
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <a
                        href={result.legendUrl}
                        download={result.payload.legend.filename}
                        className="btn btn-sm"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" aria-hidden="true" />
                        Download PDF
                      </a>
                      <a
                        href={result.legendUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-ghost"
                      >
                        Open in new tab
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
{/* 
          <div className="space-y-4 rounded-2xl bg-slate-50 p-6 shadow-inner">
            <p className="text-sm font-semibold text-slate-800">Backend guardrails</p>
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
              <p className="font-semibold text-slate-900">What you get</p>
              <ul className="mt-2 space-y-1 text-slate-700">
                <li>• Printable outline PNG</li>
                <li>• Painted preview PNG</li>
                <li>• Palette legend PDF</li>
                <li>• Color swatches with hex codes</li>
              </ul>
            </div>
            <div className="rounded-xl border border-dashed border-primary/40 bg-white p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Next</p>
              <p className="mt-1">
                Final polish: animations, accessibility pass, and print-view refinements.
              </p>
            </div>
          </div> */}
        </section>

        <section
          id="stack"
          className="grid gap-6 rounded-3xl bg-white/90 p-8 shadow-card lg:grid-cols-[1.1fr_0.9fr]"
          data-aos="fade-up"
        >
          <div className="space-y-4">
            <p className="badge badge-outline">Stack</p>
            <h3 className="text-2xl font-semibold">How it works</h3>
            <p className="text-slate-600">
              Upload a photo, pick your options, generate, and download. Everything runs in the browser with a call to
              the paint-by-number engine.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Upload ready', desc: 'Drag/drop + file picker with validation.', icon: CloudArrowUpIcon },
                { title: '/generate/ live', desc: 'FormData integration and error handling.', icon: ServerStackIcon },
                { title: 'Downloads live', desc: 'Outline, preview, palette legend downloads + print helper.', icon: ArrowDownTrayIcon },
                { title: 'Polish queued', desc: 'Animations, swatches, print view refinements coming next.', icon: Cog6ToothIcon },
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
            <p className="text-sm font-semibold text-slate-800">Quick tips</p> <hr/>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 ">
              <li >Use clear, well-lit photos for best outlines.</li>
              <li>Higher color count captures more detail; lower is easier to paint.</li>
              <li>Keep file size under 15 MB; PNG/JPEG only.</li>
              <li>Print the outline and legend together for an easy setup.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
