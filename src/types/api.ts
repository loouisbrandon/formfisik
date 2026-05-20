export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type AuthPayload = {
  email: string
  password: string
}

export type Student = {
  id: string
  fullName: string
  email: string
  goal: string
}

export type Exercise = {
  id: string
  name: string
  muscleGroup: string
  equipment?: string
}

export type Workout = {
  id: string
  title: string
  studentId: string
  notes?: string
}
