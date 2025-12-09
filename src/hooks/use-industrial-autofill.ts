import type { AgriculturalPhaseFormData } from "@/components/sections/agricultural-phase-section"
import type { IndustrialPhaseFormData } from "@/components/sections/industrial-phase-section"
import { getSheetRange } from "@/services/calc-api"
import { extractCellValue, formatSmartDecimal } from "@/utils/spreadsheet"
import { isEmpty } from "lodash"
import { useEffect } from "react"

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Atualiza campo apenas se o valor for diferente do atual
 */
function updateFieldIfChanged<T extends keyof IndustrialPhaseFormData>(
  fieldName: T,
  newValue: string | undefined,
  currentValue: string,
  onChange: (name: T, value: string) => void
) {
  if (newValue && newValue !== currentValue) {
    onChange(fieldName, newValue)
  }
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook customizado para gerenciar preenchimentos automáticos da fase industrial.
 * Centraliza toda a lógica de cálculos e atualizações de campos derivados.
 *
 * Recebe os dados das fases anteriores para acessar valores já calculados,
 * evitando a necessidade de passar múltiplos parâmetros individuais.
 *
 * @param data - Dados do formulário industrial
 * @param onFieldChange - Callback para atualizar campos
 * @param previousPhases - Dados das fases anteriores (agrícola, etc)
 */
export function useIndustrialAutofill(
  data: IndustrialPhaseFormData,
  onFieldChange: (name: keyof IndustrialPhaseFormData, value: string) => void,
  previousPhases?: {
    agricultural?: AgriculturalPhaseFormData
  }
) {
  // ============================================================================
  // 1. FATOR DE IMPACTO DO CONSUMO DE ELETRICIDADE
  // Fórmula: =SEERRO(SOMARPRODUTO(E62:E67;'Dados auxiliares'!G41:G46); " ")
  // SUMPRODUCT dos valores de eletricidade × fatores de impacto
  // ============================================================================
  useEffect(() => {
    async function calculateElectricityImpactFactor() {
      // Array com os valores de eletricidade
      const electricityValues = [
        data.gridMixMediumVoltage,
        data.gridMixHighVoltage,
        data.electricityPCH,
        data.electricityBiomass,
        data.electricityDiesel,
        data.electricitySolar,
      ]

      // Verificar se pelo menos um valor está preenchido
      const hasAnyValue = electricityValues.some((v) => !isEmpty(v))
      if (!hasAnyValue) {
        if (data.electricityImpactFactorKgCO2PerKWh !== "") {
          onFieldChange("electricityImpactFactorKgCO2PerKWh", "")
        }
        return
      }

      try {
        // Buscar fatores de impacto da planilha (G41:G46)
        const factorsResponse = await getSheetRange(
          "Dados auxiliares",
          "G41:G46"
        )
        if (!factorsResponse.ok || !factorsResponse.cells) return

        // Extrair valores das células (G41, G42, G43, G44, G45, G46)
        const impactFactors = [
          extractCellValue(factorsResponse.cells["G41"]),
          extractCellValue(factorsResponse.cells["G42"]),
          extractCellValue(factorsResponse.cells["G43"]),
          extractCellValue(factorsResponse.cells["G44"]),
          extractCellValue(factorsResponse.cells["G45"]),
          extractCellValue(factorsResponse.cells["G46"]),
        ]

        // Calcular SUMPRODUCT: soma de (valor × fator) para cada linha
        let sumProduct = 0
        for (let i = 0; i < electricityValues.length; i++) {
          const value = electricityValues[i]
          const factor = impactFactors[i]

          if (!isEmpty(value) && factor) {
            const numValue = parseFloat(value.replace(",", "."))
            const numFactor = parseFloat(factor.replace(",", "."))

            if (!isNaN(numValue) && !isNaN(numFactor)) {
              sumProduct += numValue * numFactor
            }
          }
        }

        // Formatar resultado
        const result = formatSmartDecimal(sumProduct)
        updateFieldIfChanged(
          "electricityImpactFactorKgCO2PerKWh",
          result,
          data.electricityImpactFactorKgCO2PerKWh,
          onFieldChange
        )
      } catch (error) {
        console.error(
          "Erro ao calcular fator de impacto de eletricidade:",
          error
        )
      }
    }

    calculateElectricityImpactFactor()
  }, [
    data.gridMixMediumVoltage,
    data.gridMixHighVoltage,
    data.electricityPCH,
    data.electricityBiomass,
    data.electricityDiesel,
    data.electricitySolar,
    data.electricityImpactFactorKgCO2PerKWh,
    onFieldChange,
  ])

  // ============================================================================
  // 2. IMPACTO DO CONSUMO DE ELETRICIDADE (resultado final)
  // Fórmula: =SEERRO(E68*(1/E59)*E37; " ")
  // E68 = electricityImpactFactorKgCO2PerKWh
  // E59 = processedBiomassKgPerYear
  // E37 = biomassCalorificValue (precisa ser obtido da fase agrícola)
  // ============================================================================
  useEffect(() => {
    async function calculateElectricityImpactResult() {
      // Verificar se temos todos os valores necessários
      if (
        isEmpty(data.electricityImpactFactorKgCO2PerKWh) ||
        isEmpty(data.processedBiomassKgPerYear)
      ) {
        if (data.electricityImpactResultKgCO2PerMJ !== "") {
          onFieldChange("electricityImpactResultKgCO2PerMJ", "")
        }
        return
      }

      try {
        // E68 (fator de impacto)
        const e68 = parseFloat(
          data.electricityImpactFactorKgCO2PerKWh.replace(",", ".")
        )

        // E59 (biomassa processada)
        const e59 = parseFloat(data.processedBiomassKgPerYear.replace(",", "."))

        // E37 (poder calorífico da biomassa - vem da fase agrícola)
        const biomassCalorificValue =
          previousPhases?.agricultural?.biomassCalorificValue

        if (!biomassCalorificValue || isEmpty(biomassCalorificValue)) {
          if (data.electricityImpactResultKgCO2PerMJ !== "") {
            onFieldChange("electricityImpactResultKgCO2PerMJ", "")
          }
          return
        }

        const e37 = parseFloat(biomassCalorificValue.replace(",", "."))

        // Verificar se os valores são válidos
        if (isNaN(e68) || isNaN(e59) || isNaN(e37) || e59 === 0) {
          if (data.electricityImpactResultKgCO2PerMJ !== "") {
            onFieldChange("electricityImpactResultKgCO2PerMJ", "")
          }
          return
        }

        // Calcular: E68 * (1 / E59) * E37
        const result = e68 * (1 / e59) * e37

        // Formatar resultado
        const formattedResult = formatSmartDecimal(result)
        updateFieldIfChanged(
          "electricityImpactResultKgCO2PerMJ",
          formattedResult,
          data.electricityImpactResultKgCO2PerMJ,
          onFieldChange
        )
      } catch (error) {
        console.error("Erro ao calcular impacto de eletricidade:", error)
      }
    }

    calculateElectricityImpactResult()
  }, [
    data.electricityImpactFactorKgCO2PerKWh,
    data.processedBiomassKgPerYear,
    previousPhases?.agricultural?.biomassCalorificValue,
    data.electricityImpactResultKgCO2PerMJ,
    onFieldChange,
  ])
}
