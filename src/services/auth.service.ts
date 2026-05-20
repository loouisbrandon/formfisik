import { apiClient } from "@/services/api/client"
import { endpoints } from "@/services/api/endpoints"
import type { AuthPayload } from "@/types/api"

export async function login(payload: AuthPayload) {
  return apiClient<{ token: string }>(`${endpoints.auth}/login`, {
    method: "POST",
    body: payload,
  })
}
