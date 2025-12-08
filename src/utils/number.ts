/**
 * Utilitários para conversão e manipulação de números com formato brasileiro
 */

/**
 * Converte string para número, retornando valor padrão se inválido
 * Aceita formato brasileiro (1.234,56) e internacional (1,234.56)
 */
export function toNumber(raw: unknown, defaultValue: number = 0): number {
  if (typeof raw === "number") return raw
  if (typeof raw !== "string") return defaultValue

  const cleaned = raw.trim()
  if (!cleaned) return defaultValue

  // Remove pontos (separadores de milhar) e substitui vírgula por ponto
  const normalized = cleaned.replace(/\./g, "").replace(",", ".")
  const parsed = parseFloat(normalized)

  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Formata número para exibição com vírgula como separador decimal
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals).replace(".", ",")
}
