// По умолчанию ходим на относительные пути (/api, /photos), а Vite-proxy проксирует на backend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export function getApiBaseUrl() {
  return API_BASE_URL
}

export function apiErrorToString(e: unknown) {
  if (e && typeof e === 'object' && 'message' in e) return String((e as any).message)
  return 'Request failed'
}

export async function requestJson<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const headers = new Headers(options.headers || {})

  if (options.token) headers.set('Authorization', `Bearer ${options.token}`)
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const res = await fetch(url, {
    ...options,
    headers
  })

  if (!res.ok) {
    let details: any = null
    try {
      details = await res.json()
    } catch {
      // ignore
    }
    const msg = details?.message || details?.error || `${res.status} ${res.statusText}`
    throw new Error(msg)
  }

  return (await res.json()) as T
}

export async function requestVoid(path: string, options: RequestInit & { token?: string } = {}): Promise<void> {
  const url = `${API_BASE_URL}${path}`
  const headers = new Headers(options.headers || {})
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`)

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    let details: any = null
    try {
      details = await res.json()
    } catch {
      // ignore
    }
    const msg = details?.message || details?.error || `${res.status} ${res.statusText}`
    throw new Error(msg)
  }
}

