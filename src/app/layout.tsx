import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/providers/theme-provider"
import { Toaster } from "sonner"
import { GreetingLayer } from "@/components/auth/greeting-layer"
import { SCRIPT_BARRA_CLARA } from "@/lib/barra-clara"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Meu Gabinete",
  description: "Pesquisas e mapa do gabinete",
  // Prévia do link no WhatsApp/Instagram: a imagem é `opengraph-image.png` (logo da db).
  // Na Vercel o Next completa a URL absoluta sozinho (VERCEL_PROJECT_PRODUCTION_URL).
  openGraph: {
    title: "Meu Gabinete",
    description: "Responda a pesquisa do seu bairro — desenvolvido por db.app",
    siteName: "Meu Gabinete",
    locale: "pt_BR",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* ⚠️ ANTES da primeira pintura — ver `lib/barra-clara.ts`. */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_BARRA_CLARA }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Boas-vindas e tchau: aqui na RAIZ para sobreviver à troca de
              rota entre o login e o painel (ver `greeting-store.ts`). */}
          <GreetingLayer />
          <Toaster
            position="bottom-right"
            theme="system"
            toastOptions={{
              duration: 3000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
