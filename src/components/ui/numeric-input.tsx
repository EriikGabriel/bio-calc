import type React from "react"
import { forwardRef } from "react"
import { Input } from "./input"

/**
 * Input numérico que aceita apenas números, vírgula como separador decimal
 * e formata o valor automaticamente (similar ao Excel)
 */
export const NumericInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    allowNegative?: boolean
    maxDecimals?: number
    maxValue?: number
    minValue?: number
  }
>(
  (
    {
      allowNegative = false,
      maxDecimals = 2,
      maxValue,
      minValue = 0,
      onChange,
      onBlur,
      onKeyDown,
      value,
      ...props
    },
    ref
  ) => {
    // ...existing code...

    const formatNumber = (val: string): string => {
      // Remove tudo que não é número, vírgula ou sinal de menos
      let cleaned = val.replace(/[^\d,-]/g, "")

      // Se não permite negativo, remove o sinal de menos
      if (!allowNegative) {
        cleaned = cleaned.replace(/-/g, "")
      } else {
        // Permite apenas um sinal de menos no início
        const hasNegative = cleaned.startsWith("-")
        cleaned = cleaned.replace(/-/g, "")
        if (hasNegative) cleaned = "-" + cleaned
      }

      // Permite apenas uma vírgula
      const parts = cleaned.split(",")
      if (parts.length > 2) {
        cleaned = parts[0] + "," + parts.slice(1).join("")
      }

      // Limita casas decimais
      if (parts.length === 2 && parts[1].length > maxDecimals) {
        cleaned = parts[0] + "," + parts[1].slice(0, maxDecimals)
      }

      return cleaned
    }

    const validateRange = (val: string): string => {
      if (!val || val === "-" || val === "0" || val === "0,") return val

      // Converte para número
      const numValue = parseFloat(val.replace(",", "."))

      if (isNaN(numValue)) return val

      // Valida range
      if (minValue !== undefined && numValue < minValue) {
        return minValue.toString().replace(".", ",")
      }
      if (maxValue !== undefined && numValue > maxValue) {
        return maxValue.toString().replace(".", ",")
      }

      return val
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permite: backspace, delete, tab, escape, enter, home, end, arrows
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "Home",
        "End",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ]

      // Permite Ctrl/Cmd + A, C, V, X, Z
      if (
        (e.ctrlKey || e.metaKey) &&
        ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase())
      ) {
        onKeyDown?.(e)
        return
      }

      if (allowedKeys.includes(e.key)) {
        onKeyDown?.(e)
        return
      }

      // Permite números
      if (/^\d$/.test(e.key)) {
        onKeyDown?.(e)
        return
      }

      // Permite vírgula (apenas uma)
      const currentValue = (e.target as HTMLInputElement).value
      if (e.key === "," && !currentValue.includes(",")) {
        onKeyDown?.(e)
        return
      }

      // Permite sinal de menos apenas no início e se permitido
      if (e.key === "-" && allowNegative && currentValue.length === 0) {
        onKeyDown?.(e)
        return
      }

      // Bloqueia qualquer outra tecla
      e.preventDefault()
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatNumber(e.target.value)
      e.target.value = formatted
      onChange?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Valida e aplica range ao perder o foco
      const validated = validateRange(e.target.value)
      if (validated !== e.target.value) {
        e.target.value = validated
        // Criar um novo evento sintético para onChange
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: validated },
          currentTarget: { ...e.currentTarget, value: validated },
        } as React.ChangeEvent<HTMLInputElement>
        onChange?.(syntheticEvent)
      }
      onBlur?.(e)
    }

    return (
      <Input
        ref={ref}
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        inputMode="decimal"
      />
    )
  }
)

NumericInput.displayName = "NumericInput"
