import { supabase } from "@/services/supabase"
import { useEffect, useState } from "react"

export type CalculationHistoryItem = {
  id: string
  created_at: string
  title?: string
  description?: string
  results: any
}

export function useCalculationHistory(userId: string | null) {
  const [history, setHistory] = useState<CalculationHistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from("calculation_history")
      .select("id, created_at, title, description, results")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setHistory(data || [])
        setLoading(false)
      })
  }, [userId])

  return { history, loading }
}
