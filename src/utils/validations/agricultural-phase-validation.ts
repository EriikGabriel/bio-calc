import type {
  AgriculturalPhaseFieldErrors,
  AgriculturalPhaseFormData,
} from "@components/sections/agricultural-phase-section"
import { isEmpty } from "./common"

export function validateAgriculturalPhase(
  form: AgriculturalPhaseFormData
): AgriculturalPhaseFieldErrors {
  const errors: AgriculturalPhaseFieldErrors = {}

  // Debug: ver os valores do formulário
  console.debug("Validando formulário agrícola:", form)

  // Campos obrigatórios básicos
  if (isEmpty(form.biomassType)) {
    errors.biomassType = "Selecione o tipo de biomassa"
    // Se biomassa não foi selecionada, exigir seleção da etapa também
    if (
      isEmpty(form.woodResidueLifecycleStage) ||
      form.woodResidueLifecycleStage === "Não aplica"
    ) {
      errors.woodResidueLifecycleStage =
        "Selecione a etapa do ciclo de vida da madeira"
    }
  }

  // Entrada de amido de milho é obrigatória
  if (isEmpty(form.cornStarchInput)) {
    errors.cornStarchInput = "Informe a entrada de amido de milho"
  }

  // Estado da produção da biomassa é obrigatório
  if (isEmpty(form.biomassProductionState)) {
    errors.biomassProductionState = "Selecione o estado da produção"
  }

  // Etapa do ciclo de vida da madeira (obrigatório apenas para resíduos de madeira)
  const isWoodResidue = /^Resíduo de (Pinus|Eucaliptus)$/i.test(
    form.biomassType
  )

  if (isWoodResidue) {
    // Para resíduos de madeira, deve ter uma etapa selecionada (não pode ser vazio ou "Não aplica")
    if (
      isEmpty(form.woodResidueLifecycleStage) ||
      form.woodResidueLifecycleStage === "Não aplica"
    ) {
      errors.woodResidueLifecycleStage =
        "Selecione a etapa do ciclo de vida da madeira"
    }
  }

  // Distância de transporte é obrigatória
  if (isEmpty(form.transportDistanceKm)) {
    errors.transportDistanceKm = "Informe a distância de transporte da biomassa"
  }

  // Tipo de veículo é obrigatório
  if (isEmpty(form.transportVehicleType)) {
    errors.transportVehicleType = "Selecione o tipo de veículo usado"
  }

  // Debug: mostrar erros encontrados
  console.debug("Erros de validação:", errors)

  return errors
}
