import type { DistributionPhaseFormData } from "@/components/sections/distribution-phase-section"
import type { FieldErrors } from "@/types/forms"

export function validateDistributionPhase(
  data: DistributionPhaseFormData
): FieldErrors {
  const errors: FieldErrors = {}

  const add = (key: keyof DistributionPhaseFormData, msg: string) => {
    errors[key] = msg
  }

  // Required base fields
  const qty = Number.parseFloat(data.domesticBiomassQuantityTon || "")
  if (!Number.isFinite(qty) || qty <= 0)
    add("domesticBiomassQuantityTon", "Informe a quantidade em tonelada.")
  const dist = Number.parseFloat(data.domesticTransportDistanceKm || "")
  if (!Number.isFinite(dist) || dist <= 0)
    add("domesticTransportDistanceKm", "Informe a distância em km.")

  // Percentages constraints
  const rail = Number.parseFloat(data.domesticRailPercent || "0") || 0
  const water = Number.parseFloat(data.domesticWaterwayPercent || "0") || 0
  const road = Number.parseFloat(data.domesticRoadPercent || "0") || 0
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
  if (road > 0 && !data.domesticRoadVehicleType) {
    add("domesticRoadVehicleType", "Selecione o tipo de veículo.")
  }

  // Validate computed/output fields if present (must be numeric and >= 0)
  const impactYear = Number.parseFloat(
    data.domesticDistributionImpactKgCO2EqPerYear || ""
  )
  if (data.domesticDistributionImpactKgCO2EqPerYear !== "") {
    if (!Number.isFinite(impactYear) || impactYear < 0) {
      add(
        "domesticDistributionImpactKgCO2EqPerYear",
        "Impacto anual deve ser um número válido e ≥ 0."
      )
    }
  }

  // ===== Export section validations =====
  const exportQty = Number.parseFloat(data.exportBiomassQuantityTon || "")
  if (!Number.isFinite(exportQty) || exportQty <= 0) {
    add("exportBiomassQuantityTon", "Informe a quantidade exportada (ton).")
  }

  const exportDistFactoryToPort = Number.parseFloat(
    data.exportDistanceFactoryToNearestHydroPortKm || ""
  )
  if (
    !Number.isFinite(exportDistFactoryToPort) ||
    exportDistFactoryToPort <= 0
  ) {
    add(
      "exportDistanceFactoryToNearestHydroPortKm",
      "Informe a distância até o porto hidroviário (km)."
    )
  }

  const exportRail = Number.parseFloat(data.exportRailPercentToPort || "0") || 0
  const exportWater =
    Number.parseFloat(data.exportWaterwayPercentToPort || "0") || 0
  const exportRoad = Number.parseFloat(data.exportRoadPercentToPort || "0") || 0
  const exportPerc = [exportRail, exportWater, exportRoad]
  exportPerc.forEach((p, idx) => {
    if (!Number.isFinite(p) || p < 0 || p > 100) {
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
  const exportSum = exportPerc.reduce(
    (a, b) => a + (Number.isFinite(b) ? b : 0),
    0
  )
  if (Math.abs(exportSum - 100) > 1e-6) {
    add(
      "exportRoadPercentToPort",
      "A soma dos percentuais deve ser igual a 100%."
    )
  }

  if (exportRoad > 0 && !data.exportRoadVehicleTypeToPort) {
    add(
      "exportRoadVehicleTypeToPort",
      "Selecione o tipo de veículo (até o porto)."
    )
  }

  const exportDistPortToMarket = Number.parseFloat(
    data.exportDistancePortToForeignMarketKm || ""
  )
  if (!Number.isFinite(exportDistPortToMarket) || exportDistPortToMarket <= 0) {
    add(
      "exportDistancePortToForeignMarketKm",
      "Informe a distância do porto ao mercado consumidor final (km)."
    )
  }

  // Outputs for export must be numeric and ≥ 0 when present
  const expImpactFactoryToPort = Number.parseFloat(
    data.exportDistributionImpactFactoryToPortKgCO2EqPerYear || ""
  )
  if (data.exportDistributionImpactFactoryToPortKgCO2EqPerYear !== "") {
    if (
      !Number.isFinite(expImpactFactoryToPort) ||
      expImpactFactoryToPort < 0
    ) {
      add(
        "exportDistributionImpactFactoryToPortKgCO2EqPerYear",
        "Impacto anual (fábrica→porto) deve ser válido e ≥ 0."
      )
    }
  }

  const expImpactPortToMarket = Number.parseFloat(
    data.exportDistributionImpactPortToMarketKgCO2EqPerYear || ""
  )
  if (data.exportDistributionImpactPortToMarketKgCO2EqPerYear !== "") {
    if (!Number.isFinite(expImpactPortToMarket) || expImpactPortToMarket < 0) {
      add(
        "exportDistributionImpactPortToMarketKgCO2EqPerYear",
        "Impacto anual (porto→mercado) deve ser válido e ≥ 0."
      )
    }
  }

  const expMj = Number.parseFloat(data.exportMjTransportedPerYear || "")
  if (data.exportMjTransportedPerYear !== "") {
    if (!Number.isFinite(expMj) || expMj < 0) {
      add(
        "exportMjTransportedPerYear",
        "MJ/ano exportado deve ser válido e ≥ 0."
      )
    }
  }

  const expImpactPerMj = Number.parseFloat(
    data.exportImpactKgCO2EqPerMjTransported || ""
  )
  if (data.exportImpactKgCO2EqPerMjTransported !== "") {
    if (!Number.isFinite(expImpactPerMj) || expImpactPerMj < 0) {
      add(
        "exportImpactKgCO2EqPerMjTransported",
        "Impacto da exportação por MJ deve ser válido e ≥ 0."
      )
    }
  }

  const mjPerYear = Number.parseFloat(data.domesticMjTransportedPerYear || "")
  if (data.domesticMjTransportedPerYear !== "") {
    if (!Number.isFinite(mjPerYear) || mjPerYear < 0) {
      add(
        "domesticMjTransportedPerYear",
        "MJ/ano deve ser um número válido e ≥ 0."
      )
    }
  }

  const impactPerMj = Number.parseFloat(
    data.domesticImpactKgCO2EqPerMjTransported || ""
  )
  if (data.domesticImpactKgCO2EqPerMjTransported !== "") {
    if (!Number.isFinite(impactPerMj) || impactPerMj < 0) {
      add(
        "domesticImpactKgCO2EqPerMjTransported",
        "Impacto por MJ deve ser um número válido e ≥ 0."
      )
    }
  }

  return errors
}
