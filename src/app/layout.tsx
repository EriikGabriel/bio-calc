import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Bio Calc - Calculadora de Sustentabilidade",
  description: "Calculadora de impacto ambiental de biomassa",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
