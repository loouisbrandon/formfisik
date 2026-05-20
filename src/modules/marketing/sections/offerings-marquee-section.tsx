import { Container } from "@/components/layout/container"

const offerings = [
  "Gestao de Alunos",
  "Criacao de Treinos",
  "Biblioteca de Exercicios",
  "Planos Personalizados",
  "Evolucao de Performance",
  "Exportacao em PDF",
  "Dashboard Premium",
  "Experiencia Mobile-First",
]

const marqueeItems = [...offerings, ...offerings]

export function OfferingsMarqueeSection() {
  return (
    <section className="pb-20 pt-8 sm:pb-28 sm:pt-10">
      <Container className="space-y-7 sm:space-y-9">
        <header className="space-y-3 text-center">
          <h2 className="text-heading text-3xl font-semibold uppercase tracking-[0.04em] sm:text-5xl">
            O que a FORMFISIK oferece
          </h2>
          <p className="text-ui mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Ferramentas para elevar sua consultoria fitness com performance, organizacao e entrega premium.
          </p>
        </header>
      </Container>

      <div className="w-full overflow-x-hidden">
        <div className="offerings-mask overflow-hidden py-3 sm:py-4">
          <div className="offerings-marquee flex w-max items-center gap-3 sm:gap-4">
            {marqueeItems.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="text-ui offerings-chip whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-foreground sm:px-5 sm:py-2.5 sm:text-base"
              >
                <span className="mr-2 inline-block size-2 rounded-full bg-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
