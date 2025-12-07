"use client"

import { CalculatorContent } from "@/components/calculator-content"
import { Header } from "@/components/header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomePage() {
  return (
    <main className="bg-herb-300 text-white min-h-dvh w-full pb-12 flex flex-col items-center gap-10">
      <Header />

      <Tabs defaultValue="calculator" className="w-[80%]">
        <TabsList className="flex self-center">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>
        <CalculatorContent />
      </Tabs>
    </main>
  )
}
