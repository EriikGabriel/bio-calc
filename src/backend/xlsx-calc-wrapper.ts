/* eslint-disable */
// Wrapper para isolar o require do xlsx-calc e evitar avisos no código do handler
let _calc: ((wb: any) => void) | null = null
try {
  // xlsx-calc exporta uma função (CommonJS)
  // Tipos não disponíveis oficialmente; usamos any de propósito neste wrapper isolado

  _calc = require("xlsx-calc")
} catch {
  _calc = null
}

export function recalcWorkbook(workbook: any) {
  if (!_calc) return
  try {
    _calc(workbook)
  } catch {
    // Se falhar, seguimos com valores em cache
  }
}
