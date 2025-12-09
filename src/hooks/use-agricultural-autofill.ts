import type { AgriculturalPhaseFormData } from "@/components/sections/agricultural-phase-section"
import { getBiomassData, getSheetCell, vlookup } from "@/services/calc-api"
import {
  addDecimals,
  extractCellValue,
  formatSmartDecimal,
  multiplyDecimals,
  multiplyMultipleDecimals,
} from "@/utils/spreadsheet"
import { isEmpty } from "lodash"
import { useEffect, useRef } from "react"

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Normaliza o nome da biomassa para exibição no campo de cultivo agrícola.
 * Remove prefixos como "Resíduo de", "Carvão vegetal de", "Casca de" e sufixos como "Virgem".
 * Garante que a primeira letra seja maiúscula.
 *
 * Exemplos:
 * - "Eucalipto Virgem" -> "Eucalipto"
 * - "Resíduo de Eucaliptus" -> "Eucalipto"
 * - "Carvão vegetal de eucalipto" -> "Eucalipto"
 * - "Casca de Amendoin" -> "Amendoin"
 * - "Pinus Virgem" -> "Pinus"
 * - "Resíduo de Pinus" -> "Pinus"
 */
function normalizeBiomassName(biomassType: string): string {
  if (!biomassType) return biomassType

  let normalized = biomassType
    // Remove "Resíduo de " do início
    .replace(/^Resíduo de\s+/i, "")
    // Remove "Carvão vegetal de " do início
    .replace(/^Carvão vegetal de\s+/i, "")
    // Remove "Casca de " do início
    .replace(/^Casca de\s+/i, "")
    // Remove " Virgem" do final
    .replace(/\s+Virgem$/i, "")
    // Normaliza "Eucaliptus" para "Eucalipto"
    .replace(/Eucaliptus/i, "Eucalipto")
    .trim()

  // Garante que a primeira letra seja maiúscula
  if (normalized.length > 0) {
    normalized =
      normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
  }

  return normalized
}

/**
 * Hook genérico para executar efeito apenas quando valor mudar
 */
