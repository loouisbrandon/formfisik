import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const metrics = [
  { label: "Alunos", value: "42" },
  { label: "Treinos da semana", value: "18" },
  { label: "Pendencias", value: "06" },
]

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
      <Sidebar />

      <section className="flex-1 space-y-5">
        <Topbar />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.label} className="premium-surface border-border/80">
              <CardHeader>
                <CardTitle className="text-ui text-sm uppercase tracking-wider text-muted-foreground">
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-heading text-4xl text-primary">{metric.value}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
