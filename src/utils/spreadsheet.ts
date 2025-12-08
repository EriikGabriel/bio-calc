/**
 * Utilitários para trabalhar com números e formatação de células da planilha
 */
import numeral from "numeral"

/**
 * Converte string brasileira para número (suporta decimal e científico)
 */
export function parseDecimal(value: string): number {
  const normalized = value.replace(",", ".").replace("E", "e")
  return numeral(normalized).value() || 0
}

/**
 * Formata número no padrão da planilha (notação científica com 2 decimais)
 */
export function formatSmartDecimal(value: number): string {
  return value.toExponential(2).replace(".", ",").toUpperCase()
}

/**
 * Extrai valor de uma célula da planilha (prioriza formato w, senão v)
 */
export function extractCellValue(cell: { v?: unknown; w?: string }): string {
  return (cell.w ?? (cell.v != null ? String(cell.v) : "")).trim()
}

/**
 * Multiplica dois valores decimais brasileiros
 */
export function multiplyDecimals(
  value1: string,
  value2: string
): string | undefined {
  const result = numeral(parseDecimal(value1))
    .multiply(parseDecimal(value2))
    .value()

  return result !== null ? formatSmartDecimal(result) : undefined
}

/**
 * Soma valores decimais brasileiros
 */
export function addDecimals(...values: string[]): string | undefined {
  let sum = numeral(0)

  for (const value of values) {
    if (!value?.trim()) continue
    sum = sum.add(parseDecimal(value))
  }

  const result = sum.value()
  return result !== null ? formatSmartDecimal(result) : undefined
}

/**
 * Multiplica múltiplos valores decimais brasileiros
 */
export function multiplyMultipleDecimals(
  ...values: string[]
): string | undefined {
  let product = numeral(1)

  for (const value of values) {
    if (!value?.trim()) return undefined
    product = product.multiply(parseDecimal(value))
  }

  const result = product.value()
  return result !== null ? formatSmartDecimal(result) : undefined
}
