"use client"

import { CalculatorContent } from "@/components/calculator-content"
import { Header } from "@/components/header"
import { OverviewSection } from "@/components/overview-section"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalculateResponse } from "@/types/api"
import { useState } from "react"

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState("overview")
  const [calculationResult, setCalculationResult] =
    useState<CalculateResponse | null>(null)

  function handleResultsReady(result: CalculateResponse | null) {
    if (result?.ok) {
      setCalculationResult(result)
      setCurrentTab("results")
    }
  }

  return (
    <main className="bg-herb-300 text-white min-h-dvh w-full pb-12 flex flex-col items-center gap-10">
      <Header />

      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className="w-[80%]"
      >
        <TabsList className="flex self-center">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>
        <OverviewSection />
        <CalculatorContent onResultsReady={handleResultsReady} />
      </Tabs>
    </main>
  )
}
