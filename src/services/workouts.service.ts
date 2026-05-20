import { apiClient } from "@/services/api/client"
import { endpoints } from "@/services/api/endpoints"
import type { Workout } from "@/types/api"

export async function listWorkouts() {
  return apiClient<Workout[]>(endpoints.workouts)
}
