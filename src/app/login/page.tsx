"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { USUARIO_DEMO, useAuthStore } from "@/store/auth-store"
import { CONTA_DEMO } from "@/data/seed"
import { useGreetingStore } from "@/store/greeting-store"

// Animated blur orb component
function AnimatedOrb({
  className,
  delay = 0,
  duration = 20,
}: {
  className?: string
  delay?: number
  duration?: number
}) {
  return (
    <motion.div
      className={className}
      animate={{
        x: [0, 30, -20, 40, 0],
        y: [0, -40, 20, -30, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { setAuth, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = React.useState(false)
  const [email, setEmail] = React.useState(CONTA_DEMO.email)
  const [password, setPassword] = React.useState(CONTA_DEMO.senha)

  // Redireciona se já estiver autenticado — exceto durante as boas-vindas,
  // que navegam sozinhas quando a tela já está coberta (`GreetingLayer`)
  React.useEffect(() => {
    if (isAuthenticated && !useGreetingStore.getState().current) {
      router.replace("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Preencha todos os campos")
      return
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres")
      return
    }

    setIsLoading(true)

    // MVP: só a conta de demonstração (preenchida no formulário).
    if (email.trim().toLowerCase() !== CONTA_DEMO.email || password !== CONTA_DEMO.senha) {
      toast.error("E-mail ou senha incorretos")
      setIsLoading(false)
      return
    }
    // Boas-vindas ANTES do setAuth, para o efeito de redirecionar acima esperar
    useGreetingStore.getState().welcome(USUARIO_DEMO.name, null)
    setAuth(USUARIO_DEMO, ["*"], "demo")
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-background p-3">
      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="fixed bottom-3 right-3 z-50"
      >
        <ThemeToggle />
      </motion.div>

      {/* Main Container */}
      <div className="relative z-10 flex h-[calc(100vh-24px)]">
        {/* Left Side - Branding Box */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative hidden w-1/2 overflow-hidden rounded-2xl lg:block"
        >
          {/* Background - Darker gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-black dark:to-zinc-950" />

          {/* Animated blur orbs */}
          <AnimatedOrb
            className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-[100px] dark:bg-primary/30"
            delay={0}
            duration={25}
          />
          <AnimatedOrb
            className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/15 blur-[120px] dark:bg-primary/25"
            delay={2}
            duration={30}
          />
          <AnimatedOrb
            className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[80px] dark:bg-primary/20"
            delay={4}
            duration={22}
          />
          <AnimatedOrb
            className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-sky-500/10 blur-[60px] dark:bg-sky-500/15"
            delay={1}
            duration={18}
          />

          {/* Content */}
          <div className="relative flex h-full flex-col justify-between p-10 text-zinc-900 dark:text-zinc-50">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h1 className="text-2xl font-bold tracking-tight">
                Meu<span className="text-primary">Gabinete</span>
              </h1>
            </motion.div>

            {/* Main Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-6"
            >
              <blockquote className="space-y-4">
                <p className="text-3xl font-light leading-relaxed text-zinc-600 dark:text-zinc-300">
                  &ldquo;Ouça o seu bairro.
                  <br />
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    Veja no mapa onde estão as demandas.
                  </span>&rdquo;
                </p>
                <p className="text-base text-zinc-500 dark:text-zinc-400">
                  Pesquisas para a população responder pelo celular, com cada resposta no mapa da cidade.
                </p>
              </blockquote>

              {/* Features */}
              <div className="flex flex-wrap gap-3 pt-4">
                {["Pesquisas", "Mapa", "Bairros", "Pessoas"].map((feature, i) => (
                  <motion.span
                    key={feature}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                    className="rounded-full border border-zinc-300/50 bg-white/30 px-3 py-1 text-xs text-zinc-700 backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-800/30 dark:text-zinc-300"
                  >
                    {feature}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Powered by */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500"
            >
              <span>Powered by</span>
              <a
                href="https://darbybiehl.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-700 transition-colors hover:text-primary dark:text-zinc-300"
              >
                DarbyBiehl
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <div className="relative flex h-full w-full flex-col lg:w-1/2 lg:justify-center lg:px-16">
          {/* Background animated orbs - hidden on mobile, visible on desktop */}
          <AnimatedOrb
            className="absolute -right-32 top-1/4 hidden h-64 w-64 rounded-full bg-primary/5 blur-[80px] dark:bg-primary/10 lg:block"
            delay={3}
            duration={20}
          />
          <AnimatedOrb
            className="absolute -left-20 bottom-1/3 hidden h-48 w-48 rounded-full bg-primary/5 blur-[60px] dark:bg-primary/10 lg:block"
            delay={5}
            duration={24}
          />

          {/* Mobile animated orbs - smaller and more subtle */}
          <AnimatedOrb
            className="absolute -right-16 top-20 h-40 w-40 rounded-full bg-primary/10 blur-[60px] dark:bg-primary/15 lg:hidden"
            delay={0}
            duration={18}
          />
          <AnimatedOrb
            className="absolute -left-16 bottom-32 h-32 w-32 rounded-full bg-primary/10 blur-[50px] dark:bg-primary/15 lg:hidden"
            delay={2}
            duration={22}
          />

          {/* Mobile Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="px-2 pb-8 pt-6 lg:hidden"
          >
            <h1 className="text-xl font-bold tracking-tight">
              Meu<span className="text-primary">Gabinete</span>
            </h1>
          </motion.div>

          {/* Form Container - centered on both mobile and desktop */}
          <div className="flex flex-1 flex-col justify-center px-4 lg:px-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative z-10 mx-auto w-full max-w-sm space-y-8"
            >
              {/* Welcome */}
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Bem-vindo de volta
                </h2>
                <p className="text-sm text-muted-foreground">
                  Conta de demonstração já preenchida
                </p>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>

          {/* Mobile Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="px-4 pb-6 pt-8 text-center lg:hidden"
          >
            <p className="text-xs text-muted-foreground">
              Powered by{" "}
              <a
                href="https://darbybiehl.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                DarbyBiehl
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
