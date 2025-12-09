// Using native select for vehicle type for consistent UX across sections
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NumericInput } from "@/components/ui/numeric-input"
import { PercentageInput } from "@/components/ui/percentage-input"
import { VEHICLE_TYPES } from "@/constants/transport"
import { useDistributionAutofill } from "@/hooks/use-distribution-autofill"
import type { FieldErrors } from "@/types/forms"
import React from "react"
import { FaShip, FaTruckMoving } from "react-icons/fa"
import { IoHome } from "react-icons/io5"

export interface DistributionPhaseFormData {
  domesticBiomassQuantityTon: string
  domesticTransportDistanceKm: string
  domesticRailPercent: string
  domesticWaterwayPercent: string
  domesticRoadPercent: string
  domesticRoadVehicleType: string
  // Auto-calculated/disabled display fields
  domesticDistributionImpactKgCO2EqPerYear: string
  domesticMjTransportedPerYear: string
  domesticImpactKgCO2EqPerMjTransported: string

  // Export section (via container marítimo)
  exportBiomassQuantityTon: string
  exportDistanceFactoryToNearestHydroPortKm: string
  exportRailPercentToPort: string
  exportWaterwayPercentToPort: string
  exportRoadPercentToPort: string
  exportRoadVehicleTypeToPort: string
  exportDistancePortToForeignMarketKm: string
  // Outputs
  exportDistributionImpactFactoryToPortKgCO2EqPerYear: string
  exportDistributionImpactPortToMarketKgCO2EqPerYear: string
  exportMjTransportedPerYear: string
  exportImpactKgCO2EqPerMjTransported: string
}

export type DistributionPhaseFieldErrors = FieldErrors

interface Props {
  data: DistributionPhaseFormData
  errors: DistributionPhaseFieldErrors
  onFieldChange: (name: keyof DistributionPhaseFormData, value: string) => void
  onFieldBlur?: (name: keyof DistributionPhaseFormData) => void
  previousPhases?: {
    agricultural?: import("./agricultural-phase-section").AgriculturalPhaseFormData
    industrial?: import("./industrial-phase-section").IndustrialPhaseFormData
  }
}

