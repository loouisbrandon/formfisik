import type { ApiMethod } from "@/types/api"

type RequestOptions = {
  method?: ApiMethod
  body?: unknown
}

export async function apiClient<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return (await response.json()) as T
}
