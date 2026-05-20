import { apiClient } from "@/services/api/client"
import { endpoints } from "@/services/api/endpoints"
import type { Exercise } from "@/types/api"

export async function listExercises() {
  return apiClient<Exercise[]>(endpoints.exercises)
}
