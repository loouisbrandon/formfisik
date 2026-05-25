"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Mode = "login" | "signup"
type SignupStep = 1 | 2

const REGISTERED_EMAILS_KEY = "formfisik-registered-emails"
const REGISTERED_USERS_KEY = "formfisik-registered-users"
const AUTH_USER_KEY = "formfisik-auth-user"

function readRegisteredEmails() {
  if (typeof window === "undefined") {
    return new Set<string>()
  }

  const raw = window.localStorage.getItem(REGISTERED_EMAILS_KEY)
  const emails = raw ? (JSON.parse(raw) as string[]) : []

  return new Set(emails.map((email) => email.trim().toLowerCase()))
}

function formatDateBR(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  const part1 = digits.slice(0, 2)
  const part2 = digits.slice(2, 4)
  const part3 = digits.slice(4, 8)

  if (digits.length <= 2) return part1
  if (digits.length <= 4) return `${part1}/${part2}`
  return `${part1}/${part2}/${part3}`
}

function formatPhoneBR(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13)

  if (digits.length === 0) return ""

  let formatted = "+(55)"
  const ddd = digits.slice(2, 4)
  const firstPart = digits.slice(4, 9)
  const secondPart = digits.slice(9, 13)

  if (ddd) {
    formatted += ` ${ddd}`
  }

  if (firstPart) {
    formatted += ` ${firstPart}`
  }

  if (secondPart) {
    formatted += `-${secondPart}`
  }

  return formatted
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [signupStep, setSignupStep] = useState<SignupStep>(1)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isCheckingCep, setIsCheckingCep] = useState(false)
  const [signupError, setSignupError] = useState("")
  const [signupSuccess, setSignupSuccess] = useState("")

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    fullName: "",
    birthDate: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    phone: "",
  })

  const title = useMemo(() => {
    if (mode === "login") {
      return "Entrar"
    }

    return signupStep === 1 ? "Criar conta" : "Complete seu cadastro"
  }, [mode, signupStep])

  const description = useMemo(() => {
    if (mode === "login") {
      return "Acesse sua area FORMFISIK com foco total em performance."
    }

    if (signupStep === 1) {
      return "Use um e-mail valido. Vamos verificar se ele ja foi utilizado."
    }

    return "Preencha seus dados principais para finalizar seu cadastro."
  }, [mode, signupStep])

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode)
    setSignupError("")
    setSignupSuccess("")
    setIsCheckingEmail(false)

    if (nextMode === "signup") {
      setSignupStep(1)
    }
  }

  const checkEmailAvailability = async () => {
    const normalizedEmail = signupForm.email.trim().toLowerCase()
    const basicEmailPattern = /^\S+@\S+\.\S+$/

    if (!normalizedEmail || !basicEmailPattern.test(normalizedEmail)) {
      return "Informe um e-mail valido para continuar."
    }

    setIsCheckingEmail(true)

    await new Promise((resolve) => setTimeout(resolve, 350))

    const alreadyRegistered = readRegisteredEmails().has(normalizedEmail)
    setIsCheckingEmail(false)

    if (alreadyRegistered) {
      return "Este e-mail ja foi utilizado. Tente outro ou faca login."
    }

    return ""
  }

  const handleStartSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSignupError("")
    setSignupSuccess("")

    const emailValidationError = await checkEmailAvailability()
    if (emailValidationError) {
      setSignupError(emailValidationError)
      return
    }

    if (signupForm.password.length < 6) {
      setSignupError("Crie uma senha com pelo menos 6 caracteres.")
      return
    }

    setSignupStep(2)
  }

  const handleCompleteSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSignupError("")
    setSignupSuccess("")

    const requiredFields: Array<keyof typeof signupForm> = [
      "fullName",
      "birthDate",
      "cep",
      "street",
      "number",
      "city",
      "state",
      "phone",
    ]

    const hasMissingField = requiredFields.some((field) => !signupForm[field].trim())
    if (hasMissingField) {
      setSignupError("Preencha todos os campos obrigatorios para finalizar.")
      return
    }

    const normalizedEmail = signupForm.email.trim().toLowerCase()
    const emails = [...readRegisteredEmails(), normalizedEmail]
    window.localStorage.setItem(REGISTERED_EMAILS_KEY, JSON.stringify([...new Set(emails)]))

    const rawUsers = window.localStorage.getItem(REGISTERED_USERS_KEY)
    const users = rawUsers ? (JSON.parse(rawUsers) as unknown[]) : []
    const nextUser = {
      email: normalizedEmail,
      password: signupForm.password,
      fullName: signupForm.fullName.trim(),
      birthDate: signupForm.birthDate,
      cep: signupForm.cep.trim(),
      street: signupForm.street.trim(),
      number: signupForm.number.trim(),
      complement: signupForm.complement.trim(),
      city: signupForm.city.trim(),
      state: signupForm.state.trim(),
      phone: signupForm.phone.trim(),
      createdAt: new Date().toISOString(),
    }

    window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify([...users, nextUser]))
    setSignupSuccess("Cadastro concluido com sucesso. Agora voce ja pode fazer login.")
    setSignupStep(1)
    setMode("login")
    setSignupForm({
      email: "",
      password: "",
      fullName: "",
      birthDate: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      city: "",
      state: "",
      phone: "",
    })
  }

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSignupError("")
    setSignupSuccess("")

    const normalizedEmail = loginForm.email.trim().toLowerCase()
    const password = loginForm.password.trim()

    if (!normalizedEmail || !password) {
      setSignupError("Informe e-mail e senha para continuar.")
      return
    }

    const rawUsers = window.localStorage.getItem(REGISTERED_USERS_KEY)
    const users = rawUsers
      ? (JSON.parse(rawUsers) as Array<{ email?: string; fullName?: string; password?: string }>)
      : []

    const foundUser = users.find(
      (user) =>
        user.email?.trim().toLowerCase() === normalizedEmail &&
        (!user.password || user.password === password)
    )

    if (!foundUser) {
      setSignupError("Credenciais invalidas. Verifique e tente novamente.")
      return
    }

    window.localStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify({
        email: normalizedEmail,
        fullName: foundUser.fullName?.trim() || "Usuario",
      })
    )
    window.dispatchEvent(new Event("formfisik-auth-change"))

    router.push("/")
  }

  const handleCepLookup = async (cepValue: string) => {
    const normalizedCep = cepValue.replace(/\D/g, "")

    if (normalizedCep.length !== 8) {
      return
    }

    setIsCheckingCep(true)
    setSignupError("")

    try {
      const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`)
      const data = (await response.json()) as {
        erro?: boolean
        logradouro?: string
        localidade?: string
        uf?: string
      }

      if (data.erro) {
        setSignupError("CEP nao encontrado. Confira o numero informado.")
        return
      }

      setSignupForm((prev) => ({
        ...prev,
        street: data.logradouro ?? prev.street,
        city: data.localidade ?? prev.city,
        state: data.uf ?? prev.state,
      }))
    } catch {
      setSignupError("Nao foi possivel consultar o CEP no momento.")
    } finally {
      setIsCheckingCep(false)
    }
  }

  return (
    <main className="flex h-[100dvh] flex-1 items-center overflow-hidden py-3 sm:py-4">
      <Container className="max-w-md px-3 sm:px-4">
        <Card className="premium-surface border-border/80">
          <CardHeader className="space-y-2 pb-3">
            <div className="mb-3 inline-flex rounded-full border border-border/60 bg-black/30 p-1">
              <Button
                type="button"
                size="sm"
                variant={mode === "login" ? "default" : "ghost"}
                className="text-ui rounded-full px-4 uppercase tracking-wider"
                onClick={() => handleModeChange("login")}
              >
                Login
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "signup" ? "default" : "ghost"}
                className="text-ui rounded-full px-4 uppercase tracking-wider"
                onClick={() => handleModeChange("signup")}
              >
                Cadastro
              </Button>
            </div>

            <CardTitle className="text-heading text-2xl uppercase tracking-wider">{title}</CardTitle>
            <CardDescription className="text-ui">{description}</CardDescription>
          </CardHeader>

          <CardContent className="px-4 pb-4 pt-1 sm:px-6">
            <div className="relative overflow-hidden">
              <div
                className={`flex w-[200%] transition-transform duration-500 ease-out ${
                  mode === "signup" && signupStep === 2 ? "-translate-x-1/2" : "translate-x-0"
                }`}
              >
                <div className="w-1/2 shrink-0 px-1 sm:px-2">
                  {mode === "login" ? (
                    <form className="space-y-3" onSubmit={handleLogin}>
                      <Input
                        type="email"
                        placeholder="Seu e-mail"
                        value={loginForm.email}
                        onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                      />
                      <Input
                        type="password"
                        placeholder="Sua senha"
                        value={loginForm.password}
                        onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                      />

                      <Button type="submit" className="text-ui h-10 w-full uppercase tracking-widest">
                        Continuar
                      </Button>

                      <Link href="#" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                        Recuperar senha
                      </Link>
                    </form>
                  ) : (
                    <form className="space-y-3" onSubmit={handleStartSignup}>
                      <Input
                        type="email"
                        placeholder="Seu e-mail"
                        value={signupForm.email}
                        onChange={(event) =>
                          setSignupForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                      />
                      <Input
                        type="password"
                        placeholder="Crie uma senha"
                        value={signupForm.password}
                        onChange={(event) =>
                          setSignupForm((prev) => ({ ...prev, password: event.target.value }))
                        }
                      />

                      <Button
                        type="submit"
                        className="text-ui h-10 w-full uppercase tracking-widest"
                        disabled={isCheckingEmail}
                      >
                        {isCheckingEmail ? "Verificando e-mail..." : "Criar conta"}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground">
                        Ao criar a conta, voce concorda com os termos e politicas da plataforma.
                      </p>
                    </form>
                  )}
                </div>

                <div className="w-1/2 shrink-0 px-1 sm:px-2">
                  <form className="grid grid-cols-2 gap-2.5" onSubmit={handleCompleteSignup}>
                    <Input
                      type="text"
                      placeholder="Nome completo"
                      className="col-span-2 focus-visible:ring-inset"
                      value={signupForm.fullName}
                      onChange={(event) =>
                        setSignupForm((prev) => ({ ...prev, fullName: event.target.value }))
                      }
                    />
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Nascimento (dd/mm/aaaa)"
                      className="focus-visible:ring-inset"
                      value={signupForm.birthDate}
                      onChange={(event) =>
                        setSignupForm((prev) => ({
                          ...prev,
                          birthDate: formatDateBR(event.target.value),
                        }))
                      }
                    />
                    <Input
                      type="text"
                      placeholder="CEP"
                      className="focus-visible:ring-inset"
                      value={signupForm.cep}
                      onChange={(event) =>
                        setSignupForm((prev) => ({ ...prev, cep: event.target.value }))
                      }
                      onBlur={(event) => {
                        void handleCepLookup(event.target.value)
                      }}
                    />
                    <Input
                      type="text"
                      placeholder="Rua"
                      className="col-span-2 focus-visible:ring-inset"
                      value={signupForm.street}
                      onChange={(event) =>
                        setSignupForm((prev) => ({ ...prev, street: event.target.value }))
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Numero"
                      className="focus-visible:ring-inset"
                      value={signupForm.number}
                      onChange={(event) =>
                        setSignupForm((prev) => ({ ...prev, number: event.target.value }))
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Complemento (opcional)"
                      className="focus-visible:ring-inset"
                      value={signupForm.complement}
                      onChange={(event) =>
                        setSignupForm((prev) => ({ ...prev, complement: event.target.value }))
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Cidade"
                      className="focus-visible:ring-inset"
                      value={signupForm.city}
                      onChange={(event) => setSignupForm((prev) => ({ ...prev, city: event.target.value }))}
                    />
                    <Input
                      type="text"
                      placeholder="Estado"
                      className="focus-visible:ring-inset"
                      value={signupForm.state}
                      onChange={(event) => setSignupForm((prev) => ({ ...prev, state: event.target.value }))}
                    />
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="+(55) 21 99999-1234"
                      className="col-span-2 focus-visible:ring-inset"
                      value={signupForm.phone}
                      onChange={(event) =>
                        setSignupForm((prev) => ({
                          ...prev,
                          phone: formatPhoneBR(event.target.value),
                        }))
                      }
                    />

                    <div className="col-span-2 flex gap-2 pt-0.5">
                      <Button
                        type="button"
                        variant="outline"
                        className="text-ui h-10 flex-1 uppercase tracking-wider"
                        onClick={() => setSignupStep(1)}
                      >
                        Voltar
                      </Button>
                      <Button type="submit" className="text-ui h-10 flex-1 uppercase tracking-wider">
                        Finalizar
                      </Button>
                    </div>
                    {isCheckingCep ? (
                      <p className="col-span-2 text-xs text-muted-foreground">Buscando endereco pelo CEP...</p>
                    ) : null}
                  </form>
                </div>
              </div>
            </div>

            {signupError ? <p className="mt-4 text-sm text-red-300">{signupError}</p> : null}
            {signupSuccess ? <p className="mt-4 text-sm text-lime-300">{signupSuccess}</p> : null}
          </CardContent>
        </Card>
      </Container>
    </main>
  )
}
