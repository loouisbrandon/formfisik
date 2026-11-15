export type OperationalIndicator = { label: string; value: string; description: string }
export type ProfessionalDashboard = { fullName: string; studentTotal: number; overview?: DashboardOverview; indicators: OperationalIndicator[]; activities: { id: string; description: string }[] }
export type DashboardOverview = {
  asOf: string
  receivedCents: string
  months: { month: string; count: number }[]
  appointments: { id: string; title: string; student: string | null; time: string; state: string }[]
  appointmentTotal: number
  timezone: string
  attention: { id: string; name: string; lastAssessment: string | null }[]
  recentStudents: { id: string; name: string; createdAt: string }[]
}
