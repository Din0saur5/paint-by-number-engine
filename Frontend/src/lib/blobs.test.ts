import { beforeAll, describe, expect, it } from 'vitest'
import { base64ToBlob, base64ToObjectUrl, base64ToUint8Array, revokeObjectUrls } from './blobs'

const textToBase64 = (text: string) => btoa(text)

beforeAll(() => {
  if (!URL.createObjectURL) {
    // Minimal stub for jsdom tests; browser runtime provides a real implementation.
    URL.createObjectURL = () => 'blob:mock-url'
  }
  if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = () => {}
  }
})

describe('blob helpers', () => {
  it('converts base64 to Uint8Array', () => {
    const arr = base64ToUint8Array(textToBase64('hi'))
    expect(Array.from(arr)).toEqual([104, 105])
  })

  it('creates a blob with the right content type', async () => {
    const blob = base64ToBlob(textToBase64('hello'), 'text/plain')
    expect(blob.type).toBe('text/plain')
    expect(blob.size).toBe(5)
  })

  it('creates and revokes object URLs', async () => {
    const url = base64ToObjectUrl(textToBase64('world'), 'text/plain')
    expect(url.startsWith('blob:')).toBe(true)
    revokeObjectUrls([url])
  })
})