export function DistributionPhaseSection({
  data,
  errors,
  onFieldChange,
  onFieldBlur,
  previousPhases,
}: Props) {
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    onFieldChange(name as keyof DistributionPhaseFormData, value)
  }

  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name } = e.target
    onFieldBlur?.(name as keyof DistributionPhaseFormData)
  }

  // Hook para preenchimentos automáticos
  useDistributionAutofill(data, onFieldChange, previousPhases)

  return (
    <section className="space-y-6">
      <h1 className="text-xl border-b pb-1 border-forest-600/70 font-bold flex items-center text-soil-800">
        <FaTruckMoving className="inline mr-2 size-8" /> Fase de Distribuição
        <span className="ml-2 text-sm">(Transporte ao mercado consumidor)</span>
      </h1>

      <FieldSet>
        <FieldLegend className="flex items-center text-soil-800">
          <IoHome className="inline mr-2 size-5" /> Mercado doméstico
        </FieldLegend>
        <FieldGroup className="flex gap-3">
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="domesticBiomassQuantityTon">
                Quantidade de biomassa transportada no mercado doméstico *
              </FieldLabel>
              <FieldContent>
                <NumericInput
                  id="domesticBiomassQuantityTon"
                  name="domesticBiomassQuantityTon"
                  value={data.domesticBiomassQuantityTon}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ex.: 1.000,00"
                  minValue={0}
                  maxDecimals={2}
                  aria-invalid={!!errors.domesticBiomassQuantityTon}
                />
                <FieldError
                  errors={
                    errors.domesticBiomassQuantityTon
                      ? [{ message: errors.domesticBiomassQuantityTon }]
                      : []
                  }
                />
                <span className="text-xs text-gray-500">tonelada</span>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="domesticTransportDistanceKm">
                Distância de transporte até o mercado consumidor doméstico *
              </FieldLabel>
              <FieldContent>
                <NumericInput
                  id="domesticTransportDistanceKm"
                  name="domesticTransportDistanceKm"
                  value={data.domesticTransportDistanceKm}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ex.: 1.000,00"
                  minValue={0}
                  maxDecimals={2}
                  aria-invalid={!!errors.domesticTransportDistanceKm}
                />
                <FieldError
                  errors={
                    errors.domesticTransportDistanceKm
                      ? [{ message: errors.domesticTransportDistanceKm }]
                      : []
                  }
                />
                <span className="text-xs text-gray-500">km</span>
              </FieldContent>
            </Field>
          </div>

          <FieldSeparator />

          <div className="flex gap-3">
            <Field>
              <FieldLabel
                className="flex items-center gap-2"
                htmlFor="domesticRailPercent"
              >
                Percentual da distância via ferroviária *
              </FieldLabel>
              <FieldContent>
                <PercentageInput
                  id="domesticRailPercent"
                  name="domesticRailPercent"
                  value={data.domesticRailPercent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ex.: 50"
                  aria-invalid={!!errors.domesticRailPercent}
                />
                <FieldError
                  errors={
                    errors.domesticRailPercent
                      ? [{ message: errors.domesticRailPercent }]
                      : []
                  }
                />
                <span className="text-xs text-gray-500">%</span>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel
                className="flex items-center gap-2"
                htmlFor="domesticWaterwayPercent"
              >
                Percentual da distância via hidroviária *
              </FieldLabel>
              <FieldContent>
                <PercentageInput
                  id="domesticWaterwayPercent"
                  name="domesticWaterwayPercent"
                  value={data.domesticWaterwayPercent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ex.: 50"
                  aria-invalid={!!errors.domesticWaterwayPercent}
                />
                <FieldError
                  errors={
                    errors.domesticWaterwayPercent
                      ? [{ message: errors.domesticWaterwayPercent }]
                      : []
                  }
                />
                <span className="text-xs text-gray-500">%</span>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel
                className="flex items-center gap-2"
                htmlFor="domesticRoadPercent"
              >
                Percentual da distância via rodoviária
              </FieldLabel>
              <FieldContent>
                <PercentageInput
                  id="domesticRoadPercent"
                  name="domesticRoadPercent"
                  value={data.domesticRoadPercent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Preenchimento automático"
                  disabled
                  aria-invalid={!!errors.domesticRoadPercent}
                />
                <FieldError
                  errors={
                    errors.domesticRoadPercent
                      ? [{ message: errors.domesticRoadPercent }]
                      : []
                  }
                />
                <span className="text-xs text-gray-500">%</span>
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="domesticRoadVehicleType">
              Tipo de veículo usado no transporte rodoviário
            </FieldLabel>
            <FieldContent>
              <select
                id="domesticRoadVehicleType"
                name="domesticRoadVehicleType"
                value={data.domesticRoadVehicleType}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!errors.domesticRoadVehicleType}
                className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="" disabled>
                  Selecione o tipo de veículo
                </option>
                {VEHICLE_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <FieldError
                errors={
                  errors.domesticRoadVehicleType
                    ? [{ message: errors.domesticRoadVehicleType }]
                    : []
                }
              />
            </FieldContent>
          </Field>

          <FieldSeparator className="md:col-span-2" />
        </FieldGroup>

        {/* Outputs doméstico - 3 colunas lado a lado */}
        <FieldGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field>
            <FieldLabel className="min-h-10 flex items-center">
              Impacto da distribuição no mercado doméstico
            </FieldLabel>
            <FieldContent>
              <PercentageInput
                value={data.domesticDistributionImpactKgCO2EqPerYear ?? 0}
                disabled
              />
              <FieldError
                errors={
                  errors.domesticDistributionImpactKgCO2EqPerYear
                    ? [
                        {
                          message:
                            errors.domesticDistributionImpactKgCO2EqPerYear,
                        },
                      ]
                    : []
                }
              />
              <span className="text-xs text-gray-500">kg CO2 eq./ano</span>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="min-h-10 flex items-center">
              MJ transportado anualmente
            </FieldLabel>
            <FieldContent>
              <PercentageInput
                value={data.domesticMjTransportedPerYear ?? 0}
                disabled
              />
              <FieldError
                errors={
                  errors.domesticMjTransportedPerYear
                    ? [{ message: errors.domesticMjTransportedPerYear }]
                    : []
                }
              />
              <span className="text-xs text-gray-500">MJ/ano</span>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="min-h-10 flex items-center">
              Impacto da distribuição
            </FieldLabel>
            <FieldContent>
              <PercentageInput
                value={data.domesticImpactKgCO2EqPerMjTransported ?? 0}
                disabled
              />
              <FieldError
                errors={
                  errors.domesticImpactKgCO2EqPerMjTransported
                    ? [
                        {
                          message: errors.domesticImpactKgCO2EqPerMjTransported,
                        },
                      ]
                    : []
                }
              />
              <span className="text-xs text-gray-500">
                kg CO2 eq. / MJ transportado
              </span>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend className="flex items-center text-soil-800">
          <FaShip className="inline mr-2 size-5" /> Exportação - via container
          marítimo
        </FieldLegend>
        <FieldGroup className="flex gap-3">
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="exportBiomassQuantityTon">
                Quantidade de biocombustível sólido exportado via container
                marítimo
              </FieldLabel>
              <FieldContent>
                <NumericInput
                  id="exportBiomassQuantityTon"
                  name="exportBiomassQuantityTon"
                  value={data.exportBiomassQuantityTon}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ex.: 1.000,00"
                  minValue={0}
                  maxDecimals={2}
                  aria-invalid={!!errors.exportBiomassQuantityTon}
                />
                <FieldError
                  errors={
                    errors.exportBiomassQuantityTon
                      ? [{ message: errors.exportBiomassQuantityTon }]
                      : []
                  }
                />
                <span className="text-xs text-gray-500">tonelada(s)</span>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="exportDistanceFactoryToNearestHydroPortKm">
                Distância da fábrica ao porto hidroviário mais próximo
              </FieldLabel>
              <FieldContent>
                <NumericInput
                  id="exportDistanceFactoryToNearestHydroPortKm"
                  name="exportDistanceFactoryToNearestHydroPortKm"
                  value={data.exportDistanceFactoryToNearestHydroPortKm}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ex.: 1.000,00"
                  minValue={0}
                  maxDecimals={2}
                  aria-invalid={
                    !!errors.exportDistanceFactoryToNearestHydroPortKm
                  }
                />
                <FieldError
                  errors={
                    errors.exportDistanceFactoryToNearestHydroPortKm
                      ? [
                          {
                            message:
                              errors.exportDistanceFactoryToNearestHydroPortKm,
                          },
                        ]
                      : []
                  }
                />
                <span className="text-xs text-gray-500">km</span>
              </FieldContent>
            </Field>
          </div>

          <FieldSeparator />

          {/* Percent modal to port */}
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="exportRailPercentToPort">
                Percentual da distância via ferroviária (até o porto) *
              </FieldLabel>
              <FieldContent>
                <PercentageInput
                  id="exportRailPercentToPort"
                  name="exportRailPercentToPort"
                  value={data.exportRailPercentToPort}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ex.: 50"
                  aria-invalid={!!errors.exportRailPercentToPort}
                />
                <FieldError
                  errors={
                    errors.exportRailPercentToPort
                      ? [{ message: errors.exportRailPercentToPort }]
                      : []
                  }
                />
                <span className="text-xs text-gray-500">%</span>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="exportWaterwayPercentToPort">
                Percentual da distância via hidroviária (até o porto) *
              </FieldLabel>
              <FieldContent>
                <PercentageInput
                  id="exportWaterwayPercentToPort"
                  name="exportWaterwayPercentToPort"
                  value={data.exportWaterwayPercentToPort}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ex.: 50"
                  aria-invalid={!!errors.exportWaterwayPercentToPort}
                />
                <FieldError
                  errors={
                    errors.exportWaterwayPercentToPort
                      ? [{ message: errors.exportWaterwayPercentToPort }]
                      : []
                  }
                />
                <span className="text-xs text-gray-500">%</span>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="exportRoadPercentToPort">
                Percentual da distância via rodoviária (até o porto)
              </FieldLabel>
              <FieldContent>
                <PercentageInput
                  id="exportRoadPercentToPort"
                  name="exportRoadPercentToPort"
                  value={data.exportRoadPercentToPort}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Preenchimento automático"
                  disabled
                  aria-invalid={!!errors.exportRoadPercentToPort}
                />
                <FieldError
                  errors={
                    errors.exportRoadPercentToPort
                      ? [{ message: errors.exportRoadPercentToPort }]
                      : []
                  }
                />
                <span className="text-xs text-gray-500">%</span>
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="exportRoadVehicleTypeToPort">
              Tipo de veículo usado no transporte rodoviário até o porto
            </FieldLabel>
            <FieldContent>
              <select
                id="exportRoadVehicleTypeToPort"
                name="exportRoadVehicleTypeToPort"
                value={data.exportRoadVehicleTypeToPort}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!errors.exportRoadVehicleTypeToPort}
                className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="" disabled>
                  Selecione o tipo de veículo
                </option>
                {VEHICLE_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <FieldError
                errors={
                  errors.exportRoadVehicleTypeToPort
                    ? [{ message: errors.exportRoadVehicleTypeToPort }]
                    : []
                }
              />
            </FieldContent>
          </Field>

          {/* Distance from port to foreign market */}
          <Field>
            <FieldLabel htmlFor="exportDistancePortToForeignMarketKm">
              Distância do porto hidroviário ao mercado consumidor final
              (externo)
            </FieldLabel>
            <FieldContent>
              <NumericInput
                id="exportDistancePortToForeignMarketKm"
                name="exportDistancePortToForeignMarketKm"
                value={data.exportDistancePortToForeignMarketKm}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ex.: 1.000,00"
                minValue={0}
                maxDecimals={2}
                aria-invalid={!!errors.exportDistancePortToForeignMarketKm}
              />
              <FieldDescription>
                Consulta pode ser efetuada no site:{" "}
                <a
                  href="https://searates.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  searates.com
                </a>
              </FieldDescription>
              <FieldError
                errors={
                  errors.exportDistancePortToForeignMarketKm
                    ? [
                        {
                          message: errors.exportDistancePortToForeignMarketKm,
                        },
                      ]
                    : []
                }
              />
              <span className="text-xs text-gray-500">km</span>
            </FieldContent>
          </Field>

          <FieldSeparator className="md:col-span-2" />
        </FieldGroup>

        <FieldGroup className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field>
            <FieldLabel className="min-h-10 flex items-center">
              Impacto da fase de distribuição no mercado externo (Fábrica ao
              porto)
            </FieldLabel>
            <FieldContent>
              <Input
                value={
                  data.exportDistributionImpactFactoryToPortKgCO2EqPerYear ?? 0
                }
                disabled
              />
              <FieldError
                errors={
                  errors.exportDistributionImpactFactoryToPortKgCO2EqPerYear
                    ? [
                        {
                          message:
                            errors.exportDistributionImpactFactoryToPortKgCO2EqPerYear,
                        },
                      ]
                    : []
                }
              />
              <span className="text-xs text-gray-500">kg CO2 eq./ano</span>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="min-h-10 flex items-center">
              Impacto da fase de distribuição no mercado externo (Porto ao
              mercado)
            </FieldLabel>
            <FieldContent>
              <Input
                value={
                  data.exportDistributionImpactPortToMarketKgCO2EqPerYear ?? 0
                }
                disabled
              />
              <FieldError
                errors={
                  errors.exportDistributionImpactPortToMarketKgCO2EqPerYear
                    ? [
                        {
                          message:
                            errors.exportDistributionImpactPortToMarketKgCO2EqPerYear,
                        },
                      ]
                    : []
                }
              />
              <span className="text-xs text-gray-500">kg CO2 eq./ano</span>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="min-h-10 flex items-center">
              MJ exportado por ano
            </FieldLabel>
            <FieldContent>
              <Input value={data.exportMjTransportedPerYear ?? 0} disabled />
              <FieldError
                errors={
                  errors.exportMjTransportedPerYear
                    ? [{ message: errors.exportMjTransportedPerYear }]
                    : []
                }
              />
              <span className="text-xs text-gray-500">MJ/ano</span>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="min-h-10 flex items-center">
              Impacto da exportação
            </FieldLabel>
            <FieldContent>
              <Input
                value={data.exportImpactKgCO2EqPerMjTransported ?? 0}
                disabled
              />
              <FieldError
                errors={
                  errors.exportImpactKgCO2EqPerMjTransported
                    ? [
                        {
                          message: errors.exportImpactKgCO2EqPerMjTransported,
                        },
                      ]
                    : []
                }
              />
              <span className="text-xs text-gray-500">
                kg CO2 eq. / MJ transportado
              </span>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
    </section>
  )
}

export default DistributionPhaseSection
