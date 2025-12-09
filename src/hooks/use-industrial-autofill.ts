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

  // ============================================================================
  // 3. IMPACTO DA PRODUÇÃO DE COMBUSTÍVEL
  // Fórmula: =SEERRO(SOMARPRODUTO(E71:E78;'Dados auxiliares'!G48:G55); " ")
  // SUMPRODUCT dos valores de combustível × fatores de produção
  // ============================================================================
  useEffect(() => {
    async function calculateFuelProductionImpact() {
      // Array com os valores de combustível (E71:E78)
      const fuelValues = [
        data.fuelDieselLitersPerYear,
        data.fuelNaturalGasNm3PerYear,
        data.fuelLPGKgPerYear,
        data.fuelGasolineALitersPerYear,
        data.fuelEthanolAnhydrousLitersPerYear,
        data.fuelEthanolHydratedLitersPerYear,
        data.fuelWoodChipsKgPerYear,
        data.fuelFirewoodKgPerYear,
      ]

      // Verificar se pelo menos um valor está preenchido
      const hasAnyValue = fuelValues.some((v) => !isEmpty(v))
      if (!hasAnyValue) {
        if (data.fuelProductionImpactKgCO2PerYear !== "") {
          onFieldChange("fuelProductionImpactKgCO2PerYear", "")
        }
        return
      }

      try {
        // Buscar fatores de produção da planilha (G48:G55)
        const factorsResponse = await getSheetRange(
          "Dados auxiliares",
          "G48:G55"
        )
        if (!factorsResponse.ok || !factorsResponse.cells) return

        // Extrair valores das células (G48, G49, ..., G55)
        const productionFactors = [
          extractCellValue(factorsResponse.cells["G48"]),
          extractCellValue(factorsResponse.cells["G49"]),
          extractCellValue(factorsResponse.cells["G50"]),
          extractCellValue(factorsResponse.cells["G51"]),
          extractCellValue(factorsResponse.cells["G52"]),
          extractCellValue(factorsResponse.cells["G53"]),
          extractCellValue(factorsResponse.cells["G54"]),
          extractCellValue(factorsResponse.cells["G55"]),
        ]

        // Calcular SUMPRODUCT: soma de (valor × fator) para cada linha
        let sumProduct = 0
        for (let i = 0; i < fuelValues.length; i++) {
          const value = fuelValues[i]
          const factor = productionFactors[i]

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
          "fuelProductionImpactKgCO2PerYear",
          result,
          data.fuelProductionImpactKgCO2PerYear,
          onFieldChange
        )
      } catch (error) {
        console.error(
          "Erro ao calcular impacto de produção de combustível:",
          error
        )
      }
    }

    calculateFuelProductionImpact()
  }, [
    data.fuelDieselLitersPerYear,
    data.fuelNaturalGasNm3PerYear,
    data.fuelLPGKgPerYear,
    data.fuelGasolineALitersPerYear,
    data.fuelEthanolAnhydrousLitersPerYear,
    data.fuelEthanolHydratedLitersPerYear,
    data.fuelWoodChipsKgPerYear,
    data.fuelFirewoodKgPerYear,
    data.fuelProductionImpactKgCO2PerYear,
    onFieldChange,
  ])

  // ============================================================================
  // 4. IMPACTO DA COMBUSTÃO ESTACIONÁRIA
  // Fórmula: =SEERRO(SOMARPRODUTO(E71:E78;'Dados auxiliares'!G57:G64); " ")
  // SUMPRODUCT dos valores de combustível × fatores de combustão
  // ============================================================================
  useEffect(() => {
    async function calculateFuelCombustionImpact() {
      // Array com os valores de combustível (E71:E78)
      const fuelValues = [
        data.fuelDieselLitersPerYear,
        data.fuelNaturalGasNm3PerYear,
        data.fuelLPGKgPerYear,
        data.fuelGasolineALitersPerYear,
        data.fuelEthanolAnhydrousLitersPerYear,
        data.fuelEthanolHydratedLitersPerYear,
        data.fuelWoodChipsKgPerYear,
        data.fuelFirewoodKgPerYear,
      ]

      // Verificar se pelo menos um valor está preenchido
      const hasAnyValue = fuelValues.some((v) => !isEmpty(v))
      if (!hasAnyValue) {
        if (data.fuelStationaryCombustionImpactKgCO2PerYear !== "") {
          onFieldChange("fuelStationaryCombustionImpactKgCO2PerYear", "")
        }
        return
      }

      try {
        // Buscar fatores de combustão da planilha (G57:G64)
        const factorsResponse = await getSheetRange(
          "Dados auxiliares",
          "G57:G64"
        )
        if (!factorsResponse.ok || !factorsResponse.cells) return

        // Extrair valores das células (G57, G58, ..., G64)
        const combustionFactors = [
          extractCellValue(factorsResponse.cells["G57"]),
          extractCellValue(factorsResponse.cells["G58"]),
          extractCellValue(factorsResponse.cells["G59"]),
          extractCellValue(factorsResponse.cells["G60"]),
          extractCellValue(factorsResponse.cells["G61"]),
          extractCellValue(factorsResponse.cells["G62"]),
          extractCellValue(factorsResponse.cells["G63"]),
          extractCellValue(factorsResponse.cells["G64"]),
        ]

        // Calcular SUMPRODUCT: soma de (valor × fator) para cada linha
        let sumProduct = 0
        for (let i = 0; i < fuelValues.length; i++) {
          const value = fuelValues[i]
          const factor = combustionFactors[i]

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
          "fuelStationaryCombustionImpactKgCO2PerYear",
          result,
          data.fuelStationaryCombustionImpactKgCO2PerYear,
          onFieldChange
        )
      } catch (error) {
        console.error(
          "Erro ao calcular impacto de combustão estacionária:",
          error
        )
      }
    }

    calculateFuelCombustionImpact()
  }, [
    data.fuelDieselLitersPerYear,
    data.fuelNaturalGasNm3PerYear,
    data.fuelLPGKgPerYear,
    data.fuelGasolineALitersPerYear,
    data.fuelEthanolAnhydrousLitersPerYear,
    data.fuelEthanolHydratedLitersPerYear,
    data.fuelWoodChipsKgPerYear,
    data.fuelFirewoodKgPerYear,
    data.fuelStationaryCombustionImpactKgCO2PerYear,
    onFieldChange,
  ])

  // ============================================================================
  // 5. IMPACTO DO CONSUMO DE COMBUSTÍVEL (resultado final)
  // Fórmula: =SEERRO((E79+E80)*(1/E59)*E37; " ")
  // E79 = fuelProductionImpactKgCO2PerYear
  // E80 = fuelStationaryCombustionImpactKgCO2PerYear
  // E59 = processedBiomassKgPerYear
  // E37 = biomassCalorificValue (da fase agrícola)
  // ============================================================================
  useEffect(() => {
    async function calculateFuelConsumptionImpact() {
      // Verificar se temos todos os valores necessários
      if (
        isEmpty(data.fuelProductionImpactKgCO2PerYear) ||
        isEmpty(data.fuelStationaryCombustionImpactKgCO2PerYear) ||
        isEmpty(data.processedBiomassKgPerYear)
      ) {
        if (data.fuelConsumptionImpactKgCO2PerMJ !== "") {
          onFieldChange("fuelConsumptionImpactKgCO2PerMJ", "")
        }
        return
      }

      try {
        // E79 (impacto de produção)
        const e79 = parseFloat(
          data.fuelProductionImpactKgCO2PerYear.replace(",", ".")
        )

        // E80 (impacto de combustão)
        const e80 = parseFloat(
          data.fuelStationaryCombustionImpactKgCO2PerYear.replace(",", ".")
        )

        // E59 (biomassa processada)
        const e59 = parseFloat(data.processedBiomassKgPerYear.replace(",", "."))

        // E37 (poder calorífico da biomassa - vem da fase agrícola)
        const biomassCalorificValue =
          previousPhases?.agricultural?.biomassCalorificValue

        if (!biomassCalorificValue || isEmpty(biomassCalorificValue)) {
          if (data.fuelConsumptionImpactKgCO2PerMJ !== "") {
            onFieldChange("fuelConsumptionImpactKgCO2PerMJ", "")
          }
          return
        }

        const e37 = parseFloat(biomassCalorificValue.replace(",", "."))

        // Verificar se os valores são válidos
        if (isNaN(e79) || isNaN(e80) || isNaN(e59) || isNaN(e37) || e59 === 0) {
          if (data.fuelConsumptionImpactKgCO2PerMJ !== "") {
            onFieldChange("fuelConsumptionImpactKgCO2PerMJ", "")
          }
          return
        }

        // Calcular: (E79 + E80) * (1 / E59) * E37
        const result = (e79 + e80) * (1 / e59) * e37

        // Formatar resultado
        const formattedResult = formatSmartDecimal(result)
        updateFieldIfChanged(
          "fuelConsumptionImpactKgCO2PerMJ",
          formattedResult,
          data.fuelConsumptionImpactKgCO2PerMJ,
          onFieldChange
        )
      } catch (error) {
        console.error(
          "Erro ao calcular impacto de consumo de combustível:",
          error
        )
      }
    }

    calculateFuelConsumptionImpact()
  }, [
    data.fuelProductionImpactKgCO2PerYear,
    data.fuelStationaryCombustionImpactKgCO2PerYear,
    data.processedBiomassKgPerYear,
    previousPhases?.agricultural?.biomassCalorificValue,
    data.fuelConsumptionImpactKgCO2PerMJ,
    onFieldChange,
  ])

  // ============================================================================
  // 6. FATOR DE EMISSÃO DA COMBUSTÃO DA BIOMASSA
  // Fórmula: =SEERRO((PROCV(E33;'Dados auxiliares'!B33:G39;6;0));0)
  // E33 = biomassType (da fase agrícola)
  // VLOOKUP na coluna 6 (G) da tabela B33:G39
  // ============================================================================
  useEffect(() => {
    async function calculateBiomassCombustionEmissionFactor() {
      // E33 (tipo de biomassa - vem da fase agrícola)
      const biomassType = previousPhases?.agricultural?.biomassType

      if (!biomassType || isEmpty(biomassType)) {
        if (data.biomassCombustionEmissionFactorKgCO2PerKg !== "") {
          onFieldChange("biomassCombustionEmissionFactorKgCO2PerKg", "")
        }
        return
      }

      try {
        // Buscar tabela de referência (B33:G39)
        const tableResponse = await getSheetRange("Dados auxiliares", "B33:G39")
        if (!tableResponse.ok || !tableResponse.cells) return

        // VLOOKUP: procurar biomassType na coluna B e retornar valor da coluna G (coluna 6)
        // Linhas: 33, 34, 35, 36, 37, 38, 39
        let emissionFactor = "0"
        for (let row = 33; row <= 39; row++) {
          const cellKey = `B${row}`
          const cellValue = extractCellValue(tableResponse.cells[cellKey])

          if (cellValue && cellValue.trim() === biomassType.trim()) {
            // Encontrou! Pegar valor da coluna G (6ª coluna)
            const factorKey = `G${row}`
            const factor = extractCellValue(tableResponse.cells[factorKey])
            if (factor) {
              // Converter para número e formatar em notação científica
              const numFactor = parseFloat(factor.replace(",", "."))
              if (!isNaN(numFactor)) {
                emissionFactor = formatSmartDecimal(numFactor)
              } else {
                emissionFactor = factor // Manter valor original se não for número válido
              }
              break
            }
          }
        }

        // Atualizar campo
        updateFieldIfChanged(
          "biomassCombustionEmissionFactorKgCO2PerKg",
          emissionFactor,
          data.biomassCombustionEmissionFactorKgCO2PerKg,
          onFieldChange
        )
      } catch (error) {
        console.error(
          "Erro ao calcular fator de emissão da combustão da biomassa:",
          error
        )
      }
    }

    calculateBiomassCombustionEmissionFactor()
  }, [
    previousPhases?.agricultural?.biomassType,
    data.biomassCombustionEmissionFactorKgCO2PerKg,
    onFieldChange,
  ])

  // ============================================================================
  // 7. IMPACTO DA COMBUSTÃO DA BIOMASSA (preenchimento automático em kg/ano)
  // Fórmula: =SEERRO((E60*E83);" ")
  // E60 = biomassConsumedInCogenerationKgPerYear
  // E83 = biomassCombustionEmissionFactorKgCO2PerKg
  // ============================================================================
  useEffect(() => {
    async function calculateBiomassCombustionImpactPerYear() {
      // Verificar se temos os valores necessários
      if (
        isEmpty(data.biomassConsumedInCogenerationKgPerYear) ||
        isEmpty(data.biomassCombustionEmissionFactorKgCO2PerKg)
      ) {
        if (data.biomassCombustionImpactKgCO2PerYear !== "") {
          onFieldChange("biomassCombustionImpactKgCO2PerYear", "")
        }
        return
      }

      try {
        // E60 (biomassa consumida na co-geração)
        const e60 = parseFloat(
          data.biomassConsumedInCogenerationKgPerYear.replace(",", ".")
        )

        // E83 (fator de emissão)
        const e83 = parseFloat(
          data.biomassCombustionEmissionFactorKgCO2PerKg.replace(",", ".")
        )

        // Verificar se os valores são válidos
        if (isNaN(e60) || isNaN(e83)) {
          if (data.biomassCombustionImpactKgCO2PerYear !== "") {
            onFieldChange("biomassCombustionImpactKgCO2PerYear", "")
          }
          return
        }

        // Calcular: E60 * E83
        const result = e60 * e83

        // Formatar resultado
        const formattedResult = formatSmartDecimal(result)
        updateFieldIfChanged(
          "biomassCombustionImpactKgCO2PerYear",
          formattedResult,
          data.biomassCombustionImpactKgCO2PerYear,
          onFieldChange
        )
      } catch (error) {
        console.error(
          "Erro ao calcular impacto da combustão da biomassa (kg/ano):",
          error
        )
      }
    }

    calculateBiomassCombustionImpactPerYear()
  }, [
    data.biomassConsumedInCogenerationKgPerYear,
    data.biomassCombustionEmissionFactorKgCO2PerKg,
    data.biomassCombustionImpactKgCO2PerYear,
    onFieldChange,
  ])

  // ============================================================================
  // 8. IMPACTO DA COMBUSTÃO DA BIOMASSA (resultado final em kgCO2/MJ)
  // Fórmula: =SEERRO((E84)*(1/E59)*E37; " ")
  // E84 = biomassCombustionImpactKgCO2PerYear
  // E59 = processedBiomassKgPerYear
  // E37 = biomassCalorificValue (da fase agrícola)
  // ============================================================================
  useEffect(() => {
    async function calculateBiomassCombustionImpactPerMJ() {
      // Verificar se temos os valores necessários
      if (
        isEmpty(data.biomassCombustionImpactKgCO2PerYear) ||
        isEmpty(data.processedBiomassKgPerYear)
      ) {
        if (data.biomassCombustionImpactKgCO2PerMJ !== "") {
          onFieldChange("biomassCombustionImpactKgCO2PerMJ", "")
        }
        return
      }

      try {
        // E84 (impacto em kg/ano)
        const e84 = parseFloat(
          data.biomassCombustionImpactKgCO2PerYear.replace(",", ".")
        )

        // E59 (biomassa processada)
        const e59 = parseFloat(data.processedBiomassKgPerYear.replace(",", "."))

        // E37 (poder calorífico da biomassa - vem da fase agrícola)
        const biomassCalorificValue =
          previousPhases?.agricultural?.biomassCalorificValue

        if (!biomassCalorificValue || isEmpty(biomassCalorificValue)) {
          if (data.biomassCombustionImpactKgCO2PerMJ !== "") {
            onFieldChange("biomassCombustionImpactKgCO2PerMJ", "")
          }
          return
        }

        const e37 = parseFloat(biomassCalorificValue.replace(",", "."))

        // Verificar se os valores são válidos
        if (isNaN(e84) || isNaN(e59) || isNaN(e37) || e59 === 0) {
          if (data.biomassCombustionImpactKgCO2PerMJ !== "") {
            onFieldChange("biomassCombustionImpactKgCO2PerMJ", "")
          }
          return
        }

        // Calcular: E84 * (1 / E59) * E37
        const result = e84 * (1 / e59) * e37

        // Formatar resultado
        const formattedResult = formatSmartDecimal(result)
        updateFieldIfChanged(
          "biomassCombustionImpactKgCO2PerMJ",
          formattedResult,
          data.biomassCombustionImpactKgCO2PerMJ,
          onFieldChange
        )
      } catch (error) {
        console.error(
          "Erro ao calcular impacto da combustão da biomassa (kgCO2/MJ):",
          error
        )
      }
    }

    calculateBiomassCombustionImpactPerMJ()
  }, [
    data.biomassCombustionImpactKgCO2PerYear,
    data.processedBiomassKgPerYear,
    previousPhases?.agricultural?.biomassCalorificValue,
    data.biomassCombustionImpactKgCO2PerMJ,
    onFieldChange,
  ])

  // ============================================================================
  // 9. IMPACTO DA FASE INDUSTRIAL (manufatura - kg/ano)
  // Fórmula: =SEERRO(SOMARPRODUTO(E87:E89;'Dados auxiliares'!G66:G68); " ")
  // SUMPRODUCT dos insumos de manufatura × fatores de impacto
  // ============================================================================
  useEffect(() => {
    async function calculateManufacturingImpactPerYear() {
      // Array com os valores de insumos de manufatura (E87:E89)
      const manufacturingInputs = [
        data.waterLitersPerYear,
        data.lubricantOilKgPerYear,
        data.silicaSandKgPerYear,
      ]

      // Verificar se pelo menos um valor está preenchido
      const hasAnyValue = manufacturingInputs.some((v) => !isEmpty(v))
      if (!hasAnyValue) {
        if (data.manufacturingImpactKgCO2eqPerYear !== "") {
          onFieldChange("manufacturingImpactKgCO2eqPerYear", "")
        }
        return
      }

      try {
        // Buscar fatores de impacto da planilha (G66:G68)
        const factorsResponse = await getSheetRange(
          "Dados auxiliares",
          "G66:G68"
        )
        if (!factorsResponse.ok || !factorsResponse.cells) return

        // Extrair valores das células (G66, G67, G68)
        const impactFactors = [
          extractCellValue(factorsResponse.cells["G66"]),
          extractCellValue(factorsResponse.cells["G67"]),
          extractCellValue(factorsResponse.cells["G68"]),
        ]

        // Calcular SUMPRODUCT: soma de (valor × fator) para cada linha
        let sumProduct = 0
        for (let i = 0; i < manufacturingInputs.length; i++) {
          const value = manufacturingInputs[i]
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
          "manufacturingImpactKgCO2eqPerYear",
          result,
          data.manufacturingImpactKgCO2eqPerYear,
          onFieldChange
        )
      } catch (error) {
        console.error("Erro ao calcular impacto da manufatura (kg/ano):", error)
      }
    }

    calculateManufacturingImpactPerYear()
  }, [
    data.waterLitersPerYear,
    data.lubricantOilKgPerYear,
    data.silicaSandKgPerYear,
    data.manufacturingImpactKgCO2eqPerYear,
    onFieldChange,
  ])

  // ============================================================================
  // 10. IMPACTO DA FASE INDUSTRIAL (resultado final em kgCO2eq/MJ)
  // Fórmula: =SEERRO(E90*(1/E59)*E37; " ")
  // E90 = manufacturingImpactKgCO2eqPerYear
  // E59 = processedBiomassKgPerYear
  // E37 = biomassCalorificValue (da fase agrícola)
  // ============================================================================
  useEffect(() => {
    async function calculateManufacturingImpactPerMJ() {
      // Verificar se temos os valores necessários
      if (
        isEmpty(data.manufacturingImpactKgCO2eqPerYear) ||
        isEmpty(data.processedBiomassKgPerYear)
      ) {
        if (data.manufacturingImpactKgCO2eqPerMJ !== "") {
          onFieldChange("manufacturingImpactKgCO2eqPerMJ", "")
        }
        return
      }

      try {
        // E90 (impacto em kg/ano)
        const e90 = parseFloat(
          data.manufacturingImpactKgCO2eqPerYear.replace(",", ".")
        )

        // E59 (biomassa processada)
        const e59 = parseFloat(data.processedBiomassKgPerYear.replace(",", "."))

        // E37 (poder calorífico da biomassa - vem da fase agrícola)
        const biomassCalorificValue =
          previousPhases?.agricultural?.biomassCalorificValue

        if (!biomassCalorificValue || isEmpty(biomassCalorificValue)) {
          if (data.manufacturingImpactKgCO2eqPerMJ !== "") {
            onFieldChange("manufacturingImpactKgCO2eqPerMJ", "")
          }
          return
        }

        const e37 = parseFloat(biomassCalorificValue.replace(",", "."))

        // Verificar se os valores são válidos
        if (isNaN(e90) || isNaN(e59) || isNaN(e37) || e59 === 0) {
          if (data.manufacturingImpactKgCO2eqPerMJ !== "") {
            onFieldChange("manufacturingImpactKgCO2eqPerMJ", "")
          }
          return
        }

        // Calcular: E90 * (1 / E59) * E37
        const result = e90 * (1 / e59) * e37

        // Formatar resultado
        const formattedResult = formatSmartDecimal(result)
        updateFieldIfChanged(
          "manufacturingImpactKgCO2eqPerMJ",
          formattedResult,
          data.manufacturingImpactKgCO2eqPerMJ,
          onFieldChange
        )
      } catch (error) {
        console.error(
          "Erro ao calcular impacto da manufatura (kgCO2eq/MJ):",
          error
        )
      }
    }

    calculateManufacturingImpactPerMJ()
  }, [
    data.manufacturingImpactKgCO2eqPerYear,
    data.processedBiomassKgPerYear,
    previousPhases?.agricultural?.biomassCalorificValue,
    data.manufacturingImpactKgCO2eqPerMJ,
    onFieldChange,
  ])
}
