"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

const STORAGE_KEY = "formfisik-theme"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return true
    }

    const savedTheme = window.localStorage.getItem(STORAGE_KEY)

    return savedTheme ? savedTheme === "dark" : true
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    window.localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light")
  }, [isDark])

  const handleToggle = () => {
    setIsDark((prev) => !prev)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="text-ui border border-white/40 bg-white/5 text-white uppercase tracking-[0.14em] hover:bg-white/15 hover:text-white"
      aria-label="Alternar tema"
    >
      <span suppressHydrationWarning>{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}</span>
      <span suppressHydrationWarning>{isDark ? "Light" : "Dark"}</span>
    </Button>
  )
}
