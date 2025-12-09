"use client"

import { CalculateResponse } from "@/types/api"
import { ExportPDFButton } from "./export-pdf-button"
import { ResultsSection } from "./results-section"

type ResultsWithExportProps = {
  result: CalculateResponse | null
  companyName?: string
  biomassType?: string
}

export function ResultsWithExport({
  result,
  companyName,
  biomassType,
}: ResultsWithExportProps) {
  return (
    <div className="relative">
      {/* Botão de exportação fixo no topo */}
      {result && result.ok && (
        <div className="sticky top-4 z-10 flex justify-end mb-4 pr-6">
          <div className="bg-white rounded-lg shadow-lg p-2">
            <ExportPDFButton
              elementId="results-content-export"
              fileName="relatorio-ciclo-vida-biocombustivel"
              companyName={companyName}
              biomassType={biomassType}
            />
          </div>
        </div>
      )}

      {/* Componente de resultados */}
      <ResultsSection
        result={result}
        companyName={companyName}
        biomassType={biomassType}
      />
    </div>
  )
}
