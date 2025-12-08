import type { AgriculturalPhaseFormData } from "@/components/sections/agricultural-phase-section"
import type { DistributionPhaseFormData } from "@/components/sections/distribution-phase-section"
import type { IndustrialPhaseFormData } from "@/components/sections/industrial-phase-section"
import type { CalculateRequest } from "@/types/api"

/** Compose full CalculateRequest payload from all section form states. */
export function buildFullPayload(
  agricultural: AgriculturalPhaseFormData,
  industrial: IndustrialPhaseFormData,
  distribution: DistributionPhaseFormData
): CalculateRequest {
  const payload: CalculateRequest = {
    agricultural: {
      biomassType: agricultural.biomassType,
      hasConsumptionInfo: agricultural.hasConsumptionInfo || "",
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
    },
    industrial: {
      hasCogeneration:
        industrial.hasCogeneration === "Sim"
          ? "yes"
          : industrial.hasCogeneration === "Não"
          ? "no"
          : "",
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
    },
    distribution: {
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
    },
  }
  return payload
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
    payload.agricultural = {
      biomassType: agricultural.biomassType,
      hasConsumptionInfo: agricultural.hasConsumptionInfo || "",
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
  if (index >= 2) {
    payload.industrial = {
      hasCogeneration:
        industrial.hasCogeneration === "Sim"
          ? "yes"
          : industrial.hasCogeneration === "Não"
          ? "no"
          : "",
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
  if (index >= 3) {
    payload.distribution = {
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
  return payload
}
