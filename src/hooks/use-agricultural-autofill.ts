import type { AgriculturalPhaseFormData } from "@/components/sections/agricultural-phase-section"
import { getBiomassData, getSheetCell } from "@/services/calc-api"
import {
  addDecimals,
  extractCellValue,
  multiplyDecimals,
  multiplyMultipleDecimals,
} from "@/utils/spreadsheet"
import { isEmpty } from "lodash"
import { useEffect, useRef } from "react"

// ============================================================================
// UTILITÁRIOS
// ============================================================================

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
  // 1. BIOMASSA: Atualizar fator de impacto e poder calorífico
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
    },
    [data.biomassImpactFactor, data.biomassCalorificValue, onFieldChange]
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
  // 3. IMPACTO DA PRODUÇÃO DE BIOMASSA
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
}