function useAutofillEffect(
  triggerValue: string,
  callback: () => Promise<void>,
  dependencies: unknown[]
) {
  const lastValueRef = useRef("")

  useEffect(() => {
    async function run() {
      if (isEmpty(triggerValue) || lastValueRef.current === triggerValue) return

      lastValueRef.current = triggerValue
      await callback()
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerValue, ...dependencies])
}

/**
 * Atualiza campo apenas se o valor for diferente do atual
 */
function updateFieldIfChanged<T extends keyof AgriculturalPhaseFormData>(
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
 * Hook customizado para gerenciar preenchimentos automáticos da fase agrícola.
 * Centraliza toda a lógica de cálculos e atualizações de campos derivados.
 */
export function useAgriculturalAutofill(
  data: AgriculturalPhaseFormData,
  onFieldChange: (name: keyof AgriculturalPhaseFormData, value: string) => void
) {
  // ============================================================================
  // 1. BIOMASSA: Atualizar fator de impacto, poder calorífico e cultivo agrícola
  // ============================================================================
  useAutofillEffect(
    data.biomassType,
    async () => {
      const biomassData = await getBiomassData(data.biomassType)

      updateFieldIfChanged(
        "biomassImpactFactor",
        biomassData.impactFactor,
        data.biomassImpactFactor,
        onFieldChange
      )

      updateFieldIfChanged(
        "biomassCalorificValue",
        biomassData.calorificValue,
        data.biomassCalorificValue,
        onFieldChange
      )

      // Cultivo agrícola recebe o valor normalizado do tipo de biomassa
      // Exemplo: "Eucalipto Virgem" -> "Eucalipto", "Resíduo de Pinus" -> "Pinus"
      const normalizedCultivationType = normalizeBiomassName(data.biomassType)
      updateFieldIfChanged(
        "cultivationType",
        normalizedCultivationType,
        data.cultivationType,
        onFieldChange
      )

      // Controlar campo "Etapa do ciclo de vida da madeira"
      // Apenas para "Resíduo de Pinus" e "Resíduo de Eucaliptus" o dropdown é habilitado
      // Para todos os outros, deve aparecer "Não aplica" e ficar desativado
      const isWoodResidue =
        /^Resíduo de Pinus$/i.test(data.biomassType) ||
        /^Resíduo de Eucaliptus$/i.test(data.biomassType)

      if (!isWoodResidue) {
        // Para biomassas que não são resíduos de madeira, definir como "Não aplica"
        if (data.woodResidueLifecycleStage !== "Não aplica") {
          onFieldChange("woodResidueLifecycleStage", "Não aplica")
        }
      } else if (data.woodResidueLifecycleStage === "Não aplica") {
        // Se for resíduo de madeira e estava "Não aplica", limpar para permitir seleção
        onFieldChange("woodResidueLifecycleStage", "")
      }
    },
    [
      data.biomassImpactFactor,
      data.biomassCalorificValue,
      data.cultivationType,
      data.woodResidueLifecycleStage,
      onFieldChange,
    ]
  )

  // ============================================================================
  // 2. AMIDO DE MILHO: Calcular impacto (entrada × fator D32)
  // ============================================================================
  const cornFactorCache = useRef<string | null>(null)
  const lastCornInputRef = useRef("")
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Limpar timeout anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Se entrada está vazia, limpar o impacto
    if (isEmpty(data.cornStarchInput)) {
      if (data.cornStarchImpact !== "") {
        onFieldChange("cornStarchImpact", "")
      }
      lastCornInputRef.current = ""
      return
    }

    // Se o valor não mudou, não fazer nada
    if (lastCornInputRef.current === data.cornStarchInput) return

    // Debounce: aguardar 500ms após parar de digitar
    debounceTimerRef.current = setTimeout(async () => {
      lastCornInputRef.current = data.cornStarchInput

      // Buscar fator D32 apenas uma vez (cache)
      if (!cornFactorCache.current) {
        const factorRes = await getSheetCell("Dados auxiliares", "D32")
        if (!factorRes.ok || !factorRes.cell) return

        const factorValue = extractCellValue(factorRes.cell)
        if (!factorValue) return

        cornFactorCache.current = factorValue
      }

      // Calcular impacto: entrada × fator usando multiplyDecimals
      const impactStr = multiplyDecimals(
        data.cornStarchInput,
        cornFactorCache.current
      )

      updateFieldIfChanged(
        "cornStarchImpact",
        impactStr,
        data.cornStarchImpact,
        onFieldChange
      )
    }, 500)

    // Cleanup do timeout
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [data.cornStarchInput, data.cornStarchImpact, onFieldChange])

  // ============================================================================
  // 3. FATOR DE IMPACTO DO MUT
  // Fórmula: =SEERRO(IFS(E43="Pinus"; ((PROCV(E42;'Dados auxiliares'!B95:N124;5;0))*1000);
  //                       E43="Eucalipto"; ((PROCV(E42;'Dados auxiliares'!B95:N124;9;0))*1000);
  //                       E43="Amendoin"; ((PROCV(E42;'Dados auxiliares'!B95:N124;13;0))*1000)); " ")
  // ============================================================================
  useAutofillEffect(
    data.biomassProductionState + "|" + data.cultivationType,
    async () => {
      // Verificar se temos estado e tipo de cultivo
      if (!data.biomassProductionState || !data.cultivationType) {
        return
      }

      // Determinar qual coluna buscar baseado no tipo de cultivo
      let columnIndex: number | undefined

      if (/^Pinus$/i.test(data.cultivationType)) {
        columnIndex = 4 // Coluna F (5ª coluna, índice 4)
      } else if (/^Eucalipto$/i.test(data.cultivationType)) {
        columnIndex = 8 // Coluna J (9ª coluna, índice 8)
      } else if (/^Amendoim$/i.test(data.cultivationType)) {
        columnIndex = 12 // Coluna N (13ª coluna, índice 12)
      }

      if (columnIndex === undefined) {
        // Se não for nenhum dos tipos reconhecidos, limpar o campo
        if (data.mutImpactFactor !== "") {
          onFieldChange("mutImpactFactor", "")
        }
        return
      }

      // Buscar o valor na tabela B95:N124
      const mutFactorRaw = await vlookup(
        "Dados auxiliares",
        "B95:N124",
        data.biomassProductionState,
        0, // Procurar na coluna B (estado)
        columnIndex
      )

      if (mutFactorRaw) {
        // Multiplicar por 1000 conforme a fórmula
        const numValue = parseFloat(mutFactorRaw.replace(",", "."))
        if (!isNaN(numValue)) {
          const result = formatSmartDecimal(numValue * 1000)
          updateFieldIfChanged(
            "mutImpactFactor",
            result,
            data.mutImpactFactor,
            onFieldChange
          )
        }
      } else {
        // Se não encontrou valor, limpar
        if (data.mutImpactFactor !== "") {
          onFieldChange("mutImpactFactor", "")
        }
      }
    },
    [data.mutImpactFactor, onFieldChange]
  )

  // ============================================================================
  // 4. PERCENTUAL DE ALOCAÇÃO DA BIOMASSA (MUT)
  // Fórmula: =SEERRO(PROCV((E33&E44);'Dados auxiliares'!D78:J92;7;0); " ")
  // Concatena tipo de biomassa (E33) + etapa do ciclo de vida (E44)
  // Busca na tabela D78:J92, retorna coluna J (7ª coluna, índice 6)
  // ============================================================================
  const lastAllocationKeyRef = useRef("")

  useEffect(() => {
    async function fetchAllocation() {
      // Verificar se temos tipo de biomassa e etapa do ciclo de vida
      if (!data.biomassType || !data.woodResidueLifecycleStage) {
        return
      }

      // Criar chave de busca
      const lookupKey = data.biomassType + data.woodResidueLifecycleStage

      // Se a chave não mudou, não fazer nada
      if (lastAllocationKeyRef.current === lookupKey) {
        return
      }

      lastAllocationKeyRef.current = lookupKey

      // Se a etapa for "Não aplica", limpar o percentual
      if (data.woodResidueLifecycleStage === "Não aplica") {
        if (data.mutAllocationPercent !== "") {
          onFieldChange("mutAllocationPercent", "")
        }
        return
      }

      // Buscar o valor na tabela D78:J92 (coluna J = índice 6)
      const allocationRaw = await vlookup(
        "Dados auxiliares",
        "D78:J92",
        lookupKey,
        0, // Procurar na coluna D (primeira coluna do range)
        6 // Retornar coluna J (7ª coluna, índice 6)
      )

      if (allocationRaw) {
        // Converter para porcentagem (multiplicar por 100)
        const numValue = parseFloat(allocationRaw.replace(",", "."))
        if (!isNaN(numValue)) {
          const percentValue = numValue * 100
          // Formatar como número decimal, não científico
          const result = percentValue.toFixed(2).replace(".", ",")
          if (result !== data.mutAllocationPercent) {
            onFieldChange("mutAllocationPercent", result)
          }
        }
      } else {
        // Se não encontrou valor, limpar
        if (data.mutAllocationPercent !== "") {
          onFieldChange("mutAllocationPercent", "")
        }
      }
    }

    fetchAllocation()
  }, [
    data.biomassType,
    data.woodResidueLifecycleStage,
    data.mutAllocationPercent,
    onFieldChange,
  ])

  // ============================================================================
  // 5. IMPACTO MUT
  // ============================================================================
  useEffect(() => {
    // Verificar se temos todos os valores necessários
    if (
      !data.biomassCalorificValue ||
      !data.mutImpactFactor ||
      !data.mutAllocationPercent
    ) {
      if (data.mutImpactResult !== "") {
        onFieldChange("mutImpactResult", "")
      }
      return
    }

    // Converter percentual para decimal (dividir por 100)
    const percentValue = parseFloat(data.mutAllocationPercent.replace(",", "."))
    if (isNaN(percentValue)) return

    const percentDecimal = percentValue / 100

    // Calcular: poder_calorífico × (fator_impacto_MUT × percentual_alocação)
    const factorTimesPercent = multiplyDecimals(
      data.mutImpactFactor,
      percentDecimal.toFixed(6).replace(".", ",")
    )

    if (!factorTimesPercent) return

    const result = multiplyDecimals(
      data.biomassCalorificValue,
      factorTimesPercent
    )

    if (result) {
      updateFieldIfChanged(
        "mutImpactResult",
        result,
        data.mutImpactResult,
        onFieldChange
      )
    }
  }, [
    data.biomassCalorificValue,
    data.mutImpactFactor,
    data.mutAllocationPercent,
    data.mutImpactResult,
    onFieldChange,
  ])

  // ============================================================================
  // 6. IMPACTO DA PRODUÇÃO DE BIOMASSA
  // ============================================================================
  useEffect(() => {
    // Verificar se temos os valores mínimos necessários
    if (!data.biomassCalorificValue || !data.biomassImpactFactor) {
      return
    }

    let impactResult: string | undefined

    // Verificar se tem informação específica (campo preenchido)
    const hasSpecificInfo = !isEmpty(data.biomassInputSpecific)

    if (hasSpecificInfo) {
      // TEM info específica: (entrada_específica × poder_calorífico × fator_impacto) + impacto_milho
      const baseImpact = multiplyMultipleDecimals(
        data.biomassInputSpecific,
        data.biomassCalorificValue,
        data.biomassImpactFactor
      )
      if (!baseImpact) return

      impactResult = data.cornStarchImpact
        ? addDecimals(baseImpact, data.cornStarchImpact)
        : baseImpact
    } else {
      // NÃO tem info específica (usa padrão): (poder_calorífico × fator_impacto) + impacto_milho
      const baseImpact = multiplyDecimals(
        data.biomassCalorificValue,
        data.biomassImpactFactor
      )
      if (!baseImpact) return

      impactResult = data.cornStarchImpact
        ? addDecimals(baseImpact, data.cornStarchImpact)
        : baseImpact
    }

    if (impactResult) {
      updateFieldIfChanged(
        "biomassProductionImpact",
        impactResult,
        data.biomassProductionImpact,
        onFieldChange
      )
    }
  }, [
    data.biomassInputSpecific,
    data.biomassCalorificValue,
    data.biomassImpactFactor,
    data.cornStarchImpact,
    data.biomassProductionImpact,
    onFieldChange,
  ])

  // ============================================================================
  // 7. QUANTIDADE MÉDIA DE BIOMASSA TRANSPORTADA POR VEÍCULO
  // ============================================================================
  useAutofillEffect(
    data.biomassType,
    async () => {
      if (!data.biomassType) {
        return
      }

      // Buscar o valor na tabela B7:C12 (coluna C = índice 1)
      const biomassValueRaw = await vlookup(
        "Dados auxiliares",
        "B7:C12",
        data.biomassType,
        0, // Procurar na coluna B
        1 // Retornar coluna C (2ª coluna, índice 1)
      )

      if (biomassValueRaw) {
        // Dividir por 1.000.000 conforme a fórmula
        const numValue = parseFloat(biomassValueRaw.replace(",", "."))
        if (!isNaN(numValue)) {
          const result = formatSmartDecimal(numValue / 1000000)
          updateFieldIfChanged(
            "averageBiomassPerVehicleTon",
            result,
            data.averageBiomassPerVehicleTon,
            onFieldChange
          )
        }
      } else {
        // Se não encontrou valor, limpar
        if (data.averageBiomassPerVehicleTon !== "") {
          onFieldChange("averageBiomassPerVehicleTon", "")
        }
      }
    },
    [data.averageBiomassPerVehicleTon, onFieldChange]
  )

  // ============================================================================
  // 8. DEMANDA DE TRANSPORTE
  // ============================================================================
  useEffect(() => {
    // Verificar se temos os dois valores necessários
    if (!data.transportDistanceKm || !data.averageBiomassPerVehicleTon) {
      if (data.transportDemandTkm !== "") {
        onFieldChange("transportDemandTkm", "")
      }
      return
    }

    // Calcular: distância × quantidade média
    const result = multiplyDecimals(
      data.transportDistanceKm,
      data.averageBiomassPerVehicleTon
    )

    if (result) {
      updateFieldIfChanged(
        "transportDemandTkm",
        result,
        data.transportDemandTkm,
        onFieldChange
      )
    }
  }, [
    data.transportDistanceKm,
    data.averageBiomassPerVehicleTon,
    data.transportDemandTkm,
    onFieldChange,
  ])

  // ============================================================================
  // 9. IMPACTO DO TRANSPORTE DA BIOMASSA
  // ============================================================================
  useEffect(() => {
    async function calculateTransportImpact() {
      // Verificar se temos demanda de transporte e tipo de veículo
      if (!data.transportDemandTkm || !data.transportVehicleType) {
        if (data.transportImpactResult !== "") {
          onFieldChange("transportImpactResult", "")
        }
        return
      }

      // Buscar fator de impacto do veículo na tabela B70:F76 (coluna D = índice 2)
      const vehicleFactorRaw = await vlookup(
        "Dados auxiliares",
        "B70:F76",
        data.transportVehicleType,
        0, // Procurar na coluna B
        2 // Retornar coluna D (3ª coluna, índice 2)
      )

      if (!vehicleFactorRaw) {
        if (data.transportImpactResult !== "") {
          onFieldChange("transportImpactResult", "")
        }
        return
      }

      // Calcular: demanda × fator do veículo
      const result = multiplyDecimals(data.transportDemandTkm, vehicleFactorRaw)

      if (result) {
        updateFieldIfChanged(
          "transportImpactResult",
          result,
          data.transportImpactResult,
          onFieldChange
        )
      }
    }

    calculateTransportImpact()
  }, [
    data.transportDemandTkm,
    data.transportVehicleType,
    data.transportImpactResult,
    onFieldChange,
  ])
}
