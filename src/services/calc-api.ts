import type { CalculateRequest, CalculateResponse } from "@/types/api"

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
