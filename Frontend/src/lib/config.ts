const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000'

export const apiBaseUrl: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_API_BASE_URL

export const appName = 'Hackworth\'s Paint-By-Number Engine'
