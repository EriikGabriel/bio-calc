"use client"

import { useCalculationHistory } from "@/services/history-list"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function HistoryPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const { history, loading } = useCalculationHistory(userId)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        setTimeout(() => setUserId(user.id), 0)
      }
    }
  }, [])

  // Segundo efeito: redireciona se não houver userId
  useEffect(() => {
    if (userId === null && typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        router.replace("/login")
      }
    }
  }, [userId, router])

  if (loading)
    return <div className="p-8 text-center">Carregando histórico...</div>
  if (!userId) return null

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button className="mb-4 text-blue-600" onClick={() => router.push("/")}>
        &larr; Voltar
      </button>
      <h1 className="text-2xl font-bold mb-4">Histórico de Cálculos</h1>
      {history.length === 0 ? (
        <div className="text-soil-600">Nenhum cálculo salvo ainda.</div>
      ) : (
        <ul className="space-y-4">
          {history.map((item) => (
            <li
              key={item.id}
              className="border rounded p-4 hover:bg-slate-50 cursor-pointer"
              onClick={() => router.push(`/historico/${item.id}`)}
            >
              <div className="font-semibold">
                {item.title || "Cálculo sem título"}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(item.created_at).toLocaleString()}
              </div>
              <div className="text-sm text-gray-700 mt-1">
                {item.description}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
