export const base64ToUint8Array = (base64: string): Uint8Array => {
  const decoded = atob(base64)
  const bytes = new Uint8Array(decoded.length)
  for (let i = 0; i < decoded.length; i += 1) {
    bytes[i] = decoded.charCodeAt(i)
  }
  return bytes
}

export const base64ToBlob = (base64: string, contentType: string): Blob => {
  const bytes = base64ToUint8Array(base64)
  return new Blob([bytes.buffer as ArrayBuffer], { type: contentType })
}

export const base64ToObjectUrl = (base64: string, contentType: string): string => {
  const blob = base64ToBlob(base64, contentType)
  return URL.createObjectURL(blob)
}

export const revokeObjectUrls = (urls: Array<string | undefined | null>) => {
  urls.forEach((url) => {
    if (url) URL.revokeObjectURL(url)
  })
}
