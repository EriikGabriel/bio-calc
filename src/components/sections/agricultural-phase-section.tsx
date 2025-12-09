import { useAgriculturalAutofill } from "@/hooks/use-agricultural-autofill"
import { getDropdownOptions } from "@/services/calc-api"
import { useLoadCombinedOnVisible } from "@/utils/visibility"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@ui/field"
import { Input } from "@ui/input"
import isEqual from "lodash/isEqual"
import { useRef, useState } from "react"
import { GiCorn, GiFarmTractor } from "react-icons/gi"

import { MdAgriculture } from "react-icons/md"
import { PiFarmFill } from "react-icons/pi"

export interface AgriculturalPhaseFormData {
  biomassType: string
  biomassInputSpecific: string
  biomassImpactFactor: string // auto
  biomassCalorificValue: string // auto
  cornStarchInput: string
  cornStarchImpact: string // auto
  biomassProductionImpact: string // auto (result)
  // Mudança de Uso da Terra (MUT)
  biomassProductionState: string
  cultivationType: string // auto
  woodResidueLifecycleStage: string
  mutImpactFactor: string // auto
  mutAllocationPercent: string
  mutImpactResult: string // auto
  // Transporte da biomassa
  transportDistanceKm: string
  transportVehicleType: string
  averageBiomassPerVehicleTon: string // auto
  transportDemandTkm: string // auto
  transportImpactResult: string // auto
}

import type { FieldErrors } from "@/types/forms"
export type AgriculturalPhaseFieldErrors = FieldErrors

