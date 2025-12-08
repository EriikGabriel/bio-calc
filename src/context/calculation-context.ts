import type { CalculateResponse } from "@/types/api"
import React from "react"

export type CalculationContextValue = {
  currentStep: number
  setCurrentStep: (i: number) => void
  lastResult: CalculateResponse | null
  setLastResult: (r: CalculateResponse | null) => void
  resultsByStep: Record<number, CalculateResponse>
  setResultsByStep: React.Dispatch<
    React.SetStateAction<Record<number, CalculateResponse>>
  >
}

export const CalculationContext =
  React.createContext<CalculationContextValue | null>(null)

export function useCalculationContext() {
  const ctx = React.useContext(CalculationContext)
  if (!ctx) {
    throw new Error(
      "useCalculationContext must be used within a CalculationProvider"
    )
  }
  return ctx
}
