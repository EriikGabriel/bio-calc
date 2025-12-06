import type { FieldErrors } from "@/types/forms"
import type { IndustrialPhaseFormData } from "@components/sections/industrial-phase-section"

function isEmpty(v: string | undefined | null) {
  return !v || v.trim() === ""
}

function isValidNumber(v: string) {
  if (isEmpty(v)) return true // allow empty where optional; use required checks separately
  // Accept dot or comma as decimal separator, allow thousand separators with dot
  const normalized = v.replace(/\./g, "").replace(",", ".")
  return !Number.isNaN(Number(normalized))
}

export function validateIndustrialPhase(
  form: IndustrialPhaseFormData
): FieldErrors {
  const errors: FieldErrors = {}

  // Required select
  if (isEmpty(form.hasCogeneration)) {
    errors.hasCogeneration = "Selecione se existe co-geração"
  }

  // Required numeric: processed biomass
  if (isEmpty(form.processedBiomassKgPerYear)) {
    errors.processedBiomassKgPerYear =
      "Informe a quantidade de biomassa processada"
  } else if (!isValidNumber(form.processedBiomassKgPerYear)) {
    errors.processedBiomassKgPerYear = "Valor numérico inválido"
  }

  // Optional numeric: biomass consumed in cogeneration
  if (
    !isEmpty(form.biomassConsumedInCogenerationKgPerYear) &&
    !isValidNumber(form.biomassConsumedInCogenerationKgPerYear)
  ) {
    errors.biomassConsumedInCogenerationKgPerYear = "Valor numérico inválido"
  }

  // Electricity inputs (optional but must be numeric if provided)
  const electricityFields: Array<keyof IndustrialPhaseFormData> = [
    "gridMixMediumVoltage",
    "gridMixHighVoltage",
    "electricityPCH",
    "electricityBiomass",
    "electricityDiesel",
    "electricitySolar",
  ]
  for (const f of electricityFields) {
    const val = form[f] as string
    if (!isEmpty(val) && !isValidNumber(val)) {
      errors[f] = "Valor numérico inválido"
    }
  }

  // Fuel inputs (optional but must be numeric if provided)
  const fuelFields: Array<keyof IndustrialPhaseFormData> = [
    "fuelDieselLitersPerYear",
    "fuelNaturalGasNm3PerYear",
    "fuelLPGKgPerYear",
    "fuelGasolineALitersPerYear",
    "fuelEthanolAnhydrousLitersPerYear",
    "fuelEthanolHydratedLitersPerYear",
    "fuelWoodChipsKgPerYear",
    "fuelFirewoodKgPerYear",
  ]
  for (const f of fuelFields) {
    const val = form[f] as string
    if (!isEmpty(val) && !isValidNumber(val)) {
      errors[f] = "Valor numérico inválido"
    }
  }

  // Auto-calculated fields should be left disabled; no user validation needed
  // electricityImpactFactorKgCO2PerKWh, electricityImpactResultKgCO2PerMJ

  // Cogeneration: emission factor (optional, numeric if provided)
  if (
    !isEmpty(form.biomassCombustionEmissionFactorKgCO2PerKg) &&
    !isValidNumber(form.biomassCombustionEmissionFactorKgCO2PerKg)
  ) {
    errors.biomassCombustionEmissionFactorKgCO2PerKg = "Valor numérico inválido"
  }

  // Manufacturing inputs: optional numeric
  const manufacturingFields: Array<keyof IndustrialPhaseFormData> = [
    "waterLitersPerYear",
    "lubricantOilKgPerYear",
    "silicaSandKgPerYear",
  ]
  for (const f of manufacturingFields) {
    const val = form[f] as string
    if (!isEmpty(val) && !isValidNumber(val)) {
      errors[f] = "Valor numérico inválido"
    }
  }

  return errors
}
