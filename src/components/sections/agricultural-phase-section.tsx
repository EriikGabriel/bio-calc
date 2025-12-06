import { BIOMASS_TYPES } from "@constants/biomass"
import { BR_STATES } from "@constants/state"
import { VEHICLE_TYPES } from "@constants/transport"
import { WOOD_RESIDUE_STAGES } from "@constants/wood"
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
import { GiCorn, GiFarmTractor } from "react-icons/gi"

import { MdAgriculture } from "react-icons/md"
import { PiFarmFill } from "react-icons/pi"
export interface AgriculturalPhaseFormData {
  biomassType: string
  hasConsumptionInfo: "yes" | "no" | ""
  biomassInputSpecific: string
  biomassImpactFactor: string // auto
  biomassCalorificValue: string // auto
  cornStarchInput: string
  cornStarchConsumptionFactor: string // auto
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
  // Select options imported from constants
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
    <section className="space-y-6">
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
                  className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="" disabled>
                    Selecionar na lista suspensa
                  </option>
                  {BIOMASS_TYPES.map((t) => (
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
                Entrada de amido de milho
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
              <FieldLabel htmlFor="cornStarchConsumptionFactor">
                Fator quantitativo do consumo de amido de milho
              </FieldLabel>
              <FieldContent>
                <Input
                  id="cornStarchConsumptionFactor"
                  name="cornStarchConsumptionFactor"
                  placeholder="Preenchimento automático"
                  value={data.cornStarchConsumptionFactor}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.cornStarchConsumptionFactor}
                  disabled
                />
                <FieldDescription>kg CO₂ eq / MJ</FieldDescription>
                <FieldError
                  errors={
                    errors.cornStarchConsumptionFactor
                      ? [{ message: errors.cornStarchConsumptionFactor }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
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
          </div>
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
                Estado da produção da Biomassa
              </FieldLabel>
              <FieldContent>
                <select
                  id="biomassProductionState"
                  name="biomassProductionState"
                  value={data.biomassProductionState}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.biomassProductionState}
                  className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="" disabled>
                    Selecionar na lista suspensa
                  </option>
                  {BR_STATES.map((uf) => (
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
                obtidos
              </FieldLabel>
              <FieldContent>
                <select
                  id="woodResidueLifecycleStage"
                  name="woodResidueLifecycleStage"
                  value={data.woodResidueLifecycleStage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.woodResidueLifecycleStage}
                  className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="" disabled>
                    Selecionar na lista suspensa
                  </option>
                  {WOOD_RESIDUE_STAGES.map((s) => (
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
                  placeholder="Ex.: 32,50"
                  value={data.mutAllocationPercent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.mutAllocationPercent}
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
                Distância de transporte da biomassa até a fábrica
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
                Tipo de veículo usado no transporte
              </FieldLabel>
              <FieldContent>
                <select
                  id="transportVehicleType"
                  name="transportVehicleType"
                  value={data.transportVehicleType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.transportVehicleType}
                  className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="" disabled>
                    Selecionar na lista suspensa
                  </option>
                  {VEHICLE_TYPES.map((v) => (
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
