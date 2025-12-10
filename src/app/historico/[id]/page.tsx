"use client"

import { supabase } from "@/services/supabase"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { ResultsSection } from "@/components/results-section"
import type { CalculateResponse } from "@/types/api"
type CalculationHistory = {
  id: string
  title?: string
  description?: string
  created_at: string
  results?: CalculateResponse["computed"]
}

export default function HistoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [item, setItem] = useState<CalculationHistory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params?.id as string
    if (!id) return
    supabase
      .from("calculation_history")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setItem(data)
        setLoading(false)
      })
  }, [params])

  if (loading)
    return <div className="p-8 text-center">Carregando cálculo...</div>
  if (!item)
    return <div className="p-8 text-center">Cálculo não encontrado.</div>

  // Monta um objeto CalculateResponse para ResultsSection
  const result: CalculateResponse = {
    ok: true,
    computed: item.results,
    sheet: undefined,
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button className="mb-4 text-blue-600" onClick={() => router.back()}>
        &larr; Voltar
      </button>
      <h1 className="text-2xl font-bold mb-2">
        {item.title || "Cálculo sem título"}
      </h1>
      <div className="text-xs text-gray-500 mb-2">
        {new Date(item.created_at).toLocaleString()}
      </div>
      <div className="mb-4 text-gray-700">{item.description}</div>
      <ResultsSection
        result={result}
        companyName={item.title}
        biomassType={item.description}
      />
    </div>
  )
}
