import { supabase } from "@/services/supabase"

export async function saveCalculationHistory({
  userId,
  steps,
  results,
  charts,
  title,
  description,
}: {
  userId: string
  steps: any
  results: any
  charts?: any
  title?: string
  description?: string
}) {
  const { error } = await supabase.from("calculation_history").insert([
    {
      user_id: userId,
      steps,
      results,
      charts,
      title,
      description,
    },
  ])
  return error
}
