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
  biomassForCogenerationKgPerYear?: string
  gridMixMediumVoltage?: string
  gridMixHighVoltage?: string
  electricityPCH?: string
  electricityBiomass?: string
  electricityWind?: string
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
  manufacturingImpactKgCO2eqPerMJ?: string
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
  domesticDistributionImpactKgCO2EqPerYear?: string
  exportImpactKgCO2EqPerMjTransported?: string
}

export type CalculateRequest = {
  agricultural?: AgriculturalInput
  industrial?: IndustrialInput
  distribution?: DistributionInput
}

// Response shapes (align with route's current output)
export type AgriculturalComputed = {
  // Totais (células em azul escuro)
  totalImpactPerMJ: number
  biomassProductionImpact: number // E40
  mutImpact: number // E47
  biomassTransportImpact: number // E53

  // Cálculos intermediários (células em azul claro)
  biomassImpactFactor?: number | string // E36
  biomassCalorificValue?: number // E37
  cornStarchImpact?: number // E39
  biomassSpecific?: number
  mutFactorPerKg?: number
  mutAllocationPercent?: number | string

  // Campos de entrada relevantes
  biomassType?: string
  hasBiomassInfo?: boolean | string
  biomassInputSpecific?: number | string
  biomassProductionState?: string
  cultivationType?: string
  woodResidueLifecycleStage?: string
  transportDistanceKm?: number | string
  transportVehicleType?: string
  averageBiomassPerVehicleTon?: number | string

  // Para cálculos posteriores
  assumptions?: {
    calorificMJPerKg: number
  }
}

export type IndustrialComputed = {
  // Totais
  impactPerMJ: number
  totalImpactYear: number

  // Detalhes por categoria
  electricityImpactYear: number // E68
  fuelImpactYear: number // E79 + E80
  manufacturingImpactYear: number // E90

  // Detalhes por combustível
  fuelImpacts?: {
    diesel: number
    naturalGas: number
    lpg: number
    gasoline: number
    ethanol: number
    wood: number
  }

  // Campos de entrada
  hasCogeneration?: boolean | string
  processedBiomassKgPerYear?: number | string
  biomassForCogenerationKgPerYear?: number | string

  // Para cálculos posteriores
  processedBiomassKg?: number
  biomassMJ?: number
}

export type DistributionComputed = {
  // Totais
  totalImpactYear: number

  // Detalhes por segmento
  domesticImpactYear: number // E102
  exportImpactFactoryToPortYear: number // E114
  exportImpactPortToMarketYear: number // E115

  // Campos de entrada
  domesticBiomassQuantityTon?: number | string
  domesticTransportDistanceKm?: number | string
  domesticRoadPercent?: number | string
  domesticRailPercent?: number | string
  domesticWaterwayPercent?: number | string
  exportBiomassQuantityTon?: number | string
  exportDistanceFactoryToNearestHydroPortKm?: number | string
  exportDistancePortToForeignMarketKm?: number | string

  // Para cálculos posteriores
  domesticTkm?: number
  exportFactoryToPortTkm?: number
  exportPortToMarketTkm?: number
}

// Resultados principais da calculadora
export type CalculationResults = {
  carbonIntensity: {
    total: number // C21 = SUM(C23:C26)
    agricultural: number // C23
    industrial: number // C24
    distribution: number // C25
    use: number // C26
  }
  energyEfficiencyNote: number // C27
  emissionReduction: number // C28

  cBioGeneration: {
    fossilSubstitute: number // J20
    eligibleProductionVolumeTon: number // H21
    eligibleCBIOS: number // H23
    marketValuePerCBIO: number // H26
    approximateRevenue: number // H27
  }

  phaseDetails: {
    agricultural?: {
      biomassImpactFactor?: number | string // E36
      biomassCalorificValue?: number // E37
      cornStarchImpact?: number // E39
      biomassProductionImpact: number // E40
      mutImpact: number // E47
      biomassTransportImpact: number // E53
    }
    industrial?: {
      electricityImpact: number // E68
      electricityImpactPerMJ: number // E69
      fuelProductionImpact: number // E79
      fuelCombustionImpact: number // E80
      fuelTotalImpactPerMJ: number // E81
      cogenerationImpact: number // E84, E85
      manufacturingInputsImpact: number // E90
      manufacturingImpactPerMJ: number // E91
    }
    distribution?: {
      domesticImpactYear: number // E102
      domesticImpactPerMJ: number // E104
      exportImpactFactoryToPort: number // E114
      exportImpactPortToMarket: number // E115
      exportTotalImpactPerMJ: number // E117
    }
  }

  inputs: {
    biomassType?: string
    biomassProductionState?: string
    processedBiomassKgPerYear?: number | string
    hasCogeneration?: boolean | string
    transportDistanceKm?: number | string
    domesticMarketDistance?: number | string
    exportDistance?: number | string
  }
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
  results?: CalculationResults
  error?: string
  details?: string
}
