import { apiClient } from "@/services/api/client"
import { endpoints } from "@/services/api/endpoints"
import type { Student } from "@/types/api"

export async function listStudents() {
  return apiClient<Student[]>(endpoints.students)
}
