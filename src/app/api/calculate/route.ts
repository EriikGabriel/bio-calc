import type { CalculateResponse } from "@/types/api"
import { toNumber } from "@/utils/number"
import { NextResponse } from "next/server"
import { join } from "path"

// Import request types from shared API types
import type {
  AgriculturalInput,
  CalculateRequest,
  DistributionInput,
  IndustrialInput,
} from "@/types/api"

// Minimal placeholder factors. TODO: Replace with spreadsheet-derived constants and formulas.
const DEFAULT_BIOMASS_IMPACT_FACTOR = 0.05 // kg CO2e / kg
const DEFAULT_BIOMASS_CALORIFIC_MJ_PER_KG = 16.5 // MJ/kg
const DEFAULT_MUT_IMPACT_FACTOR_PER_KG = 0.02 // kg CO2e/kg
const DEFAULT_TRANSPORT_IMPACT_PER_TKM = 0.08 // kg CO2e per t.km
const DEFAULT_ELECTRICITY_IMPACT_FACTOR = 0.06 // kg CO2e/kWh
const DEFAULT_FUEL_CO2_PER_UNIT = {
  dieselLiter: 2.68,
  naturalGasNm3: 2.0,
  lpgKg: 3.0,
  gasolineLiter: 2.2,
  ethanolLiter: 0.6,
  woodKg: 0.0, // often biogenic; treat as 0 for placeholder
}

function calcAgricultural(input: AgriculturalInput) {
  console.log(input)

  const biomassSpecific = toNumber(input.biomassInputSpecific, 1) // kg/MJ
  const biomassImpactFactor = toNumber(
    input.biomassImpactFactor,
    DEFAULT_BIOMASS_IMPACT_FACTOR
  )
  const calorific = toNumber(
    input.biomassCalorificValue,
    DEFAULT_BIOMASS_CALORIFIC_MJ_PER_KG
  )
  const cornStarchImpact = toNumber(input.cornStarchImpact, 0) // kg CO2e/MJ

  // Biomassa: impacto por MJ = (kg/MJ) * (kg CO2e/kg)
  const biomassImpactPerMJ = biomassSpecific * biomassImpactFactor

  // MUT: alocação percentual sobre impacto por kg, convertido para MJ via calorífico
  const mutFactorPerKg = toNumber(
    input.mutImpactFactor,
    DEFAULT_MUT_IMPACT_FACTOR_PER_KG
  )
  const mutAllocPct = toNumber(input.mutAllocationPercent, 0) / 100
  const mutImpactPerMJ = mutFactorPerKg * biomassSpecific * mutAllocPct

  // Transporte: demanda t.km = (massa por viagem em t) * distância; impacto por MJ via razão massa/MJ
  const distanceKm = toNumber(input.transportDistanceKm, 0)
  const avgTonPerVehicle = toNumber(input.averageBiomassPerVehicleTon, 20)
  const demandTkm = avgTonPerVehicle * distanceKm
  const transportImpactPerMJ =
    DEFAULT_TRANSPORT_IMPACT_PER_TKM * (biomassSpecific / 1000) * distanceKm

  const totalPerMJ =
    biomassImpactPerMJ +
    cornStarchImpact +
    mutImpactPerMJ +
    transportImpactPerMJ

  return {
    // Totais (células em azul escuro)
    totalImpactPerMJ: totalPerMJ,
    biomassProductionImpact: toNumber(input.biomassProductionImpact, 0), // E40
    mutImpact: toNumber(input.mutImpactResult, 0), // E47
    biomassTransportImpact: toNumber(input.transportImpactResult, 0), // E53

    // Cálculos intermediários (células em azul claro)
    biomassImpactFactor: input.biomassImpactFactor, // E36
    biomassCalorificValue: calorific, // E37
    cornStarchImpact: cornStarchImpact, // E39
    biomassSpecific: biomassSpecific,
    mutFactorPerKg: mutFactorPerKg,
    mutAllocationPercent: input.mutAllocationPercent,
    transportDemandTkm: demandTkm,

    // Campos de entrada relevantes
    biomassType: input.biomassType,
    biomassInputSpecific: input.biomassInputSpecific,
    biomassProductionState: input.biomassProductionState,
    cultivationType: input.cultivationType,
    woodResidueLifecycleStage: input.woodResidueLifecycleStage,
    transportDistanceKm: input.transportDistanceKm,
    transportVehicleType: input.transportVehicleType,
    averageBiomassPerVehicleTon: input.averageBiomassPerVehicleTon,

    // Para cálculos posteriores
    assumptions: {
      calorificMJPerKg: calorific,
    },
  }
}

