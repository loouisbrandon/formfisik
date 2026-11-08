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
    throw new Error(response.status===401?'Entre novamente para continuar.':response.status===403?'Você não tem acesso a esta ação.':response.status===409?'Os dados foram alterados. Atualize antes de tentar novamente.':response.status===429?'Aguarde um pouco antes de tentar novamente.':'Não foi possível concluir a ação. Tente novamente.')
  }

  return (await response.json()) as T
}
