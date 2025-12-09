import type { AgriculturalPhaseFormData } from "@/components/sections/agricultural-phase-section"
import type { DistributionPhaseFormData } from "@/components/sections/distribution-phase-section"
import type { IndustrialPhaseFormData } from "@/components/sections/industrial-phase-section"
import type {
  AgriculturalInput,
  CalculateRequest,
  DistributionInput,
  IndustrialInput,
} from "@/types/api"

/** Build agricultural phase payload */
function buildAgriculturalPayload(
  agricultural: AgriculturalPhaseFormData
): AgriculturalInput {
  return {
    biomassType: agricultural.biomassType,
    biomassInputSpecific: agricultural.biomassInputSpecific,
    biomassImpactFactor: agricultural.biomassImpactFactor,
    biomassCalorificValue: agricultural.biomassCalorificValue,
    cornStarchInput: agricultural.cornStarchInput,
    cornStarchImpact: agricultural.cornStarchImpact,
    biomassProductionImpact: agricultural.biomassProductionImpact,
    biomassProductionState: agricultural.biomassProductionState,
    cultivationType: agricultural.cultivationType,
    woodResidueLifecycleStage: agricultural.woodResidueLifecycleStage,
    mutImpactFactor: agricultural.mutImpactFactor,
    mutAllocationPercent: agricultural.mutAllocationPercent,
    mutImpactResult: agricultural.mutImpactResult,
    transportDistanceKm: agricultural.transportDistanceKm,
    transportVehicleType: agricultural.transportVehicleType,
    averageBiomassPerVehicleTon: agricultural.averageBiomassPerVehicleTon,
    transportDemandTkm: agricultural.transportDemandTkm,
    transportImpactResult: agricultural.transportImpactResult,
  }
}

/** Build industrial phase payload */
function buildIndustrialPayload(
  industrial: IndustrialPhaseFormData
): IndustrialInput {
  // Inferir co-geração: se o campo biomassConsumedInCogenerationKgPerYear estiver preenchido e > 0, então há co-geração
  const hasCogenerationValue =
    industrial.biomassConsumedInCogenerationKgPerYear &&
    parseFloat(
      industrial.biomassConsumedInCogenerationKgPerYear.replace(",", ".")
    ) > 0
      ? "yes"
      : "no"

  return {
    hasCogeneration: hasCogenerationValue,
    processedBiomassKgPerYear: industrial.processedBiomassKgPerYear,
    biomassConsumedInCogenerationKgPerYear:
      industrial.biomassConsumedInCogenerationKgPerYear,
    gridMixMediumVoltage: industrial.gridMixMediumVoltage,
    gridMixHighVoltage: industrial.gridMixHighVoltage,
    electricityPCH: industrial.electricityPCH,
    electricityBiomass: industrial.electricityBiomass,
    electricityDiesel: industrial.electricityDiesel,
    electricitySolar: industrial.electricitySolar,
    electricityImpactFactorKgCO2PerKWh:
      industrial.electricityImpactFactorKgCO2PerKWh,
    fuelDieselLitersPerYear: industrial.fuelDieselLitersPerYear,
    fuelNaturalGasNm3PerYear: industrial.fuelNaturalGasNm3PerYear,
    fuelLPGKgPerYear: industrial.fuelLPGKgPerYear,
    fuelGasolineALitersPerYear: industrial.fuelGasolineALitersPerYear,
    fuelEthanolAnhydrousLitersPerYear:
      industrial.fuelEthanolAnhydrousLitersPerYear,
    fuelEthanolHydratedLitersPerYear:
      industrial.fuelEthanolHydratedLitersPerYear,
    fuelWoodChipsKgPerYear: industrial.fuelWoodChipsKgPerYear,
    fuelFirewoodKgPerYear: industrial.fuelFirewoodKgPerYear,
    biomassCombustionEmissionFactorKgCO2PerKg:
      industrial.biomassCombustionEmissionFactorKgCO2PerKg,
    waterLitersPerYear: industrial.waterLitersPerYear,
    lubricantOilKgPerYear: industrial.lubricantOilKgPerYear,
    silicaSandKgPerYear: industrial.silicaSandKgPerYear,
  }
}

/** Build distribution phase payload */
function buildDistributionPayload(
  distribution: DistributionPhaseFormData
): DistributionInput {
  return {
    domesticBiomassQuantityTon: distribution.domesticBiomassQuantityTon,
    domesticTransportDistanceKm: distribution.domesticTransportDistanceKm,
    domesticRailPercent: distribution.domesticRailPercent,
    domesticWaterwayPercent: distribution.domesticWaterwayPercent,
    domesticRoadPercent: distribution.domesticRoadPercent,
    domesticRoadVehicleType: distribution.domesticRoadVehicleType,
    exportBiomassQuantityTon: distribution.exportBiomassQuantityTon,
    exportDistanceFactoryToNearestHydroPortKm:
      distribution.exportDistanceFactoryToNearestHydroPortKm,
    exportRailPercentToPort: distribution.exportRailPercentToPort,
    exportWaterwayPercentToPort: distribution.exportWaterwayPercentToPort,
    exportRoadPercentToPort: distribution.exportRoadPercentToPort,
    exportRoadVehicleTypeToPort: distribution.exportRoadVehicleTypeToPort,
    exportDistancePortToForeignMarketKm:
      distribution.exportDistancePortToForeignMarketKm,
  }
}

/** Compose full CalculateRequest payload from all section form states. */
export function buildFullPayload(
  agricultural: AgriculturalPhaseFormData,
  industrial: IndustrialPhaseFormData,
  distribution: DistributionPhaseFormData
): CalculateRequest {
  return {
    agricultural: buildAgriculturalPayload(agricultural),
    industrial: buildIndustrialPayload(industrial),
    distribution: buildDistributionPayload(distribution),
  }
}

/** Compose CalculateRequest payload up to a given step index (inclusive). */
export function buildPayloadForStep(
  index: number,
  agricultural: AgriculturalPhaseFormData,
  industrial: IndustrialPhaseFormData,
  distribution: DistributionPhaseFormData
): CalculateRequest {
  const payload: CalculateRequest = {}

  if (index >= 1) {
    payload.agricultural = buildAgriculturalPayload(agricultural)
  }

  if (index >= 2) {
    payload.industrial = buildIndustrialPayload(industrial)
  }

  if (index >= 3) {
    payload.distribution = buildDistributionPayload(distribution)
  }

  return payload
}
