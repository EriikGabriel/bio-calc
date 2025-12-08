import type { CalculateRequest, CalculateResponse } from "@/types/api"
import { formatSmartDecimal } from "@/utils/spreadsheet"

/**
 * API client for calculation service.
 * Keeps fetch logic centralized and typed for reuse across frontend modules.
 */
export async function calculatePhases(
  payload: CalculateRequest,
  init?: RequestInit
): Promise<CalculateResponse> {
  const resp = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    ...init,
  })
  const data = (await resp.json()) as CalculateResponse
  return data
}

export type SpreadsheetResponse = {
  ok: boolean
  cell?: { v?: unknown; f?: string; w?: string }
  cells?: Record<string, { v?: unknown; f?: string; w?: string }>
  error?: string
  details?: string
}

export async function getSheetCell(
  sheet: string,
  cell: string,
  opts?: { recalc?: boolean }
): Promise<SpreadsheetResponse> {
  const params = new URLSearchParams({ sheet, cell })
  if (opts?.recalc) params.set("recalc", "1")
  const resp = await fetch(`/api/spreadsheet?${params.toString()}`)
  return (await resp.json()) as SpreadsheetResponse
}

export async function getSheetRange(
  sheet: string,
  range: string
): Promise<SpreadsheetResponse> {
  const params = new URLSearchParams({ sheet, range })
  const resp = await fetch(`/api/spreadsheet?${params.toString()}`)
  return (await resp.json()) as SpreadsheetResponse
}

/**
 * Utility: fetch dropdown options from a sheet range.
 * Returns an array of strings using formatted (.w) if available, else String(.v).
 */
export async function getDropdownOptions(
  sheet: string,
  range: string
): Promise<string[]> {
  const res = await getSheetRange(sheet, range)
  if (!res.ok || !res.cells) return []
  const entries = Object.entries(res.cells)
  // Sort addresses in natural order by row/col
  entries.sort(([a], [b]) => {
    const A = a.match(/([A-Z]+)(\d+)/)
    const B = b.match(/([A-Z]+)(\d+)/)
    if (!A || !B) return a.localeCompare(b)
    const colA = A[1],
      rowA = parseInt(A[2], 10)
    const colB = B[1],
      rowB = parseInt(B[2], 10)
    if (rowA !== rowB) return rowA - rowB
    return colA.localeCompare(colB)
  })
  return entries
    .map(
      ([, cell]) =>
        (cell.w as string | undefined) ??
        (cell.v != null ? String(cell.v) : undefined)
    )
    .filter((s): s is string => !!s)
}

export type SetCellPayload = {
  value?: unknown
  formula?: string
}