function calcIndustrial(input: IndustrialInput) {
  // Impacto da combustão da biomassa por ano
  const biomassCombustionEmissionFactor = toNumber(
    input.biomassCombustionEmissionFactorKgCO2PerKg,
    0
  )
  const biomassCombustionKg = toNumber(input.biomassForCogenerationKgPerYear, 0)
  const biomassCombustionImpactKgCO2PerYear =
    biomassCombustionEmissionFactor * biomassCombustionKg
  const processedBiomassKg = toNumber(input.processedBiomassKgPerYear, 0)
  const biomassMJ = processedBiomassKg * DEFAULT_BIOMASS_CALORIFIC_MJ_PER_KG

  // Fuels (placeholder linear factors)
  // ...existing code...

  // Manufacturing impact
  const manufacturingInputsKg =
    toNumber(input.lubricantOilKgPerYear, 0) +
    toNumber(input.silicaSandKgPerYear, 0) +
    toNumber(input.waterLitersPerYear, 0) / 1000 // naive placeholder: convert liters to kg

  const manufacturingImpactYear = manufacturingInputsKg * 0.5 // placeholder factor

  // Impacto de manufatura por MJ
  const manufacturingImpactKgCO2eqPerMJ = toNumber(
    input.manufacturingImpactKgCO2eqPerMJ,
    0
  )

  // Electricity totals in kWh/year
  const electricityKWh =
    toNumber(input.gridMixMediumVoltage, 0) +
    toNumber(input.gridMixHighVoltage, 0) +
    toNumber(input.electricityPCH, 0) +
    toNumber(input.electricityBiomass, 0) +
    toNumber(input.electricitySolar, 0)

  const elecFactor = toNumber(
    input.electricityImpactFactorKgCO2PerKWh,
    DEFAULT_ELECTRICITY_IMPACT_FACTOR
  )
  const electricityImpactYear = electricityKWh * elecFactor // kg CO2e/year
  // Impacto de eletricidade por MJ
  const electricityImpactResultKgCO2PerMJ =
    biomassMJ > 0 ? electricityImpactYear / biomassMJ : 0

  // Fuels (placeholder linear factors)
  const dieselImpact =
    toNumber(input.fuelDieselLitersPerYear, 0) *
    DEFAULT_FUEL_CO2_PER_UNIT.dieselLiter
  const naturalGasImpact =
    toNumber(input.fuelNaturalGasNm3PerYear, 0) *
    DEFAULT_FUEL_CO2_PER_UNIT.naturalGasNm3
  const lpgImpact =
    toNumber(input.fuelLPGKgPerYear, 0) * DEFAULT_FUEL_CO2_PER_UNIT.lpgKg
  const gasolineImpact =
    toNumber(input.fuelGasolineALitersPerYear, 0) *
    DEFAULT_FUEL_CO2_PER_UNIT.gasolineLiter
  const ethanolImpact =
    (toNumber(input.fuelEthanolAnhydrousLitersPerYear, 0) +
      toNumber(input.fuelEthanolHydratedLitersPerYear, 0)) *
    DEFAULT_FUEL_CO2_PER_UNIT.ethanolLiter
  const woodImpact =
    (toNumber(input.fuelWoodChipsKgPerYear, 0) +
      toNumber(input.fuelFirewoodKgPerYear, 0)) *
    DEFAULT_FUEL_CO2_PER_UNIT.woodKg

  const fuelImpactYear =
    dieselImpact +
    naturalGasImpact +
    lpgImpact +
    gasolineImpact +
    ethanolImpact +
    woodImpact

  // Impacto do consumo de combustível por MJ
  const fuelConsumptionImpactKgCO2PerMJ =
    biomassMJ > 0 ? fuelImpactYear / biomassMJ : 0

  const totalYear =
    electricityImpactYear + fuelImpactYear + manufacturingImpactYear
  const impactPerMJ = biomassMJ > 0 ? totalYear / biomassMJ : 0

  return {
    // Totais
    impactPerMJ: impactPerMJ,
    totalImpactYear: totalYear,

    // Detalhes por categoria
    electricityImpactYear: electricityImpactYear, // E68
    fuelImpactYear: fuelImpactYear, // E79 + E80
    manufacturingImpactYear: manufacturingImpactYear, // E90
    manufacturingImpactKgCO2eqPerYear: manufacturingImpactYear,
    manufacturingImpactKgCO2eqPerMJ,

    // Detalhes por combustível
    fuelImpacts: {
      diesel: dieselImpact,
      naturalGas: naturalGasImpact,
      lpg: lpgImpact,
      gasoline: gasolineImpact,
      ethanol: ethanolImpact,
      wood: woodImpact,
    },

    // Campos de entrada
    hasCogeneration: input.hasCogeneration,
    processedBiomassKgPerYear: input.processedBiomassKgPerYear,
    biomassForCogenerationKgPerYear: input.biomassForCogenerationKgPerYear,

    // Para cálculos posteriores
    processedBiomassKg,
    biomassMJ,
    electricityImpactResultKgCO2PerMJ,
    fuelConsumptionImpactKgCO2PerMJ,
    biomassCombustionImpactKgCO2PerYear,
    // fim da função
  }
}

