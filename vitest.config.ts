import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

/**
 * Testes do admin.
 *
 * O alvo aqui NAO e renderizar tela: e a logica pura que sustenta todas elas —
 * formatacao de dinheiro e data, e o hook de listagem paginada. Sao os pontos
 * usados por toda pagina, onde um erro aparece em todo lugar ao mesmo tempo e
 * so seria notado por um cliente.
 *
 * `jsdom` porque o hook usa timers e estado do React; o resto e funcao pura.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mesmo alias do tsconfig: sem isso os imports "@/..." nao resolvem.
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
