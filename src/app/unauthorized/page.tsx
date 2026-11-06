"use client"

import Link from "next/link"
import { ShieldX, ArrowLeft, Home } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Acesso Negado
        </h1>

        <p className="mt-3 max-w-md text-muted-foreground">
          Voce nao tem permissao para acessar esta pagina.
          Entre em contato com o administrador caso precise de acesso.
        </p>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Ir para o Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
