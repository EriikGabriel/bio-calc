import type {
  AgriculturalPhaseFieldErrors,
  AgriculturalPhaseFormData,
} from "@components/sections/agricultural-phase-section"
import { isEmpty } from "./common"

export function validateAgriculturalPhase(
  form: AgriculturalPhaseFormData
): AgriculturalPhaseFieldErrors {
  const errors: AgriculturalPhaseFieldErrors = {}

  // Campos obrigatórios básicos
  if (isEmpty(form.biomassType)) {
    errors.biomassType = "Selecione o tipo de biomassa"
  }

  if (isEmpty(form.hasConsumptionInfo)) {
    errors.hasConsumptionInfo = "Informe se possui o dado específico"
  }

  if (form.hasConsumptionInfo === "yes" && isEmpty(form.biomassInputSpecific)) {
    errors.biomassInputSpecific =
      "Informe a entrada específica ou selecione Não"
  }

  // Entrada de amido de milho é obrigatória
  if (isEmpty(form.cornStarchInput)) {
    errors.cornStarchInput = "Informe a entrada de amido de milho"
  }

  // Estado da produção da biomassa é obrigatório
  if (isEmpty(form.biomassProductionState)) {
    errors.biomassProductionState = "Selecione o estado da produção"
  }

  // Etapa do ciclo de vida da madeira (se aplicável ao tipo de biomassa)
  if (isEmpty(form.woodResidueLifecycleStage)) {
    errors.woodResidueLifecycleStage =
      "Selecione a etapa do ciclo de vida da madeira"
  }

  // Percentual de alocação é obrigatório
  if (isEmpty(form.mutAllocationPercent)) {
    errors.mutAllocationPercent = "Informe o percentual de alocação da biomassa"
  }

  // Distância de transporte é obrigatória
  if (isEmpty(form.transportDistanceKm)) {
    errors.transportDistanceKm = "Informe a distância de transporte da biomassa"
  }

  // Tipo de veículo é obrigatório
  if (isEmpty(form.transportVehicleType)) {
    errors.transportVehicleType = "Selecione o tipo de veículo usado"
  }

  return errors
}
