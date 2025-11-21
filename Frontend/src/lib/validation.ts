import {
  ACCEPTED_TYPES,
  DEFAULT_REGION_SIZE,
  MAX_COLORS,
  MAX_REGION_SIZE,
  MAX_UPLOAD_BYTES,
  MAX_WIDTH,
  MIN_COLORS,
  MIN_REGION_SIZE,
  MIN_WIDTH,
} from './constants'

export type ValidationIssue = { type: 'file' | 'form'; message: string }

export const validateFile = (file: File | null): ValidationIssue | null => {
  if (!file) return { type: 'file', message: 'Choose a PNG or JPEG image to continue.' }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { type: 'file', message: 'Only PNG or JPEG files are supported.' }
  }
  if (file.size === 0) {
    return { type: 'file', message: 'File is empty. Pick another image.' }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0)
    return { type: 'file', message: `File is too large. Maximum size is ${mb} MB.` }
  }
  return null
}

export const validateForm = (
  numColors: number,
  maxWidth: number,
  minRegionSize: number = DEFAULT_REGION_SIZE,
): ValidationIssue | null => {
  if (Number.isNaN(numColors) || numColors < MIN_COLORS || numColors > MAX_COLORS) {
    return {
      type: 'form',
      message: `Number of colors must be between ${MIN_COLORS} and ${MAX_COLORS}.`,
    }
  }
  if (Number.isNaN(maxWidth) || maxWidth < MIN_WIDTH || maxWidth > MAX_WIDTH) {
    return {
      type: 'form',
      message: `Max width must be between ${MIN_WIDTH} and ${MAX_WIDTH}px.`,
    }
  }
  if (Number.isNaN(minRegionSize) || minRegionSize < MIN_REGION_SIZE || minRegionSize > MAX_REGION_SIZE) {
    return {
      type: 'form',
      message: `Minimum region size must be between ${MIN_REGION_SIZE} and ${MAX_REGION_SIZE} pixels.`,
    }
  }
  return null
}