export function AgriculturalPhaseSection({
  data,
  errors,
  onFieldChange,
  onFieldBlur,
}: {
  data: AgriculturalPhaseFormData
  errors: AgriculturalPhaseFieldErrors
  onFieldChange: (name: keyof AgriculturalPhaseFormData, value: string) => void
  onFieldBlur?: (name: keyof AgriculturalPhaseFormData) => void
}) {
  const [biomassOptions, setBiomassOptions] = useState<string[]>([])
  const [stateOptions, setStateOptions] = useState<string[]>([])
  const [woodResidueOptions, setWoodResidueOptions] = useState<string[]>([])
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState<string[]>([])
  const sectionRef = useRef<HTMLElement | null>(null)

  useLoadCombinedOnVisible(
    sectionRef,
    async () => {
      const [biomass, states, woodResidue, vehicleTypes] = await Promise.all([
        getDropdownOptions("Dados auxiliares", "B7:B12"),
        getDropdownOptions("Dados auxiliares", "B97:B123"),
        getDropdownOptions("Dados auxiliares", "L81:L92"),
        getDropdownOptions("Dados auxiliares", "B70:B76"),
      ])
      return { biomass, states, woodResidue, vehicleTypes }
    },
    ({ biomass, states, woodResidue, vehicleTypes }) => {
      setBiomassOptions((prev) => (isEqual(prev, biomass) ? prev : biomass))
      setStateOptions((prev) => (isEqual(prev, states) ? prev : states))
      setWoodResidueOptions((prev) =>
        isEqual(prev, woodResidue) ? prev : woodResidue
      )
      setVehicleTypeOptions((prev) =>
        isEqual(prev, vehicleTypes) ? prev : vehicleTypes
      )
    }
  )

  // Hook para gerenciar preenchimentos automáticos
  useAgriculturalAutofill(data, onFieldChange)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    onFieldChange(name as keyof AgriculturalPhaseFormData, value)
  }

  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name } = e.target
    onFieldBlur?.(name as keyof AgriculturalPhaseFormData)
  }

  return (
    <section ref={sectionRef} className="space-y-6">
      <h1 className="text-xl border-b pb-1 border-forest-600/70 font-bold flex items-center text-soil-800">
        <MdAgriculture className="inline mr-2 size-8" /> Fase Agricola
      </h1>
      <FieldSet>
        <FieldLegend className="flex items-center text-soil-800">
          <GiCorn className="inline mr-2 size-5" /> Produção de Biomassa
        </FieldLegend>
        <FieldGroup className="flex gap-3">
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="biomassType">Tipo de Biomassa *</FieldLabel>
              <FieldContent>
                <select
                  id="biomassType"
                  name="biomassType"
                  value={data.biomassType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.biomassType}
                  className={`h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:ring-[3px] ${
                    errors.biomassType
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                      : "focus-visible:border-ring focus-visible:ring-ring/50"
                  }`}
                >
                  <option value="" disabled>
                    Selecionar na lista suspensa
                  </option>
                  {biomassOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <FieldError
                  errors={
                    errors.biomassType ? [{ message: errors.biomassType }] : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="biomassInputSpecific">
                Entrada de biomassa — dado específico
              </FieldLabel>
              <FieldContent>
                <Input
                  id="biomassInputSpecific"
                  name="biomassInputSpecific"
                  placeholder="Ex.: 1.25"
                  value={data.biomassInputSpecific}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.biomassInputSpecific}
                />
                <FieldDescription>
                  Se não possuir a informação, deixe em branco (será usado o
                  dado padrão)
                </FieldDescription>
                <FieldError
                  errors={
                    errors.biomassInputSpecific
                      ? [{ message: errors.biomassInputSpecific }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="biomassImpactFactor">
                Fator de impacto da biomassa selecionada
              </FieldLabel>
              <FieldContent>
                <Input
                  id="biomassImpactFactor"
                  name="biomassImpactFactor"
                  placeholder="Preenchimento automático"
                  value={data.biomassImpactFactor}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.biomassImpactFactor}
                  disabled
                />
                <FieldDescription>kg CO₂ eq. / kg biomassa</FieldDescription>
                <FieldError
                  errors={
                    errors.biomassImpactFactor
                      ? [{ message: errors.biomassImpactFactor }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="biomassCalorificValue">
                Poder calorífico da biomassa selecionada
              </FieldLabel>
              <FieldContent>
                <Input
                  id="biomassCalorificValue"
                  name="biomassCalorificValue"
                  placeholder="Preenchimento automático"
                  value={data.biomassCalorificValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.biomassCalorificValue}
                  disabled
                />
                <FieldDescription>MJ / kg de biomassa</FieldDescription>
                <FieldError
                  errors={
                    errors.biomassCalorificValue
                      ? [{ message: errors.biomassCalorificValue }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="cornStarchInput">
                Entrada de amido de milho *
              </FieldLabel>
              <FieldContent>
                <Input
                  id="cornStarchInput"
                  name="cornStarchInput"
                  placeholder="Ex.: 0.10"
                  value={data.cornStarchInput}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.cornStarchInput}
                />
                <FieldDescription>kg / MJ de biocombustível</FieldDescription>
                <FieldError
                  errors={
                    errors.cornStarchInput
                      ? [{ message: errors.cornStarchInput }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="cornStarchImpact">
                Impacto associado ao consumo de amido de milho
              </FieldLabel>
              <FieldContent>
                <Input
                  id="cornStarchImpact"
                  name="cornStarchImpact"
                  placeholder="Preenchimento automático"
                  value={data.cornStarchImpact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.cornStarchImpact}
                  disabled
                />
                <FieldDescription>kg CO₂ eq / MJ</FieldDescription>
                <FieldError
                  errors={
                    errors.cornStarchImpact
                      ? [{ message: errors.cornStarchImpact }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="biomassProductionImpact">
              Impacto da produção de biomassa
            </FieldLabel>
            <FieldContent>
              <Input
                id="biomassProductionImpact"
                name="biomassProductionImpact"
                placeholder="Preenchimento automático"
                value={data.biomassProductionImpact}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!errors.biomassProductionImpact}
                disabled
              />
              <FieldDescription>
                kg CO₂ eq. / MJ de biocombustível
              </FieldDescription>
              <FieldError
                errors={
                  errors.biomassProductionImpact
                    ? [{ message: errors.biomassProductionImpact }]
                    : []
                }
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>

      {/* Mudança de Uso da Terra (MUT) */}
      <FieldSet>
        <FieldLegend className="flex items-center text-soil-800">
          <PiFarmFill className="inline mr-2 size-5" />
          Mudança de Uso da Terra
        </FieldLegend>
        <FieldGroup className="flex gap-3">
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="biomassProductionState">
                Estado da produção da Biomassa *
              </FieldLabel>
              <FieldContent>
                <select
                  id="biomassProductionState"
                  name="biomassProductionState"
                  value={data.biomassProductionState}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.biomassProductionState}
                  className={`h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:ring-[3px] ${
                    errors.biomassProductionState
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                      : "focus-visible:border-ring focus-visible:ring-ring/50"
                  }`}
                >
                  <option value="" disabled>
                    Selecionar na lista suspensa
                  </option>
                  {stateOptions.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
                <FieldError
                  errors={
                    errors.biomassProductionState
                      ? [{ message: errors.biomassProductionState }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="cultivationType">
                Cultivo agrícola
              </FieldLabel>
              <FieldContent>
                <Input
                  id="cultivationType"
                  name="cultivationType"
                  placeholder="Preenchimento automático"
                  value={data.cultivationType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.cultivationType}
                  disabled
                />
                <FieldDescription>preenchimento automático</FieldDescription>
                <FieldError
                  errors={
                    errors.cultivationType
                      ? [{ message: errors.cultivationType }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="woodResidueLifecycleStage">
                Etapa do ciclo de vida da madeira de onde os resíduos foram
                obtidos *
              </FieldLabel>
              <FieldContent>
                <select
                  id="woodResidueLifecycleStage"
                  name="woodResidueLifecycleStage"
                  value={data.woodResidueLifecycleStage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.woodResidueLifecycleStage}
                  disabled={data.woodResidueLifecycleStage === "Não aplica"}
                  className={`h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.woodResidueLifecycleStage
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                      : "focus-visible:border-ring focus-visible:ring-ring/50"
                  }`}
                >
                  <option value="" disabled>
                    Selecionar na lista suspensa
                  </option>
                  {data.biomassType &&
                    !/^Resíduo de (Pinus|Eucaliptus)$/i.test(
                      data.biomassType
                    ) && <option value="Não aplica">Não aplica</option>}
                  {woodResidueOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <FieldError
                  errors={
                    errors.woodResidueLifecycleStage
                      ? [{ message: errors.woodResidueLifecycleStage }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="mutImpactFactor">
                Fator de impacto do MUT
              </FieldLabel>
              <FieldContent>
                <Input
                  id="mutImpactFactor"
                  name="mutImpactFactor"
                  placeholder="Preenchimento automático"
                  value={data.mutImpactFactor}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.mutImpactFactor}
                  disabled
                />
                <FieldDescription>kg CO₂ eq. / kg biomassa</FieldDescription>
                <FieldError
                  errors={
                    errors.mutImpactFactor
                      ? [{ message: errors.mutImpactFactor }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="mutAllocationPercent">
                Percentual de alocação da biomassa
              </FieldLabel>
              <FieldContent>
                <Input
                  id="mutAllocationPercent"
                  name="mutAllocationPercent"
                  placeholder="Preenchimento automático"
                  value={data.mutAllocationPercent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.mutAllocationPercent}
                  disabled
                />
                <FieldDescription>%</FieldDescription>
                <FieldError
                  errors={
                    errors.mutAllocationPercent
                      ? [{ message: errors.mutAllocationPercent }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="mutImpactResult">Impacto MUT</FieldLabel>
              <FieldContent>
                <Input
                  id="mutImpactResult"
                  name="mutImpactResult"
                  placeholder="Preenchimento automático"
                  value={data.mutImpactResult}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.mutImpactResult}
                  disabled
                />
                <FieldDescription>
                  kg CO₂ eq. / MJ de biocombustível
                </FieldDescription>
                <FieldError
                  errors={
                    errors.mutImpactResult
                      ? [{ message: errors.mutImpactResult }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      {/* Transporte da biomassa até a planta industrial */}
      <FieldSet>
        <FieldLegend className="flex items-center text-soil-800">
          <GiFarmTractor className="inline mr-2 size-5" /> Transporte da
          biomassa até a planta industrial
        </FieldLegend>
        <FieldGroup className="flex gap-3">
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="transportDistanceKm">
                Distância de transporte da biomassa até a fábrica *
              </FieldLabel>
              <FieldContent>
                <Input
                  id="transportDistanceKm"
                  name="transportDistanceKm"
                  placeholder="Ex.: 100,00"
                  value={data.transportDistanceKm}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.transportDistanceKm}
                />
                <FieldDescription>km</FieldDescription>
                <FieldError
                  errors={
                    errors.transportDistanceKm
                      ? [{ message: errors.transportDistanceKm }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="transportVehicleType">
                Tipo de veículo usado no transporte *
              </FieldLabel>
              <FieldContent>
                <select
                  id="transportVehicleType"
                  name="transportVehicleType"
                  value={data.transportVehicleType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.transportVehicleType}
                  className={`h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:ring-[3px] ${
                    errors.transportVehicleType
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                      : "focus-visible:border-ring focus-visible:ring-ring/50"
                  }`}
                >
                  <option value="" disabled>
                    Selecionar na lista suspensa
                  </option>
                  {vehicleTypeOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <FieldError
                  errors={
                    errors.transportVehicleType
                      ? [{ message: errors.transportVehicleType }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="averageBiomassPerVehicleTon">
                Quantidade média de Biomassa transportada por veículo
              </FieldLabel>
              <FieldContent>
                <Input
                  id="averageBiomassPerVehicleTon"
                  name="averageBiomassPerVehicleTon"
                  placeholder="Preenchimento automático"
                  value={data.averageBiomassPerVehicleTon}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.averageBiomassPerVehicleTon}
                  disabled
                />
                <FieldDescription>tonelada</FieldDescription>
                <FieldError
                  errors={
                    errors.averageBiomassPerVehicleTon
                      ? [{ message: errors.averageBiomassPerVehicleTon }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="transportDemandTkm">
                Demanda de transporte
              </FieldLabel>
              <FieldContent>
                <Input
                  id="transportDemandTkm"
                  name="transportDemandTkm"
                  placeholder="Preenchimento automático"
                  value={data.transportDemandTkm}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.transportDemandTkm}
                  disabled
                />
                <FieldDescription>t.km</FieldDescription>
                <FieldError
                  errors={
                    errors.transportDemandTkm
                      ? [{ message: errors.transportDemandTkm }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="transportImpactResult">
                Impacto do transporte da biomassa
              </FieldLabel>
              <FieldContent>
                <Input
                  id="transportImpactResult"
                  name="transportImpactResult"
                  placeholder="Preenchimento automático"
                  value={data.transportImpactResult}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.transportImpactResult}
                  disabled
                />
                <FieldDescription>
                  kg CO₂ eq. / MJ de biocombustível
                </FieldDescription>
                <FieldError
                  errors={
                    errors.transportImpactResult
                      ? [{ message: errors.transportImpactResult }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>
    </section>
  )
}
