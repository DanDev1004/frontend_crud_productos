const API_BASE = '/api'

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function apiError(payload: unknown, status: number): Error {
  if (isObject(payload)) {
    if (isObject(payload.errors)) {
      const first = Object.values(payload.errors)[0]
      if (Array.isArray(first) && typeof first[0] === 'string') {
        return new Error(first[0])
      }
    }
    if (typeof payload.message === 'string') return new Error(payload.message)
  }
  return new Error(`No se pudo completar la operación (HTTP ${status}).`)
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) throw apiError(payload, response.status)
  return payload as T
}

export function get(path: string) {
  return request<unknown>(path)
}

export function send(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: object) {
  return request<unknown>(path, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

export interface ApiPage<T> {
  items: T[]
  currentPage: number
  lastPage: number
}

/** Acepta arrays, paginación de Laravel y respuestas Resource { data, meta }. */
export function toPage<T>(payload: unknown): ApiPage<T> {
  if (Array.isArray(payload)) return { items: payload as T[], currentPage: 1, lastPage: 1 }
  if (!isObject(payload)) return { items: [], currentPage: 1, lastPage: 1 }

  const nested = isObject(payload.data) ? payload.data : null
  const items = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(payload.products)
        ? payload.products
        : Array.isArray(payload.categories)
          ? payload.categories
          : []

  const meta = isObject(payload.meta) ? payload.meta : null
  const pageInfo = nested ?? payload
  const currentPage = Number(pageInfo.current_page ?? meta?.current_page ?? 1)
  const lastPage = Number(pageInfo.last_page ?? meta?.last_page ?? 1)

  return {
    items: items as T[],
    currentPage: Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1,
    lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
  }
}