export async function setSheetCell(
  sheet: string,
  cell: string,
  payload: SetCellPayload,
  init?: RequestInit
): Promise<SpreadsheetResponse> {
  const resp = await fetch(`/api/spreadsheet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sheet, cell, ...payload }),
    ...init,
  })
  return (await resp.json()) as SpreadsheetResponse
}

/**
 * Implementação manual de VLOOKUP (busca vertical).
 *
 * @param sheet - Nome da planilha
 * @param range - Range da tabela (ex: "B26:G32")
 * @param lookupValue - Valor a ser procurado
 * @param lookupColumnIndex - Índice da coluna onde procurar (0-based, 0 = primeira coluna do range)
 * @param returnColumnIndex - Índice da coluna a retornar (0-based)
 * @param exactMatch - Se true, procura match exato; se false, procura aproximado (não implementado)
 *
 * @returns O valor encontrado ou undefined
 *
 * @example
 * // Buscar fator de impacto da biomassa "Resíduo de Pinus" na tabela B26:G32
 * // Procura na coluna B (índice 0), retorna da coluna G (índice 5)
 * const impact = await vlookup(
 *   "Dados auxiliares",
 *   "B26:G32",
 *   "Resíduo de Pinus",
 *   0,  // Procurar na primeira coluna (B)
 *   5   // Retornar da sexta coluna (G)
 * )
 */
export async function vlookup(
  sheet: string,
  range: string,
  lookupValue: string,
  lookupColumnIndex: number = 0,
  returnColumnIndex: number,
  exactMatch: boolean = true
): Promise<string | undefined> {
  const res = await getSheetRange(sheet, range)
  if (!res.ok || !res.cells) {
    return undefined
  }

  // Decodificar o range para obter as colunas inicial e final
  const rangeMatch = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/)
  if (!rangeMatch) {
    return undefined
  }

  const [, startColStr, startRowStr, , endRowStr] = rangeMatch
  const startRow = parseInt(startRowStr, 10)
  const endRow = parseInt(endRowStr, 10)

  // Converter letras de coluna para números
  const colToNum = (col: string): number => {
    let num = 0
    for (let i = 0; i < col.length; i++) {
      num = num * 26 + (col.charCodeAt(i) - 64)
    }
    return num
  }

  const numToCol = (num: number): string => {
    let col = ""
    while (num > 0) {
      const remainder = (num - 1) % 26
      col = String.fromCharCode(65 + remainder) + col
      num = Math.floor((num - 1) / 26)
    }
    return col
  }

  const startColNum = colToNum(startColStr)
  const lookupColNum = startColNum + lookupColumnIndex
  const returnColNum = startColNum + returnColumnIndex

  const lookupCol = numToCol(lookupColNum)
  const returnCol = numToCol(returnColNum)

  // Iterar pelas linhas procurando o valor
  for (let row = startRow; row <= endRow; row++) {
    const lookupAddr = `${lookupCol}${row}`
    const lookupCell = res.cells[lookupAddr]

    if (!lookupCell) continue

    const cellValue = (
      lookupCell.w ?? (lookupCell.v != null ? String(lookupCell.v) : "")
    ).trim()

    const searchValue = lookupValue.trim()

    if (exactMatch && cellValue === searchValue) {
      const returnAddr = `${returnCol}${row}`
      const returnCell = res.cells[returnAddr]

      if (!returnCell) {
        return undefined
      }

      const returnValue = (
        returnCell.w ?? (returnCell.v != null ? String(returnCell.v) : "")
      ).trim()

      return returnValue || undefined
    }
  }

  return undefined
}

/**
 * Busca múltiplos valores de uma vez usando VLOOKUP.
 * Útil quando você precisa de várias colunas da mesma linha.
 *
 * @param sheet - Nome da planilha
 * @param range - Range da tabela
 * @param lookupValue - Valor a ser procurado
 * @param lookupColumnIndex - Índice da coluna onde procurar (0-based)
 * @param returnColumnIndices - Array de índices das colunas a retornar (0-based)
 *
 * @returns Array com os valores encontrados (na mesma ordem dos índices)
 *
 * @example
 * // Buscar estado e tipo de cultivo da tabela de MUT
 * const [cultivationType, mutFactor] = await vlookupMultiple(
 *   "Dados auxiliares",
 *   "B97:D123",
 *   "São Paulo",
 *   0,  // Procurar na coluna B
 *   [1, 2]  // Retornar colunas C e D
 * )
 */
export async function vlookupMultiple(
  sheet: string,
  range: string,
  lookupValue: string,
  lookupColumnIndex: number = 0,
  returnColumnIndices: number[]
): Promise<(string | undefined)[]> {
  const results = await Promise.all(
    returnColumnIndices.map((colIndex) =>
      vlookup(sheet, range, lookupValue, lookupColumnIndex, colIndex)
    )
  )
  return results
}

/**
 * Helper específico para buscar dados da biomassa.
 *
 * Fórmulas originais:
 * - Poder calorífico (E37): =SEERRO(PROCV(E33;'Dados auxiliares'!B7:C12;2;0)/1000; " ")
 * - Fator de impacto (E36): =SEERRO(PROCV(EngS_BioCalc!E33;'Dados auxiliares'!B26:G32;6;0);" ")
 *
 * Tabelas:
 * - B7:C12: Coluna B (nome), Coluna C (poder calorífico em kJ, dividir por 1000)
 * - B26:G32: Coluna B (nome), Coluna G (fator de impacto)
 */
export async function getBiomassData(biomassName: string) {
  // Buscar fator de impacto na tabela B26:G32 (coluna G = índice 5)
  const impactFactorRaw = await vlookup(
    "Dados auxiliares",
    "B26:G32",
    biomassName,
    0, // Procurar na coluna B
    5 // Retornar coluna G (fator de impacto)
  )

  // Formatar fator de impacto
  let impactFactor: string | undefined
  if (impactFactorRaw) {
    const numValue = parseFloat(impactFactorRaw.replace(",", "."))
    if (!isNaN(numValue)) {
      impactFactor = formatSmartDecimal(numValue)
    }
  }

  // Buscar poder calorífico na tabela B7:C12 (coluna C = índice 1)
  const calorificValueRaw = await vlookup(
    "Dados auxiliares",
    "B7:C12",
    biomassName,
    0, // Procurar na coluna B
    1 // Retornar coluna C (poder calorífico em kJ)
  )

  // Dividir por 1000 conforme a fórmula original e formatar
  let calorificValue: string | undefined
  if (calorificValueRaw) {
    const numValue = parseFloat(calorificValueRaw.replace(",", "."))
    if (!isNaN(numValue)) {
      calorificValue = formatSmartDecimal(numValue / 1000)
    }
  }

  return {
    impactFactor,
    calorificValue,
  }
}
