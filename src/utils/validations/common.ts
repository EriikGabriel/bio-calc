/**
 * Utilitários comuns de validação reutilizáveis em todo o projeto
 */

/**
 * Verifica se um valor é vazio (null, undefined, ou string vazia)
 */
export function isEmpty(value: string | undefined | null): boolean {
  return !value || value.trim() === ""
}

/**
 * Valida se uma string representa um número válido
 * Aceita ponto ou vírgula como separador decimal
 */
export function isValidNumber(value: string): boolean {
  if (isEmpty(value)) return true // permite vazio onde opcional
  const normalized = value.replace(/\./g, "").replace(",", ".")
  return !Number.isNaN(Number(normalized))
}

/**
 * Valida se um campo obrigatório está preenchido
 */
export function isRequired(value: string | undefined | null): boolean {
  return !isEmpty(value)
}

/**
 * Valida formato de e-mail
 */
export function isValidEmail(email: string): boolean {
  if (isEmpty(email)) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
