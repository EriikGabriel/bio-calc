import type React from "react"
import { forwardRef } from "react"
import { NumericInput } from "./numeric-input"

/**
 * Input para percentuais (0-100)
 * Formata automaticamente e valida o range
 */
export const PercentageInput = forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "maxValue" | "minValue">
>((props, ref) => {
  return (
    <NumericInput
      ref={ref}
      {...props}
      minValue={0}
      maxValue={100}
      maxDecimals={2}
    />
  )
})

PercentageInput.displayName = "PercentageInput"
