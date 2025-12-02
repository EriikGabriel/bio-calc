import type {
  AgriculturalPhaseFieldErrors,
  AgriculturalPhaseFormData,
} from "@components/sections/agricultural-phase-section"

export function validateAgriculturalPhase(
  form: AgriculturalPhaseFormData
): AgriculturalPhaseFieldErrors {
  const errors: AgriculturalPhaseFieldErrors = {}
  if (!form.biomassType) errors.biomassType = "Selecione o tipo de biomassa"
  if (!form.hasConsumptionInfo)
    errors.hasConsumptionInfo = "Informe se possui o dado específico"

  if (form.hasConsumptionInfo === "yes" && !form.biomassInputSpecific)
    errors.biomassInputSpecific =
      "Informe a entrada específica ou selecione Não"

  return errors
}
