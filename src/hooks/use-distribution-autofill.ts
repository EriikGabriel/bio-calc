import type { AgriculturalPhaseFormData } from "@/components/sections/agricultural-phase-section"
import type { DistributionPhaseFormData } from "@/components/sections/distribution-phase-section"
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
function updateFieldIfChanged<T extends keyof DistributionPhaseFormData>(
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
 * Hook customizado para gerenciar preenchimentos automáticos da fase de distribuição.
 * Centraliza toda a lógica de cálculos e atualizações de campos derivados.
 *
 * Recebe os dados das fases anteriores para acessar valores já calculados.
 *
 * @param data - Dados do formulário de distribuição
 * @param onFieldChange - Callback para atualizar campos
 * @param previousPhases - Dados das fases anteriores (agrícola, industrial)
 */
export function useDistributionAutofill(
  data: DistributionPhaseFormData,
  onFieldChange: (name: keyof DistributionPhaseFormData, value: string) => void,
  previousPhases?: {
    agricultural?: AgriculturalPhaseFormData
    industrial?: IndustrialPhaseFormData
  }
) {
  // ============================================================================
  // 1. PERCENTUAL RODOVIÁRIO DOMÉSTICO
  // Fórmula: =1-SOMA(E98:E99)
  // E98 = domesticRailPercent
  // E99 = domesticWaterwayPercent
  // Calcula o percentual que sobra para transporte rodoviário (100% - ferroviário - hidroviário)
  // ============================================================================
  useEffect(() => {
    // Verificar se temos os valores de ferroviário e/ou hidroviário
    if (
      isEmpty(data.domesticRailPercent) &&
      isEmpty(data.domesticWaterwayPercent)
    ) {
      // Se ambos estão vazios, deixar rodoviário vazio também
      if (data.domesticRoadPercent !== "") {
        onFieldChange("domesticRoadPercent", "")
      }
      return
    }

    try {
      // Converter percentuais para números (valores já vêm como porcentagem, ex: 50 para 50%)
      const rail = isEmpty(data.domesticRailPercent)
        ? 0
        : parseFloat(data.domesticRailPercent.replace(",", "."))

      const waterway = isEmpty(data.domesticWaterwayPercent)
        ? 0
        : parseFloat(data.domesticWaterwayPercent.replace(",", "."))

      // Verificar se os valores são válidos
      if (isNaN(rail) || isNaN(waterway)) {
        if (data.domesticRoadPercent !== "") {
          onFieldChange("domesticRoadPercent", "")
        }
        return
      }

      // Calcular: 100 - (rail + waterway)
      const roadPercent = 100 - (rail + waterway)

      // Garantir que o resultado esteja entre 0 e 100
      const clampedPercent = Math.max(0, Math.min(100, roadPercent))

      // Formatar resultado com vírgula decimal (ex: 50,00 para 50%)
      const formattedResult = clampedPercent.toFixed(2).replace(".", ",")

      updateFieldIfChanged(
        "domesticRoadPercent",
        formattedResult,
        data.domesticRoadPercent,
        onFieldChange
      )
    } catch (error) {
      console.error("Erro ao calcular percentual rodoviário doméstico:", error)
    }
  }, [
    data.domesticRailPercent,
    data.domesticWaterwayPercent,
    data.domesticRoadPercent,
    onFieldChange,
  ])

  // ============================================================================
  // 2. IMPACTO DA DISTRIBUIÇÃO NO MERCADO DOMÉSTICO (kg CO2eq/ano)
  // Fórmula: =SEERRO(((E96*(E97*E98)*G76)+(E96*(E97*E99)*G75)+(E96*(E97*E100)*PROCV(E101;B70:G76;6;0)));0)
  // Calcula impacto para cada modal: (quantidade * distância * percentual * fator)
  // Ferrovia (E98): G76, Hidrovia (E99): G75, Rodoviário (E100): VLOOKUP do tipo de veículo
  // ============================================================================
  useEffect(() => {
    async function calculateDomesticDistributionImpact() {
      // Verificar campos obrigatórios
      if (
        isEmpty(data.domesticBiomassQuantityTon) ||
        isEmpty(data.domesticTransportDistanceKm)
      ) {
        if (data.domesticDistributionImpactKgCO2EqPerYear !== "") {
          onFieldChange("domesticDistributionImpactKgCO2EqPerYear", "")
        }
        return
      }

      try {
        // E96: Quantidade de biomassa (toneladas)
        const quantity = parseFloat(
          data.domesticBiomassQuantityTon.replace(",", ".")
        )

        // E97: Distância de transporte (km)
        const distance = parseFloat(
          data.domesticTransportDistanceKm.replace(",", ".")
        )

        if (isNaN(quantity) || isNaN(distance)) {
          if (data.domesticDistributionImpactKgCO2EqPerYear !== "") {
            onFieldChange("domesticDistributionImpactKgCO2EqPerYear", "")
          }
          return
        }

        // Percentuais (dividir por 100 para converter de porcentagem para decimal)
        const railPercent = isEmpty(data.domesticRailPercent)
          ? 0
          : parseFloat(data.domesticRailPercent.replace(",", ".")) / 100

        const waterwayPercent = isEmpty(data.domesticWaterwayPercent)
          ? 0
          : parseFloat(data.domesticWaterwayPercent.replace(",", ".")) / 100

        const roadPercent = isEmpty(data.domesticRoadPercent)
          ? 0
          : parseFloat(data.domesticRoadPercent.replace(",", ".")) / 100

        // Buscar fatores de impacto da planilha
        const factorsResponse = await getSheetRange(
          "Dados auxiliares",
          "G75:G76"
        )
        if (!factorsResponse.ok || !factorsResponse.cells) return

        // G75: Fator hidrovia, G76: Fator ferrovia
        const waterwayFactor = parseFloat(
          extractCellValue(factorsResponse.cells["G75"]).replace(",", ".")
        )
        const railFactor = parseFloat(
          extractCellValue(factorsResponse.cells["G76"]).replace(",", ".")
        )

        // VLOOKUP para fator rodoviário (tipo de veículo)
        let roadFactor = 0
        if (!isEmpty(data.domesticRoadVehicleType)) {
          const vehicleTableResponse = await getSheetRange(
            "Dados auxiliares",
            "B70:G76"
          )
          if (vehicleTableResponse.ok && vehicleTableResponse.cells) {
            // Procurar o tipo de veículo na tabela
            for (let row = 70; row <= 76; row++) {
              const vehicleType = extractCellValue(
                vehicleTableResponse.cells[`B${row}`]
              )
              if (vehicleType === data.domesticRoadVehicleType) {
                roadFactor = parseFloat(
                  extractCellValue(
                    vehicleTableResponse.cells[`G${row}`]
                  ).replace(",", ".")
                )
                break
              }
            }
          }
        }

        // Calcular impacto para cada modal
        const railImpact = quantity * (distance * railPercent) * railFactor
        const waterwayImpact =
          quantity * (distance * waterwayPercent) * waterwayFactor
        const roadImpact = quantity * (distance * roadPercent) * roadFactor

        // Somar todos os impactos
        const totalImpact = railImpact + waterwayImpact + roadImpact

        // Formatar resultado
        const formattedResult = formatSmartDecimal(totalImpact)
        updateFieldIfChanged(
          "domesticDistributionImpactKgCO2EqPerYear",
          formattedResult,
          data.domesticDistributionImpactKgCO2EqPerYear,
          onFieldChange
        )
      } catch (error) {
        console.error(
          "Erro ao calcular impacto da distribuição doméstica:",
          error
        )
      }
    }

    calculateDomesticDistributionImpact()
  }, [
    data.domesticBiomassQuantityTon,
    data.domesticTransportDistanceKm,
    data.domesticRailPercent,
    data.domesticWaterwayPercent,
    data.domesticRoadPercent,
    data.domesticRoadVehicleType,
    data.domesticDistributionImpactKgCO2EqPerYear,
    onFieldChange,
  ])

  // ============================================================================
  // 3. MJ TRANSPORTADO ANUALMENTE (mercado doméstico)
  // Fórmula: =SEERRO(E96*1000*(1/E37);" ")
  // E96 = domesticBiomassQuantityTon
  // E37 = biomassCalorificValue (da fase agrícola)
  // Converte toneladas para kg (*1000) e divide pelo poder calorífico
  // ============================================================================
  useEffect(() => {
    async function calculateDomesticMjTransported() {
      // Verificar se temos os valores necessários
      if (isEmpty(data.domesticBiomassQuantityTon)) {
        if (data.domesticMjTransportedPerYear !== "") {
          onFieldChange("domesticMjTransportedPerYear", "")
        }
        return
      }

      try {
        // E96: Quantidade de biomassa (toneladas)
        const quantity = parseFloat(
          data.domesticBiomassQuantityTon.replace(",", ".")
        )

        // E37: Poder calorífico da biomassa (da fase agrícola)
        const biomassCalorificValue =
          previousPhases?.agricultural?.biomassCalorificValue

        if (!biomassCalorificValue || isEmpty(biomassCalorificValue)) {
          if (data.domesticMjTransportedPerYear !== "") {
            onFieldChange("domesticMjTransportedPerYear", "")
          }
          return
        }

        const calorificValue = parseFloat(
          biomassCalorificValue.replace(",", ".")
        )

        if (isNaN(quantity) || isNaN(calorificValue) || calorificValue === 0) {
          if (data.domesticMjTransportedPerYear !== "") {
            onFieldChange("domesticMjTransportedPerYear", "")
          }
          return
        }

        // Calcular: quantidade (ton) * 1000 * (1 / poder calorífico)
        const mjTransported = quantity * 1000 * (1 / calorificValue)

        // Formatar resultado
        const formattedResult = formatSmartDecimal(mjTransported)
        updateFieldIfChanged(
          "domesticMjTransportedPerYear",
          formattedResult,
          data.domesticMjTransportedPerYear,
          onFieldChange
        )
      } catch (error) {
        console.error("Erro ao calcular MJ transportado doméstico:", error)
      }
    }

    calculateDomesticMjTransported()
  }, [
    data.domesticBiomassQuantityTon,
    previousPhases?.agricultural?.biomassCalorificValue,
    data.domesticMjTransportedPerYear,
    onFieldChange,
  ])

  // ============================================================================
  // 4. IMPACTO DA DISTRIBUIÇÃO NO MERCADO DOMÉSTICO (resultado final kgCO2eq/MJ)
  // Fórmula: =SEERRO(E102/E103;"")
  // E102 = domesticDistributionImpactKgCO2EqPerYear
  // E103 = domesticMjTransportedPerYear
  // Normaliza o impacto por MJ transportado
  // ============================================================================
  useEffect(() => {
    async function calculateDomesticImpactPerMj() {
      // Verificar se temos os valores calculados anteriormente
      if (
        isEmpty(data.domesticDistributionImpactKgCO2EqPerYear) ||
        isEmpty(data.domesticMjTransportedPerYear)
      ) {
        if (data.domesticImpactKgCO2EqPerMjTransported !== "") {
          onFieldChange("domesticImpactKgCO2EqPerMjTransported", "")
        }
        return
      }

      try {
        // E102: Impacto anual (kg CO2eq/ano)
        const impactPerYear = parseFloat(
          data.domesticDistributionImpactKgCO2EqPerYear.replace(",", ".")
        )

        // E103: MJ transportado anualmente
        const mjTransported = parseFloat(
          data.domesticMjTransportedPerYear.replace(",", ".")
        )

        if (
          isNaN(impactPerYear) ||
          isNaN(mjTransported) ||
          mjTransported === 0
        ) {
          if (data.domesticImpactKgCO2EqPerMjTransported !== "") {
            onFieldChange("domesticImpactKgCO2EqPerMjTransported", "")
          }
          return
        }

        // Calcular: impacto por ano / MJ transportado
        const impactPerMj = impactPerYear / mjTransported

        // Formatar resultado
        const formattedResult = formatSmartDecimal(impactPerMj)
        updateFieldIfChanged(
          "domesticImpactKgCO2EqPerMjTransported",
          formattedResult,
          data.domesticImpactKgCO2EqPerMjTransported,
          onFieldChange
        )
      } catch (error) {
        console.error("Erro ao calcular impacto doméstico por MJ:", error)
      }
    }

    calculateDomesticImpactPerMj()
  }, [
    data.domesticDistributionImpactKgCO2EqPerYear,
    data.domesticMjTransportedPerYear,
    data.domesticImpactKgCO2EqPerMjTransported,
    onFieldChange,
  ])

  // ============================================================================
  // 5. PERCENTUAL RODOVIÁRIO DE EXPORTAÇÃO (até o porto)
  // Fórmula: =1-SOMA(E109:E110)
  // E109 = exportRailPercentToPort
  // E110 = exportWaterwayPercentToPort
  // Calcula o percentual que sobra para transporte rodoviário (100% - ferroviário - hidroviário)
  // ============================================================================
  useEffect(() => {
    // Verificar se temos os valores de ferroviário e/ou hidroviário
    if (
      isEmpty(data.exportRailPercentToPort) &&
      isEmpty(data.exportWaterwayPercentToPort)
    ) {
      // Se ambos estão vazios, deixar rodoviário vazio também
      if (data.exportRoadPercentToPort !== "") {
        onFieldChange("exportRoadPercentToPort", "")
      }
      return
    }

    try {
      // Converter percentuais para números (valores já vêm como porcentagem, ex: 50 para 50%)
      const rail = isEmpty(data.exportRailPercentToPort)
        ? 0
        : parseFloat(data.exportRailPercentToPort.replace(",", "."))

      const waterway = isEmpty(data.exportWaterwayPercentToPort)
        ? 0
        : parseFloat(data.exportWaterwayPercentToPort.replace(",", "."))

      // Verificar se os valores são válidos
      if (isNaN(rail) || isNaN(waterway)) {
        if (data.exportRoadPercentToPort !== "") {
          onFieldChange("exportRoadPercentToPort", "")
        }
        return
      }

      // Calcular: 100 - (rail + waterway)
      const roadPercent = 100 - (rail + waterway)

      // Garantir que o resultado esteja entre 0 e 100
      const clampedPercent = Math.max(0, Math.min(100, roadPercent))

      // Formatar resultado com vírgula decimal (ex: 50,00 para 50%)
      const formattedResult = clampedPercent.toFixed(2).replace(".", ",")

      updateFieldIfChanged(
        "exportRoadPercentToPort",
        formattedResult,
        data.exportRoadPercentToPort,
        onFieldChange
      )
    } catch (error) {
      console.error(
        "Erro ao calcular percentual rodoviário de exportação:",
        error
      )
    }
  }, [
    data.exportRailPercentToPort,
    data.exportWaterwayPercentToPort,
    data.exportRoadPercentToPort,
    onFieldChange,
  ])

  // ============================================================================
  // 6. IMPACTO DA EXPORTAÇÃO - TRECHO FÁBRICA-PORTO (kg CO2eq/ano)
  // Fórmula: =(E107*(E108*E109)*G76)+(E107*(E108*E110)*G75)+(E107*(E108*E111)*PROCV(E112;B70:G76;6;0))
  // Mesmo padrão do doméstico, mas com distância fábrica-porto
  // ============================================================================
  useEffect(() => {
    async function calculateExportImpactFactoryToPort() {
      // Verificar campos obrigatórios
      if (
        isEmpty(data.exportBiomassQuantityTon) ||
        isEmpty(data.exportDistanceFactoryToNearestHydroPortKm)
      ) {
        if (data.exportDistributionImpactFactoryToPortKgCO2EqPerYear !== "") {
          onFieldChange(
            "exportDistributionImpactFactoryToPortKgCO2EqPerYear",
            ""
          )
        }
        return
      }

      try {
        // E107: Quantidade de biomassa exportada (toneladas)
        const quantity = parseFloat(
          data.exportBiomassQuantityTon.replace(",", ".")
        )

        // E108: Distância fábrica-porto (km)
        const distance = parseFloat(
          data.exportDistanceFactoryToNearestHydroPortKm.replace(",", ".")
        )

        if (isNaN(quantity) || isNaN(distance)) {
          if (data.exportDistributionImpactFactoryToPortKgCO2EqPerYear !== "") {
            onFieldChange(
              "exportDistributionImpactFactoryToPortKgCO2EqPerYear",
              ""
            )
          }
          return
        }

        // Percentuais (dividir por 100 para converter de porcentagem para decimal)
        const railPercent = isEmpty(data.exportRailPercentToPort)
          ? 0
          : parseFloat(data.exportRailPercentToPort.replace(",", ".")) / 100

        const waterwayPercent = isEmpty(data.exportWaterwayPercentToPort)
          ? 0
          : parseFloat(data.exportWaterwayPercentToPort.replace(",", ".")) / 100

        const roadPercent = isEmpty(data.exportRoadPercentToPort)
          ? 0
          : parseFloat(data.exportRoadPercentToPort.replace(",", ".")) / 100

        // Buscar fatores de impacto da planilha
        const factorsResponse = await getSheetRange(
          "Dados auxiliares",
          "G75:G76"
        )
        if (!factorsResponse.ok || !factorsResponse.cells) return

        // G75: Fator hidrovia, G76: Fator ferrovia
        const waterwayFactor = parseFloat(
          extractCellValue(factorsResponse.cells["G75"]).replace(",", ".")
        )
        const railFactor = parseFloat(
          extractCellValue(factorsResponse.cells["G76"]).replace(",", ".")
        )

        // VLOOKUP para fator rodoviário (tipo de veículo)
        let roadFactor = 0
        if (!isEmpty(data.exportRoadVehicleTypeToPort)) {
          const vehicleTableResponse = await getSheetRange(
            "Dados auxiliares",
            "B70:G76"
          )
          if (vehicleTableResponse.ok && vehicleTableResponse.cells) {
            // Procurar o tipo de veículo na tabela
            for (let row = 70; row <= 76; row++) {
              const vehicleType = extractCellValue(
                vehicleTableResponse.cells[`B${row}`]
              )
              if (vehicleType === data.exportRoadVehicleTypeToPort) {
                roadFactor = parseFloat(
                  extractCellValue(
                    vehicleTableResponse.cells[`G${row}`]
                  ).replace(",", ".")
                )
                break
              }
            }
          }
        }

        // Calcular impacto para cada modal
        const railImpact = quantity * (distance * railPercent) * railFactor
        const waterwayImpact =
          quantity * (distance * waterwayPercent) * waterwayFactor
        const roadImpact = quantity * (distance * roadPercent) * roadFactor

        // Somar todos os impactos
        const totalImpact = railImpact + waterwayImpact + roadImpact

        // Formatar resultado
        const formattedResult = formatSmartDecimal(totalImpact)
        updateFieldIfChanged(
          "exportDistributionImpactFactoryToPortKgCO2EqPerYear",
          formattedResult,
          data.exportDistributionImpactFactoryToPortKgCO2EqPerYear,
          onFieldChange
        )
      } catch (error) {
        console.error(
          "Erro ao calcular impacto exportação fábrica-porto:",
          error
        )
      }
    }

    calculateExportImpactFactoryToPort()
  }, [
    data.exportBiomassQuantityTon,
    data.exportDistanceFactoryToNearestHydroPortKm,
    data.exportRailPercentToPort,
    data.exportWaterwayPercentToPort,
    data.exportRoadPercentToPort,
    data.exportRoadVehicleTypeToPort,
    data.exportDistributionImpactFactoryToPortKgCO2EqPerYear,
    onFieldChange,
  ])

  // ============================================================================
  // 7. IMPACTO DA EXPORTAÇÃO - TRECHO PORTO-MERCADO CONSUMIDOR (kg CO2eq/ano)
  // Fórmula: =E107*E113*'Dados auxiliares'!G74
  // E107 = quantidade, E113 = distância porto-mercado, G74 = fator marítimo
  // ============================================================================
  useEffect(() => {
    async function calculateExportImpactPortToMarket() {
      // Verificar campos obrigatórios
      if (
        isEmpty(data.exportBiomassQuantityTon) ||
        isEmpty(data.exportDistancePortToForeignMarketKm)
      ) {
        if (data.exportDistributionImpactPortToMarketKgCO2EqPerYear !== "") {
          onFieldChange(
            "exportDistributionImpactPortToMarketKgCO2EqPerYear",
            ""
          )
        }
        return
      }

      try {
        // E107: Quantidade de biomassa exportada (toneladas)
        const quantity = parseFloat(
          data.exportBiomassQuantityTon.replace(",", ".")
        )

        // E113: Distância porto-mercado (km)
        const distance = parseFloat(
          data.exportDistancePortToForeignMarketKm.replace(",", ".")
        )

        if (isNaN(quantity) || isNaN(distance)) {
          if (data.exportDistributionImpactPortToMarketKgCO2EqPerYear !== "") {
            onFieldChange(
              "exportDistributionImpactPortToMarketKgCO2EqPerYear",
              ""
            )
          }
          return
        }

        // Buscar fator de transporte marítimo (G74)
        const factorResponse = await getSheetRange("Dados auxiliares", "G74")
        if (!factorResponse.ok || !factorResponse.cells) return

        const maritimeFactor = parseFloat(
          extractCellValue(factorResponse.cells["G74"]).replace(",", ".")
        )

        if (isNaN(maritimeFactor)) {
          if (data.exportDistributionImpactPortToMarketKgCO2EqPerYear !== "") {
            onFieldChange(
              "exportDistributionImpactPortToMarketKgCO2EqPerYear",
              ""
            )
          }
          return
        }

        // Calcular: quantidade × distância × fator marítimo
        const impact = quantity * distance * maritimeFactor

        // Formatar resultado
        const formattedResult = formatSmartDecimal(impact)
        updateFieldIfChanged(
          "exportDistributionImpactPortToMarketKgCO2EqPerYear",
          formattedResult,
          data.exportDistributionImpactPortToMarketKgCO2EqPerYear,
          onFieldChange
        )
      } catch (error) {
        console.error(
          "Erro ao calcular impacto exportação porto-mercado:",
          error
        )
      }
    }

    calculateExportImpactPortToMarket()
  }, [
    data.exportBiomassQuantityTon,
    data.exportDistancePortToForeignMarketKm,
    data.exportDistributionImpactPortToMarketKgCO2EqPerYear,
    onFieldChange,
  ])

  // ============================================================================
  // 8. MJ EXPORTADO POR ANO
  // Fórmula: =E107*1000*(1/E37)
  // E107 = quantidade exportada, E37 = poder calorífico
  // ============================================================================
  useEffect(() => {
    async function calculateExportMjTransported() {
      // Verificar se temos os valores necessários
      if (isEmpty(data.exportBiomassQuantityTon)) {
        if (data.exportMjTransportedPerYear !== "") {
          onFieldChange("exportMjTransportedPerYear", "")
        }
        return
      }

      try {
        // E107: Quantidade de biomassa exportada (toneladas)
        const quantity = parseFloat(
          data.exportBiomassQuantityTon.replace(",", ".")
        )

        // E37: Poder calorífico da biomassa (da fase agrícola)
        const biomassCalorificValue =
          previousPhases?.agricultural?.biomassCalorificValue

        if (!biomassCalorificValue || isEmpty(biomassCalorificValue)) {
          if (data.exportMjTransportedPerYear !== "") {
            onFieldChange("exportMjTransportedPerYear", "")
          }
          return
        }

        const calorificValue = parseFloat(
          biomassCalorificValue.replace(",", ".")
        )

        if (isNaN(quantity) || isNaN(calorificValue) || calorificValue === 0) {
          if (data.exportMjTransportedPerYear !== "") {
            onFieldChange("exportMjTransportedPerYear", "")
          }
          return
        }

        // Calcular: quantidade (ton) * 1000 * (1 / poder calorífico)
        const mjTransported = quantity * 1000 * (1 / calorificValue)

        // Formatar resultado
        const formattedResult = formatSmartDecimal(mjTransported)
        updateFieldIfChanged(
          "exportMjTransportedPerYear",
          formattedResult,
          data.exportMjTransportedPerYear,
          onFieldChange
        )
      } catch (error) {
        console.error("Erro ao calcular MJ exportado:", error)
      }
    }

    calculateExportMjTransported()
  }, [
    data.exportBiomassQuantityTon,
    previousPhases?.agricultural?.biomassCalorificValue,
    data.exportMjTransportedPerYear,
    onFieldChange,
  ])

  // ============================================================================
  // 9. IMPACTO DA EXPORTAÇÃO (resultado final kgCO2eq/MJ)
  // Fórmula: =SEERRO((E114+E115)/E116;" ")
  // E114 = impacto fábrica-porto, E115 = impacto porto-mercado, E116 = MJ exportado
  // ============================================================================
  useEffect(() => {
    async function calculateExportImpactPerMj() {
      // Verificar se temos os valores calculados anteriormente
      if (
        isEmpty(data.exportDistributionImpactFactoryToPortKgCO2EqPerYear) ||
        isEmpty(data.exportDistributionImpactPortToMarketKgCO2EqPerYear) ||
        isEmpty(data.exportMjTransportedPerYear)
      ) {
        if (data.exportImpactKgCO2EqPerMjTransported !== "") {
          onFieldChange("exportImpactKgCO2EqPerMjTransported", "")
        }
        return
      }

      try {
        // E114: Impacto fábrica-porto
        const impactFactoryToPort = parseFloat(
          data.exportDistributionImpactFactoryToPortKgCO2EqPerYear.replace(
            ",",
            "."
          )
        )

        // E115: Impacto porto-mercado
        const impactPortToMarket = parseFloat(
          data.exportDistributionImpactPortToMarketKgCO2EqPerYear.replace(
            ",",
            "."
          )
        )

        // E116: MJ transportado
        const mjTransported = parseFloat(
          data.exportMjTransportedPerYear.replace(",", ".")
        )

        if (
          isNaN(impactFactoryToPort) ||
          isNaN(impactPortToMarket) ||
          isNaN(mjTransported) ||
          mjTransported === 0
        ) {
          if (data.exportImpactKgCO2EqPerMjTransported !== "") {
            onFieldChange("exportImpactKgCO2EqPerMjTransported", "")
          }
          return
        }

        // Calcular: (impacto fábrica-porto + impacto porto-mercado) / MJ transportado
        const impactPerMj =
          (impactFactoryToPort + impactPortToMarket) / mjTransported

        // Formatar resultado
        const formattedResult = formatSmartDecimal(impactPerMj)
        updateFieldIfChanged(
          "exportImpactKgCO2EqPerMjTransported",
          formattedResult,
          data.exportImpactKgCO2EqPerMjTransported,
          onFieldChange
        )
      } catch (error) {
        console.error("Erro ao calcular impacto de exportação por MJ:", error)
      }
    }

    calculateExportImpactPerMj()
  }, [
    data.exportDistributionImpactFactoryToPortKgCO2EqPerYear,
    data.exportDistributionImpactPortToMarketKgCO2EqPerYear,
    data.exportMjTransportedPerYear,
    data.exportImpactKgCO2EqPerMjTransported,
    onFieldChange,
  ])
}
