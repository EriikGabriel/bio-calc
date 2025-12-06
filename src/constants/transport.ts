export const VEHICLE_TYPES = [
  "Transporte caminhão 16-32t",
  "Transporte caminhão >32t",
  "Transporte caminhão leve",
] as const

export type VehicleType = (typeof VEHICLE_TYPES)[number]
