import type { DistributionPhaseFormData } from "@/components/sections/distribution-phase-section"
import type { FieldErrors } from "@/types/forms"
import { toNumber } from "@/utils/number"
import { isEmpty } from "./common"

export function validateDistributionPhase(
  data: DistributionPhaseFormData
): FieldErrors {
  const errors: FieldErrors = {}

  // Debug: ver os valores do formulário
  console.debug("Validando formulário de distribuição:", data)

  const add = (key: keyof DistributionPhaseFormData, msg: string) => {
    errors[key] = msg
  }

  // Required base fields
  const qty = toNumber(data.domesticBiomassQuantityTon)
  if (qty <= 0) {
    add("domesticBiomassQuantityTon", "Informe a quantidade em tonelada.")
  }

  const dist = toNumber(data.domesticTransportDistanceKm)
  if (dist <= 0) {
    add("domesticTransportDistanceKm", "Informe a distância em km.")
  }

  // Percentuais domésticos (ferroviário e hidroviário são obrigatórios)
  if (isEmpty(data.domesticRailPercent)) {
    add("domesticRailPercent", "Informe o percentual ferroviário.")
  }
  if (isEmpty(data.domesticWaterwayPercent)) {
    add("domesticWaterwayPercent", "Informe o percentual hidroviário.")
  }

  // Percentages constraints
  const rail = toNumber(data.domesticRailPercent)
  const water = toNumber(data.domesticWaterwayPercent)
  const road = toNumber(data.domesticRoadPercent)
  const perc = [rail, water, road]
  perc.forEach((p, idx) => {
    if (!Number.isFinite(p) || p < 0 || p > 100)
      add(
        (idx === 0
          ? "domesticRailPercent"
          : idx === 1
          ? "domesticWaterwayPercent"
          : "domesticRoadPercent") as keyof DistributionPhaseFormData,
        "Percentual deve estar entre 0 e 100."
      )
  })
  const sum = perc.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0)
  if (Math.abs(sum - 100) > 1e-6)
    add("domesticRoadPercent", "A soma dos percentuais deve ser igual a 100%.")

  // Vehicle type required if road > 0
  if (road > 0 && isEmpty(data.domesticRoadVehicleType)) {
    add("domesticRoadVehicleType", "Selecione o tipo de veículo.")
  }

  // Validate computed/output fields if present (must be numeric and >= 0)
  if (!isEmpty(data.domesticDistributionImpactKgCO2EqPerYear)) {
    const impactYear = toNumber(data.domesticDistributionImpactKgCO2EqPerYear)
    if (impactYear < 0) {
      add(
        "domesticDistributionImpactKgCO2EqPerYear",
        "Impacto anual deve ser um número válido e ≥ 0."
      )
    }
  }

  // ===== Export section validations =====
  const exportQty = toNumber(data.exportBiomassQuantityTon)
  if (exportQty <= 0) {
    add("exportBiomassQuantityTon", "Informe a quantidade exportada (ton).")
  }

  const exportDistFactoryToPort = toNumber(
    data.exportDistanceFactoryToNearestHydroPortKm
  )
  if (exportDistFactoryToPort <= 0) {
    add(
      "exportDistanceFactoryToNearestHydroPortKm",
      "Informe a distância até o porto hidroviário (km)."
    )
  }

  // Percentuais de exportação até o porto (ferroviário e hidroviário são obrigatórios)
  if (isEmpty(data.exportRailPercentToPort)) {
    add(
      "exportRailPercentToPort",
      "Informe o percentual ferroviário até o porto."
    )
  }
  if (isEmpty(data.exportWaterwayPercentToPort)) {
    add(
      "exportWaterwayPercentToPort",
      "Informe o percentual hidroviário até o porto."
    )
  }

  const exportRail = toNumber(data.exportRailPercentToPort, 0)
  const exportWater = toNumber(data.exportWaterwayPercentToPort, 0)
  const exportRoad = toNumber(data.exportRoadPercentToPort, 0)
  const exportPerc = [exportRail, exportWater, exportRoad]
  exportPerc.forEach((p, idx) => {
    if (p < 0 || p > 100) {
      add(
        (idx === 0
          ? "exportRailPercentToPort"
          : idx === 1
          ? "exportWaterwayPercentToPort"
          : "exportRoadPercentToPort") as keyof DistributionPhaseFormData,
        "Percentual deve estar entre 0 e 100."
      )
    }
  })
  const exportSum = exportPerc.reduce((a, b) => a + b, 0)
  if (Math.abs(exportSum - 100) > 1e-6) {
    add(
      "exportRoadPercentToPort",
      "A soma dos percentuais deve ser igual a 100%."
    )
  }

  if (exportRoad > 0 && isEmpty(data.exportRoadVehicleTypeToPort)) {
    add(
      "exportRoadVehicleTypeToPort",
      "Selecione o tipo de veículo (até o porto)."
    )
  }

  const exportDistPortToMarket = toNumber(
    data.exportDistancePortToForeignMarketKm
  )
  if (exportDistPortToMarket <= 0) {
    add(
      "exportDistancePortToForeignMarketKm",
      "Informe a distância do porto ao mercado consumidor final (km)."
    )
  }

  // Outputs for export must be numeric and ≥ 0 when present
  if (!isEmpty(data.exportDistributionImpactFactoryToPortKgCO2EqPerYear)) {
    const expImpactFactoryToPort = toNumber(
      data.exportDistributionImpactFactoryToPortKgCO2EqPerYear
    )
    if (expImpactFactoryToPort < 0) {
      add(
        "exportDistributionImpactFactoryToPortKgCO2EqPerYear",
        "Impacto anual (fábrica→porto) deve ser válido e ≥ 0."
      )
    }
  }

  if (!isEmpty(data.exportDistributionImpactPortToMarketKgCO2EqPerYear)) {
    const expImpactPortToMarket = toNumber(
      data.exportDistributionImpactPortToMarketKgCO2EqPerYear
    )
    if (expImpactPortToMarket < 0) {
      add(
        "exportDistributionImpactPortToMarketKgCO2EqPerYear",
        "Impacto anual (porto→mercado) deve ser válido e ≥ 0."
      )
    }
  }

  if (!isEmpty(data.exportMjTransportedPerYear)) {
    const expMj = toNumber(data.exportMjTransportedPerYear)
    if (expMj < 0) {
      add(
        "exportMjTransportedPerYear",
        "MJ/ano exportado deve ser válido e ≥ 0."
      )
    }
  }

  if (!isEmpty(data.exportImpactKgCO2EqPerMjTransported)) {
    const expImpactPerMj = toNumber(data.exportImpactKgCO2EqPerMjTransported)
    if (expImpactPerMj < 0) {
      add(
        "exportImpactKgCO2EqPerMjTransported",
        "Impacto da exportação por MJ deve ser válido e ≥ 0."
      )
    }
  }

  if (!isEmpty(data.domesticMjTransportedPerYear)) {
    const mjPerYear = toNumber(data.domesticMjTransportedPerYear)
    if (mjPerYear < 0) {
      add(
        "domesticMjTransportedPerYear",
        "MJ/ano deve ser um número válido e ≥ 0."
      )
    }
  }

  if (!isEmpty(data.domesticImpactKgCO2EqPerMjTransported)) {
    const impactPerMj = toNumber(data.domesticImpactKgCO2EqPerMjTransported)
    if (impactPerMj < 0) {
      add(
        "domesticImpactKgCO2EqPerMjTransported",
        "Impacto por MJ deve ser um número válido e ≥ 0."
      )
    }
  }

  // Debug: mostrar erros encontrados
  console.debug("Erros de validação:", errors)

  return errors
}
