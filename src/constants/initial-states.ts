import type { DistributionPhaseFormData } from "@/components/sections/distribution-phase-section"
import type { AgriculturalPhaseFormData } from "@components/sections/agricultural-phase-section"
import type { CompanyFormData } from "@components/sections/company-info-section"
import type { IndustrialPhaseFormData } from "@components/sections/industrial-phase-section"

export const COMPANY_INFO_INITIAL: CompanyFormData = {
  companyName: "",
  taxId: "",
  state: "",
  city: "",
  contactPerson: "",
  phone: "",
  email: "",
}

export const AGRICULTURAL_PHASE_INITIAL: AgriculturalPhaseFormData = {
  biomassType: "",
  biomassInputSpecific: "",
  biomassImpactFactor: "",
  biomassCalorificValue: "",
  cornStarchInput: "",
  cornStarchImpact: "",
  biomassProductionImpact: "",
  biomassProductionState: "",
  cultivationType: "",
  woodResidueLifecycleStage: "",
  mutImpactFactor: "",
  mutAllocationPercent: "",
  mutImpactResult: "",
  transportDistanceKm: "",
  transportVehicleType: "",
  averageBiomassPerVehicleTon: "",
  transportDemandTkm: "",
  transportImpactResult: "",
}

export const INDUSTRIAL_PHASE_INITIAL = {
  processedBiomassKgPerYear: "",
  biomassConsumedInCogenerationKgPerYear: "",
  // Energia - iniciar com "0" (campos obrigatórios)
  gridMixMediumVoltage: "0",
  gridMixHighVoltage: "0",
  electricityPCH: "0",
  electricityBiomass: "0",
  electricityDiesel: "0",
  electricitySolar: "0",
  electricityImpactFactorKgCO2PerKWh: "",
  electricityImpactResultKgCO2PerMJ: "",
  // Combustíveis - iniciar com "0" (campos obrigatórios)
  fuelDieselLitersPerYear: "0",
  fuelNaturalGasNm3PerYear: "0",
  fuelLPGKgPerYear: "0",
  fuelGasolineALitersPerYear: "0",
  fuelEthanolAnhydrousLitersPerYear: "0",
  fuelEthanolHydratedLitersPerYear: "0",
  fuelWoodChipsKgPerYear: "0",
  fuelFirewoodKgPerYear: "0",
  fuelProductionImpactKgCO2PerYear: "",
  fuelStationaryCombustionImpactKgCO2PerYear: "",
  fuelConsumptionImpactKgCO2PerMJ: "",
  biomassCombustionEmissionFactorKgCO2PerKg: "",
  biomassCombustionImpactKgCO2PerYear: "",
  biomassCombustionImpactKgCO2PerMJ: "",
  // Insumos - iniciar com "0" (campos obrigatórios)
  waterLitersPerYear: "0",
  lubricantOilKgPerYear: "0",
  silicaSandKgPerYear: "0",
  manufacturingImpactKgCO2eqPerYear: "",
  manufacturingImpactKgCO2eqPerMJ: "",
} satisfies IndustrialPhaseFormData

export const DISTRIBUTION_PHASE_INITIAL = {
  domesticBiomassQuantityTon: "",
  domesticTransportDistanceKm: "",
  domesticRailPercent: "0",
  domesticWaterwayPercent: "0",
  domesticRoadPercent: "100",
  domesticRoadVehicleType: "",
  domesticDistributionImpactKgCO2EqPerYear: "",
  domesticMjTransportedPerYear: "",
  domesticImpactKgCO2EqPerMjTransported: "",
  // Export
  exportBiomassQuantityTon: "",
  exportDistanceFactoryToNearestHydroPortKm: "",
  exportRailPercentToPort: "0",
  exportWaterwayPercentToPort: "0",
  exportRoadPercentToPort: "0",
  exportRoadVehicleTypeToPort: "",
  exportDistancePortToForeignMarketKm: "",
  exportDistributionImpactFactoryToPortKgCO2EqPerYear: "",
  exportDistributionImpactPortToMarketKgCO2EqPerYear: "",
  exportMjTransportedPerYear: "",
  exportImpactKgCO2EqPerMjTransported: "",
} satisfies DistributionPhaseFormData
