import Link from "next/link"

import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center py-10">
      <Container className="max-w-md">
        <Card className="premium-surface border-border/80">
          <CardHeader>
            <CardTitle className="text-heading text-2xl uppercase tracking-wider">Entrar</CardTitle>
            <CardDescription className="text-ui">
              Acesse sua area FORMFISIK com visual premium e foco total em performance.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input type="email" placeholder="Seu e-mail" />
            <Input type="password" placeholder="Sua senha" />
            <Button className="text-ui h-11 w-full uppercase tracking-widest">Continuar</Button>
            <Link href="#" className="block text-center text-sm text-muted-foreground hover:text-foreground">
              Recuperar senha
            </Link>
          </CardContent>
        </Card>
      </Container>
    </main>
  )
}
