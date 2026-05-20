import Link from "next/link"

const appLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Alunos", href: "/students" },
  { label: "Exercicios", href: "/exercises" },
  { label: "Treinos", href: "/workouts" },
  { label: "Perfil", href: "/profile" },
]

export function Sidebar() {
  return (
    <aside className="premium-surface w-full rounded-2xl border border-border/80 p-4 md:w-64">
      <div className="mb-6 text-heading text-sm uppercase tracking-[0.2em] text-primary">FORMFISIK</div>
      <nav className="flex flex-col gap-2">
        {appLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-ui rounded-lg px-3 py-2 text-sm uppercase tracking-wider text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
