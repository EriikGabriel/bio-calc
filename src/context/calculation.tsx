import React from "react"
import {
  CalculationContext,
  type CalculationContextValue,
} from "./calculation-context"

export function CalculationProvider({
  value,
  children,
}: {
  value: CalculationContextValue
  children: React.ReactNode
}) {
  return (
    <CalculationContext.Provider value={value}>
      {children}
    </CalculationContext.Provider>
  )
}
