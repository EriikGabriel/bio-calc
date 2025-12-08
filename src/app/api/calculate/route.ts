import type { CalculateResponse } from "@/types/api"
import { readFileSync } from "fs"
import { NextResponse } from "next/server"
import { join } from "path"
import * as XLSX from "xlsx"

function toNumber(raw: unknown, defaultValue = 0): number {
  if (typeof raw !== "string") return defaultValue
  const cleaned = raw.replace(/\s+/g, "").replace(/\./g, "").replace(",", ".")
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : defaultValue
}

// Contract types (kept minimal to decouple from UI types)
// Import request types from shared API types
import type {
  AgriculturalInput,
  DistributionInput,
  IndustrialInput,
} from "@/types/api"

// (removed local IndustrialInput in favor of shared import)

// (removed local DistributionInput in favor of shared import)

import type { CalculateRequest } from "@/types/api"

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

function calcAgricultural(input: AgriculturalInput, workbook: XLSX.WorkBook) {
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
    biomassImpactPerMJ,
    cornStarchImpactPerMJ: cornStarchImpact,
    mutImpactPerMJ,
    transportDemandTkm: demandTkm,
    transportImpactPerMJ,
    totalImpactPerMJ: totalPerMJ,
    assumptions: {
      calorificMJPerKg: calorific,
    },
  }
}

function calcIndustrial(input: IndustrialInput, workbook: XLSX.WorkBook) {
  const processedBiomassKg = toNumber(input.processedBiomassKgPerYear, 0)
  const biomassMJ = processedBiomassKg * DEFAULT_BIOMASS_CALORIFIC_MJ_PER_KG

  // Electricity totals in kWh/year
  const electricityKWh =
    toNumber(input.gridMixMediumVoltage, 0) +
    toNumber(input.gridMixHighVoltage, 0) +
    toNumber(input.electricityPCH, 0) +
    toNumber(input.electricityBiomass, 0) +
    toNumber(input.electricityDiesel, 0) +
    toNumber(input.electricitySolar, 0)

  const elecFactor = toNumber(
    input.electricityImpactFactorKgCO2PerKWh,
    DEFAULT_ELECTRICITY_IMPACT_FACTOR
  )
  const electricityImpactYear = electricityKWh * elecFactor // kg CO2e/year

  // Fuels (placeholder linear factors)
  const fuelImpactYear =
    toNumber(input.fuelDieselLitersPerYear, 0) *
      DEFAULT_FUEL_CO2_PER_UNIT.dieselLiter +
    toNumber(input.fuelNaturalGasNm3PerYear, 0) *
      DEFAULT_FUEL_CO2_PER_UNIT.naturalGasNm3 +
    toNumber(input.fuelLPGKgPerYear, 0) * DEFAULT_FUEL_CO2_PER_UNIT.lpgKg +
    toNumber(input.fuelGasolineALitersPerYear, 0) *
      DEFAULT_FUEL_CO2_PER_UNIT.gasolineLiter +
    (toNumber(input.fuelEthanolAnhydrousLitersPerYear, 0) +
      toNumber(input.fuelEthanolHydratedLitersPerYear, 0)) *
      DEFAULT_FUEL_CO2_PER_UNIT.ethanolLiter +
    (toNumber(input.fuelWoodChipsKgPerYear, 0) +
      toNumber(input.fuelFirewoodKgPerYear, 0)) *
      DEFAULT_FUEL_CO2_PER_UNIT.woodKg

  const manufacturingInputsKg =
    toNumber(input.lubricantOilKgPerYear, 0) +
    toNumber(input.silicaSandKgPerYear, 0) +
    toNumber(input.waterLitersPerYear, 0) / 1000 // naive placeholder: convert liters to kg

  const manufacturingImpactYear = manufacturingInputsKg * 0.5 // placeholder factor

  const totalYear =
    electricityImpactYear + fuelImpactYear + manufacturingImpactYear
  const impactPerMJ = biomassMJ > 0 ? totalYear / biomassMJ : 0

  return {
    electricityImpactYear,
    fuelImpactYear,
    manufacturingImpactYear,
    totalImpactYear: totalYear,
    impactPerMJ,
  }
}

function calcDistribution(input: DistributionInput, workbook: XLSX.WorkBook) {
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
    domesticImpactYear,
    exportImpactFactoryToPortYear,
    exportImpactPortToMarketYear,
    totalImpactYear: totalYear,
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
      const fileBuffer = readFileSync(filePath)
      const workbook = XLSX.read(fileBuffer, { type: "buffer" })

      const computed = {
        agricultural: body.agricultural
          ? calcAgricultural(body.agricultural, workbook)
          : undefined,
        industrial: body.industrial
          ? calcIndustrial(body.industrial, workbook)
          : undefined,
        distribution: body.distribution
          ? calcDistribution(body.distribution, workbook)
          : undefined,
      }

      const resp: CalculateResponse = {
        ok: true,
        sheet: resultFromSheet as unknown as CalculateResponse["sheet"],
        computed,
      }
      return NextResponse.json(resp)
    } catch {
      resultFromSheet = {
        error: "Spreadsheet not found",
        pathTried: filePath,
      }
    }
  } catch (err) {
    const resp: CalculateResponse = {
      ok: false,
      error: "Invalid request body",
      details: String(err),
    }
    return NextResponse.json(resp, { status: 400 })
  }
}
