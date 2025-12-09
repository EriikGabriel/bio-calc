// Shared API types for request/response between backend route and frontend fetch

export type AgriculturalInput = {
  biomassType?: string
  biomassInputSpecific?: string
  biomassImpactFactor?: string
  biomassCalorificValue?: string
  cornStarchInput?: string
  cornStarchImpact?: string
  biomassProductionImpact?: string
  biomassProductionState?: string
  cultivationType?: string
  woodResidueLifecycleStage?: string
  mutImpactFactor?: string
  mutAllocationPercent?: string
  mutImpactResult?: string
  transportDistanceKm?: string
  transportVehicleType?: string
  averageBiomassPerVehicleTon?: string
  transportDemandTkm?: string
  transportImpactResult?: string
}

export type IndustrialInput = {
  hasCogeneration?: "yes" | "no" | ""
  processedBiomassKgPerYear?: string
  biomassConsumedInCogenerationKgPerYear?: string
  gridMixMediumVoltage?: string
  gridMixHighVoltage?: string
  electricityPCH?: string
  electricityBiomass?: string
  electricityDiesel?: string
  electricitySolar?: string
  electricityImpactFactorKgCO2PerKWh?: string
  fuelDieselLitersPerYear?: string
  fuelNaturalGasNm3PerYear?: string
  fuelLPGKgPerYear?: string
  fuelGasolineALitersPerYear?: string
  fuelEthanolAnhydrousLitersPerYear?: string
  fuelEthanolHydratedLitersPerYear?: string
  fuelWoodChipsKgPerYear?: string
  fuelFirewoodKgPerYear?: string
  biomassCombustionEmissionFactorKgCO2PerKg?: string
  waterLitersPerYear?: string
  lubricantOilKgPerYear?: string
  silicaSandKgPerYear?: string
}

export type DistributionInput = {
  domesticBiomassQuantityTon?: string
  domesticTransportDistanceKm?: string
  domesticRailPercent?: string
  domesticWaterwayPercent?: string
  domesticRoadPercent?: string
  domesticRoadVehicleType?: string
  exportBiomassQuantityTon?: string
  exportDistanceFactoryToNearestHydroPortKm?: string
  exportRailPercentToPort?: string
  exportWaterwayPercentToPort?: string
  exportRoadPercentToPort?: string
  exportRoadVehicleTypeToPort?: string
  exportDistancePortToForeignMarketKm?: string
}

export type CalculateRequest = {
  agricultural?: AgriculturalInput
  industrial?: IndustrialInput
  distribution?: DistributionInput
}

// Response shapes (align with route’s current output)
export type AgriculturalComputed = {
  biomassImpactPerMJ: number
  cornStarchImpactPerMJ: number
  mutImpactPerMJ: number
  transportDemandTkm: number
  transportImpactPerMJ: number
  totalImpactPerMJ: number
  assumptions: {
    calorificMJPerKg: number
  }
}

export type IndustrialComputed = {
  electricityImpactYear: number
  fuelImpactYear: number
  manufacturingImpactYear: number
  totalImpactYear: number
  impactPerMJ: number
}

export type DistributionComputed = {
  domesticImpactYear: number
  exportImpactFactoryToPortYear: number
  exportImpactPortToMarketYear: number
  totalImpactYear: number
}

export type SheetSummary =
  | {
      intensity?: number | string | null
      intensityFormatted?: string | null
      contributions?: {
        agricultural?: number | string | null
        industrial?: number | string | null
        transport?: number | string | null
        mut?: number | string | null
      }
    }
  | {
      warning?: string
      availableSheets?: string[]
    }
  | {
      error?: string
      pathTried?: string
    }

export type CalculateResponse = {
  ok: boolean
  sheet?: SheetSummary | null
  computed?: {
    agricultural?: AgriculturalComputed
    industrial?: IndustrialComputed
    distribution?: DistributionComputed
  }
  error?: string
  details?: string
}
