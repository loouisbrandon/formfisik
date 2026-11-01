export type OperationalIndicator = { label: string; value: string; description: string }
export type ProfessionalDashboard = { fullName: string; studentTotal: number; indicators: OperationalIndicator[]; activities: { id: string; description: string }[] }
