import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

export function Topbar() {
  return (
    <div className="premium-surface flex flex-col gap-3 rounded-2xl border border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-heading text-xl uppercase tracking-wider">Painel do Personal</p>
        <p className="text-ui text-sm text-muted-foreground">Gestao premium de alunos e treinos.</p>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar aluno ou treino" className="pl-9" />
      </div>
    </div>
  )
}
