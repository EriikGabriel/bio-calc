import { recalcWorkbook } from "@/backend/xlsx-calc-wrapper"
import { readFileSync, writeFileSync } from "fs"
import { NextResponse } from "next/server"
import { join } from "path"
import * as XLSX from "xlsx"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const sheetParam = url.searchParams.get("sheet")
  const cellParam = url.searchParams.get("cell")
  const rangeParam = url.searchParams.get("range") // e.g., "E33:E36" or "B10:D12"
  const recalc = url.searchParams.get("recalc") === "1"

  const filePath = join(process.cwd(), "src/backend/BioCalc - Planilha.xlsx")
  try {
    const fileBuffer = readFileSync(filePath)
    const workbook = XLSX.read(fileBuffer, { type: "buffer" })
    // Opcionalmente recalcula fórmulas para refletirem o último valor salvo
    if (recalc) {
      recalcWorkbook(workbook)
    }

    // Return only the requested cell object with raw value (v), formula (f), and formatted (w)
    if (sheetParam && cellParam) {
      const ws = workbook.Sheets[sheetParam]
      if (!ws) {
        return NextResponse.json(
          { ok: false, error: `Worksheet not found: ${sheetParam}` },
          { status: 404 }
        )
      }
      const cell = ws[cellParam]
      if (!cell) {
        return NextResponse.json(
          { ok: false, error: `Cell not found: ${sheetParam}!${cellParam}` },
          { status: 404 }
        )
      }

      const { v, f, w } = cell as { v?: unknown; f?: string; w?: string }
      return NextResponse.json({
        ok: true,
        sheet: sheetParam,
        cell: { v, f, w },
      })
    }

    // Return multiple cells for a given range as a dictionary of cell addresses
    if (sheetParam && rangeParam) {
      const ws = workbook.Sheets[sheetParam]
      if (!ws) {
        return NextResponse.json(
          { ok: false, error: `Worksheet not found: ${sheetParam}` },
          { status: 404 }
        )
      }
      let range
      try {
        range = XLSX.utils.decode_range(rangeParam)
      } catch {
        return NextResponse.json(
          { ok: false, error: `Invalid range: ${rangeParam}` },
          { status: 400 }
        )
      }
      const cells: Record<string, { v?: unknown; f?: string; w?: string }> = {}
      for (let r = range.s.r; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
          const addr = XLSX.utils.encode_cell({ r, c })
          const cell = ws[addr] as
            | { v?: unknown; f?: string; w?: string }
            | undefined
          if (cell) {
            const { v, f, w } = cell
            cells[addr] = { v, f, w }
          }
        }
      }
      return NextResponse.json({
        ok: true,
        sheet: sheetParam,
        cells,
        range: rangeParam,
      })
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Missing query params: provide sheet+cell or sheet+range",
      },
      { status: 400 }
    )
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "Spreadsheet not found or unreadable",
        details: String(err),
      },
      { status: 500 }
    )
  }
}

type SetCellPayload = {
  sheet: string
  cell: string
  value?: unknown
  formula?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SetCellPayload
    const { sheet, cell, value, formula } = body

    if (!sheet || !cell) {
      return NextResponse.json(
        { ok: false, error: "Missing fields: sheet and cell are required" },
        { status: 400 }
      )
    }

    const filePath = join(process.cwd(), "src/backend/BioCalc - Planilha.xlsx")
    const fileBuffer = readFileSync(filePath)
    const workbook = XLSX.read(fileBuffer, { type: "buffer" })

    const ws = workbook.Sheets[sheet]
    if (!ws) {
      return NextResponse.json(
        { ok: false, error: `Worksheet not found: ${sheet}` },
        { status: 404 }
      )
    }

    // Create or update the cell
    const cellObj: XLSX.CellObject = ws[cell] ?? ({ t: "s" } as XLSX.CellObject)
    // Prefer setting raw value (v) and optionally a formula (f)
    if (formula) {
      // When a formula is set, keep value if provided (cached), else leave for Excel to compute
      cellObj.f = formula
      if (value !== undefined) {
        // xlsx type definitions vary by version; assign as unknown
        cellObj.v = value as unknown as number | string | boolean | Date
      }
    } else {
      cellObj.f = undefined
      cellObj.v = (value as unknown as number | string | boolean | Date) ?? null
    }
    ws[cell] = cellObj

    // Update sheet range if needed
    const ref = ws["!ref"] as string | undefined
    const newRef = XLSX.utils.encode_range(
      XLSX.utils.decode_range(ref ?? `${cell}:${cell}`)
    )
    ws["!ref"] = newRef

    // Write back the workbook
    const wbout = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
    writeFileSync(filePath, wbout)

    // Return the updated cell snapshot
    const updated = ws[cell] as { v?: unknown; f?: string; w?: string }
    return NextResponse.json({
      ok: true,
      sheet,
      cell: { v: updated.v, f: updated.f, w: updated.w },
    })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to update spreadsheet cell",
        details: String(err),
      },
      { status: 500 }
    )
  }
}
