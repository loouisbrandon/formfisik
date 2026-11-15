"use client"

import { Dumbbell, MoveRight, UserRoundCheck, UsersRound, Waves } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

import { Container } from "@/components/layout/container"
import gordoImage from "@/styles/gordo.png"

const serviceItems = [
  {
    title: "Acesso Premium a Treinos",
    description:
      "Protocolos de treino com foco em hipertrofia, condicionamento e evolucao continua, com estrutura pronta para consultoria profissional.",
    icon: Dumbbell,
  },
  {
    title: "Treinos em Pequenos Grupos",
    description:
      "Organize alunos por grupos de objetivo e acompanhe o progresso coletivo mantendo qualidade e personalizacao.",
    icon: UsersRound,
  },
  {
    title: "Consultoria Individual",
    description:
      "Ajustes personalizados por aluno com prescricao objetiva, feedback rapido e historico centralizado.",
    icon: UserRoundCheck,
  },
  {
    title: "Aulas Funcionais e Cardio",
    description:
      "Monte sessoes dinamicas com variacoes de intensidade, periodizacao e orientacoes claras para execucao.",
    icon: Waves,
  },
] as const

export function OQueOferecemosSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="pb-16 pt-20 sm:pb-24 sm:pt-28">
      <Container className="space-y-9 sm:space-y-12">
        <header className="mx-auto max-w-3xl space-y-4 text-center">
          <span className="text-ui inline-flex rounded-full bg-primary/85 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary-foreground">
            Servico
          </span>
          <h2 className="text-heading text-4xl font-semibold uppercase tracking-[0.06em] text-foreground sm:text-6xl">
            O que oferecemos
          </h2>
          <p className="text-ui text-base leading-7 text-muted-foreground sm:text-2xl sm:leading-9">
            Seja no acompanhamento individual ou em grupos, a FORMFISIK entrega o plano ideal para sua
            evolucao.
          </p>
        </header>

        <div className="grid gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:gap-20">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.7rem] bg-[#f0f1f4] shadow-[0_18px_36px_rgba(8,10,14,0.12)]">
            <Image
              src={gordoImage}
              alt="Imagem FORMFISIK Coach"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.32)_100%)]" />
          </div>

          <div className="px-1 sm:px-2">
            {serviceItems.map((item, index) => {
              const Icon = item.icon
              const isOpen = openIndex === index

              return (
                <article key={item.title} className="border-b border-border/65 py-5 sm:py-6">
                  <button
                    type="button"
                  onClick={() => setOpenIndex(index)}
                  className="flex w-full items-center gap-4 text-left"
                  >
                    <span className="grid size-12 place-items-center text-foreground">
                      <Icon className="size-7" />
                    </span>
                    <span className="text-ui flex-1 text-2xl font-semibold text-foreground sm:text-4xl">
                      {item.title}
                    </span>
                    <span className="text-ui text-4xl leading-none text-foreground/90">{isOpen ? "×" : "+"}</span>
                  </button>

                  {isOpen ? (
                    <div className="ml-16 mt-4 pr-1 sm:ml-18">
                      <p className="text-ui max-w-2xl text-base leading-7 text-muted-foreground sm:text-xl sm:leading-8">
                        {item.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 text-ui text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
                        Saiba mais
                        <MoveRight className="size-4" />
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}
