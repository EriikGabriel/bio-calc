// Tipos de biomassa alinhados às opções da planilha (Dados auxiliares!B26:B31)
export const BIOMASS_TYPES = [
  "Resíduo de Pinus",
  "Resíduo de Eucalipto",
  "Carvão vegetal de eucalipto",
  "Casca de Amendoim",
  "Eucaliptus Virgem",
  "Pinus Virgem",
] as const

export type BiomassType = (typeof BIOMASS_TYPES)[number]

// Valores automáticos derivados da planilha (aproximações/placeholder):
// Substitua pelos valores exatos conforme a aba "Dados auxiliares".
export const BIOMASS_PROPERTIES: Record<
  BiomassType,
  { impactFactorKgCO2PerKg: string; calorificMJPerKg: string }
> = {
  "Resíduo de Pinus": {
    impactFactorKgCO2PerKg: "0,025",
    calorificMJPerKg: "16,50",
  },
  "Resíduo de Eucalipto": {
    impactFactorKgCO2PerKg: "0,051",
    calorificMJPerKg: "16,33",
  },
  "Carvão vegetal de eucalipto": {
    impactFactorKgCO2PerKg: "0,060",
    calorificMJPerKg: "28,00",
  },
  "Casca de Amendoim": {
    impactFactorKgCO2PerKg: "0,030",
    calorificMJPerKg: "17,20",
  },
  "Eucaliptus Virgem": {
    impactFactorKgCO2PerKg: "0,051",
    calorificMJPerKg: "16,33",
  },
  "Pinus Virgem": {
    impactFactorKgCO2PerKg: "0,025",
    calorificMJPerKg: "16,50",
  },
}