function calcDistribution(input: DistributionInput) {
  const domQtyTon = toNumber(input.domesticBiomassQuantityTon, 0)
  const domDistKm = toNumber(input.domesticTransportDistanceKm, 0)
  const domRoadPct = toNumber(input.domesticRoadPercent, 100) / 100
  const domRailPct = toNumber(input.domesticRailPercent, 0) / 100
  const domWaterPct = toNumber(input.domesticWaterwayPercent, 0) / 100

  // Weighted distance per mode
  const domTkm = domQtyTon * domDistKm
  const domesticImpactYear =
    domTkm *
    DEFAULT_TRANSPORT_IMPACT_PER_TKM *
    (domRoadPct + domRailPct + domWaterPct)

  const expQtyTon = toNumber(input.exportBiomassQuantityTon, 0)
  const expToPortKm = toNumber(
    input.exportDistanceFactoryToNearestHydroPortKm,
    0
  )
  const expPortToMarketKm = toNumber(
    input.exportDistancePortToForeignMarketKm,
    0
  )

  const exportImpactFactoryToPortYear =
    expQtyTon * expToPortKm * DEFAULT_TRANSPORT_IMPACT_PER_TKM
  const exportImpactPortToMarketYear =
    expQtyTon * expPortToMarketKm * DEFAULT_TRANSPORT_IMPACT_PER_TKM

  const totalYear: number =
    domesticImpactYear +
    exportImpactFactoryToPortYear +
    exportImpactPortToMarketYear

  return {
    // Totais
    totalImpactYear: totalYear,

    // Detalhes por segmento
    domesticImpactYear: domesticImpactYear, // E102
    exportImpactFactoryToPortYear: exportImpactFactoryToPortYear, // E114
    exportImpactPortToMarketYear: exportImpactPortToMarketYear, // E115

    // Campos de entrada
    domesticBiomassQuantityTon: input.domesticBiomassQuantityTon,
    domesticTransportDistanceKm: input.domesticTransportDistanceKm,
    domesticRoadPercent: input.domesticRoadPercent,
    domesticRailPercent: input.domesticRailPercent,
    domesticWaterwayPercent: input.domesticWaterwayPercent,
    exportBiomassQuantityTon: input.exportBiomassQuantityTon,
    exportDistanceFactoryToNearestHydroPortKm:
      input.exportDistanceFactoryToNearestHydroPortKm,
    exportDistancePortToForeignMarketKm:
      input.exportDistancePortToForeignMarketKm,

    // Para cálculos posteriores
    domesticTkm: domTkm,
    exportFactoryToPortTkm: expQtyTon * expToPortKm,
    exportPortToMarketTkm: expQtyTon * expPortToMarketKm,
  }
}

