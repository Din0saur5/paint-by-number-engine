import { apiBaseUrl } from './config'
import { base64ToObjectUrl } from './blobs'

export type ApiAsset = {
  filename: string
  content_type: string
  width?: number
  height?: number
  data: string
}

export type PaletteEntry = {
  number: number
  rgb: [number, number, number]
  hex: string
}

export type GenerateResponse = {
  image: ApiAsset
  preview: ApiAsset
  legend: ApiAsset
  palette: PaletteEntry[]
}

export type GenerateRequest = {
  file: File
  numColors: number
  maxWidth: number
  minRegionSize: number
  signal?: AbortSignal
}

export type GeneratedUrls = {
  outlineUrl: string
  previewUrl: string
  legendUrl: string
}

export const generatePaintByNumber = async ({
  file,
  numColors,
  maxWidth,
  minRegionSize,
  signal,
}: GenerateRequest): Promise<GenerateResponse> => {
  const form = new FormData()
  form.append('file', file)
  form.append('num_colors', String(numColors))
  form.append('max_width', String(maxWidth))
  form.append('min_region_size', String(minRegionSize))

  const response = await fetch(`${apiBaseUrl}/generate/`, {
    method: 'POST',
    body: form,
    signal,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as GenerateResponse
}

export const buildObjectUrls = (payload: GenerateResponse): GeneratedUrls => ({
  outlineUrl: base64ToObjectUrl(payload.image.data, payload.image.content_type),
  previewUrl: base64ToObjectUrl(payload.preview.data, payload.preview.content_type),
  legendUrl: base64ToObjectUrl(payload.legend.data, payload.legend.content_type),
})