export async function POST(req: Request) {
  try {
    // Read JSON body safely (optional for spreadsheet-only path)
    const contentType = req.headers.get("content-type") || ""
    let body: CalculateRequest = {}
    if (contentType.includes("application/json")) {
      try {
        const raw = await req.text()
        if (raw && raw.trim() !== "") body = JSON.parse(raw)
      } catch {
        console.error("Failed to parse JSON body")
      }
    }

    // Load spreadsheet from backend folder if present
    const filePath = join(process.cwd(), "src/backend/BioCalc - Planilha.xlsx")
    let resultFromSheet: unknown = null

    try {
      // Aqui você implementaria a leitura da planilha Excel
      // Por enquanto, deixamos como null
      resultFromSheet = null

      const computed = {
        agricultural: body.agricultural
          ? calcAgricultural(body.agricultural)
          : undefined,
        industrial: body.industrial
          ? calcIndustrial(body.industrial)
          : undefined,
        distribution: body.distribution
          ? calcDistribution(body.distribution)
          : undefined,
      }

      console.log("Computed phases:", computed)

      // Calcular totais e métricas principais
      const agriculturalTotal =
        (computed.agricultural?.biomassProductionImpact ?? 0) +
        (computed.agricultural?.mutImpact ?? 0) +
        (computed.agricultural?.biomassTransportImpact ?? 0)

      // E69: electricityImpactPerMJ, E81: fuelTotalImpactPerMJ, E85: cogenerationImpact, E91: manufacturingImpactPerMJ
      const industrialTotal =
        (computed.industrial?.impactPerMJ ?? 0) + // E69
        (computed.industrial?.impactPerMJ ?? 0) + // E81 (mesmo campo, pois impactPerMJ já soma tudo)
        0 + // E85: cogenerationImpact (não calculado, placeholder)
        (computed.industrial?.manufacturingImpactKgCO2eqPerMJ ?? 0) // E91

      // Calcular distribuição por MJ
      const biomassMJ =
        computed.industrial?.biomassMJ ||
        toNumber(body.industrial?.processedBiomassKgPerYear, 1) *
          DEFAULT_BIOMASS_CALORIFIC_MJ_PER_KG

      // E104: domesticImpactPerMJ, E117: exportTotalImpactPerMJ
      const distributionTotal = computed.distribution
        ? (computed.distribution.domesticImpactYear ?? 0) / biomassMJ +
          (computed.distribution.exportImpactFactoryToPortYear ?? 0) /
            biomassMJ +
          (computed.distribution.exportImpactPortToMarketYear ?? 0) / biomassMJ
        : 0

      const carbonIntensity =
        agriculturalTotal + industrialTotal + distributionTotal
      const fossilSubstitute = 0.0867 // Diesel A, Gasolina A e GNV (Média ponderada)
      const energyEfficiencyNote = fossilSubstitute - carbonIntensity
      const emissionReduction =
        (fossilSubstitute - carbonIntensity) / fossilSubstitute

      // Volume de produção (exemplo)
      const productionVolumeTon =
        toNumber(body.industrial?.processedBiomassKgPerYear, 0) / 1000
      const eligibleCBIOS = Math.floor(
        productionVolumeTon *
          (energyEfficiencyNote > 0 ? energyEfficiencyNote : 0)
      )

      const resp: CalculateResponse = {
        ok: true,
        sheet: resultFromSheet as unknown as CalculateResponse["sheet"],
        computed,
        results: {
          // CAMPOS PRINCIPAIS DA PLANILHA (células em azul escuro)
          carbonIntensity: {
            total: carbonIntensity, // C21 = SUM(C23:C26)
            agricultural: agriculturalTotal, // C23
            industrial: industrialTotal, // C24
            distribution: distributionTotal, // C25
            use: 0, // C26 (uso - precisa ser calculado separadamente)
          },
          energyEfficiencyNote: energyEfficiencyNote, // C27 = J20-C21
          emissionReduction: emissionReduction, // C28 = (J20-C21)/J20

          // GERAÇÃO DE CBIOs
          cBioGeneration: {
            fossilSubstitute: fossilSubstitute, // J20
            eligibleProductionVolumeTon: productionVolumeTon, // H21
            eligibleCBIOS: eligibleCBIOS, // H23 = ROUNDDOWN(...)
            marketValuePerCBIO: 78.07, // H26
            approximateRevenue: eligibleCBIOS * 78.07, // H27 = H24*H27
          },

          // DETALHES DAS FASES (campos em azul claro - cálculos automáticos)
          phaseDetails: {
            // Fase Agrícola
            agricultural: computed.agricultural
              ? {
                  biomassImpactFactor:
                    computed.agricultural.biomassImpactFactor, // E36
                  biomassCalorificValue:
                    computed.agricultural.biomassCalorificValue, // E37
                  cornStarchImpact: computed.agricultural.cornStarchImpact, // E39
                  biomassProductionImpact:
                    computed.agricultural.biomassProductionImpact, // E40
                  mutImpact: computed.agricultural.mutImpact, // E47
                  biomassTransportImpact:
                    computed.agricultural.biomassTransportImpact, // E53
                }
              : undefined,

            // Fase Industrial
            industrial: computed.industrial
              ? {
                  electricityImpact: computed.industrial.electricityImpactYear, // E68 (kg CO2/ano)
                  electricityImpactPerMJ: computed.industrial.impactPerMJ, // E69 (kg CO2/MJ)
                  fuelProductionImpact: computed.industrial.fuelImpactYear, // E79 (kg CO2/ano)
                  fuelCombustionImpact: 0, // E80 (precisa cálculo adicional)
                  fuelTotalImpactPerMJ: computed.industrial.impactPerMJ, // E81
                  cogenerationImpact: 0, // E84, E85
                  manufacturingInputsImpact:
                    computed.industrial.manufacturingImpactYear, // E90 (kg CO2 eq./ano)
                  manufacturingImpactPerMJ: computed.industrial.impactPerMJ, // E91
                }
              : undefined,

            // Fase de Distribuição
            distribution: computed.distribution
              ? {
                  domesticImpactYear: computed.distribution.domesticImpactYear, // E102
                  domesticImpactPerMJ: distributionTotal, // E104
                  exportImpactFactoryToPort:
                    computed.distribution.exportImpactFactoryToPortYear, // E114
                  exportImpactPortToMarket:
                    computed.distribution.exportImpactPortToMarketYear, // E115
                  exportTotalImpactPerMJ: distributionTotal, // E117
                }
              : undefined,
          },

          // CAMPOS DE ENTRADA RELEVANTES
          inputs: {
            biomassType: body.agricultural?.biomassType,
            biomassProductionState: body.agricultural?.biomassProductionState,
            processedBiomassKgPerYear:
              body.industrial?.processedBiomassKgPerYear,
            hasCogeneration: body.industrial?.hasCogeneration,
            transportDistanceKm: body.agricultural?.transportDistanceKm,
            domesticMarketDistance:
              body.distribution?.domesticTransportDistanceKm,
            exportDistance:
              body.distribution?.exportDistanceFactoryToNearestHydroPortKm,
          },
        },
      }

      return NextResponse.json(resp)
    } catch (error) {
      console.error("Error processing request:", error)
      resultFromSheet = {
        error: "Spreadsheet not found or processing error",
        pathTried: filePath,
        details: String(error),
      }
    }

    // Se chegou aqui, houve um erro na planilha
    const resp: CalculateResponse = {
      ok: false,
      sheet: resultFromSheet as unknown as CalculateResponse["sheet"],
      error: "Failed to process spreadsheet",
    }
    return NextResponse.json(resp, { status: 500 })
  } catch (err) {
    const resp: CalculateResponse = {
      ok: false,
      error: "Invalid request body",
      details: String(err),
    }
    return NextResponse.json(resp, { status: 400 })
  }
}
