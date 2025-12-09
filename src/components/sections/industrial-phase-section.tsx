import { useIndustrialAutofill } from "@/hooks/use-industrial-autofill"
import type { FieldErrors } from "@/types/forms"
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
import { BsFillFuelPumpFill } from "react-icons/bs"
import {
  MdEnergySavingsLeaf,
  MdFactory,
  MdHandyman,
  MdLocalFireDepartment,
} from "react-icons/md"

export interface IndustrialPhaseFormData {
  // Dados do sistema
  processedBiomassKgPerYear: string
  biomassConsumedInCogenerationKgPerYear: string
  // Energia - Eletricidade (kWh/ano, unless noted)
  gridMixMediumVoltage: string
  gridMixHighVoltage: string
  electricityPCH: string
  electricityBiomass: string
  electricityDiesel: string
  electricitySolar: string
  electricityImpactFactorKgCO2PerKWh: string // auto
  electricityImpactResultKgCO2PerMJ: string // auto (result)
  // Energia - Combustível
  fuelDieselLitersPerYear: string
  fuelNaturalGasNm3PerYear: string
  fuelLPGKgPerYear: string
  fuelGasolineALitersPerYear: string
  fuelEthanolAnhydrousLitersPerYear: string
  fuelEthanolHydratedLitersPerYear: string
  fuelWoodChipsKgPerYear: string
  fuelFirewoodKgPerYear: string
  fuelProductionImpactKgCO2PerYear: string // auto
  fuelStationaryCombustionImpactKgCO2PerYear: string // auto
  fuelConsumptionImpactKgCO2PerMJ: string // auto (result)
  // Co-geração (Aproveitamento energético)
  biomassCombustionEmissionFactorKgCO2PerKg: string
  biomassCombustionImpactKgCO2PerYear: string // auto
  biomassCombustionImpactKgCO2PerMJ: string // auto (result)
  // Insumos de manufatura
  waterLitersPerYear: string
  lubricantOilKgPerYear: string
  silicaSandKgPerYear: string
  manufacturingImpactKgCO2eqPerYear: string // auto
  manufacturingImpactKgCO2eqPerMJ: string // auto (result)
}

export type IndustrialPhaseFieldErrors = FieldErrors

export function IndustrialPhaseSection({
  data,
  errors,
  onFieldChange,
  onFieldBlur,
  previousPhases,
}: {
  data: IndustrialPhaseFormData
  errors: IndustrialPhaseFieldErrors
  onFieldChange: (name: keyof IndustrialPhaseFormData, value: string) => void
  onFieldBlur?: (name: keyof IndustrialPhaseFormData) => void
  previousPhases?: {
    agricultural?: import("./agricultural-phase-section").AgriculturalPhaseFormData
  }
}) {
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    onFieldChange(name as keyof IndustrialPhaseFormData, value)
  }
  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name } = e.target
    onFieldBlur?.(name as keyof IndustrialPhaseFormData)
  }

  // Hook para preenchimentos automáticos
  useIndustrialAutofill(data, onFieldChange, previousPhases)

  return (
    <section className="space-y-6">
      <h1 className="text-xl border-b pb-1 border-forest-600/70 font-bold flex items-center text-soil-800">
        <MdFactory className="inline mr-2 size-8" /> Fase Industrial -
        Processamento
        <span className="ml-2 text-sm">
          (Secagem e Densificação da biomassa)
        </span>
      </h1>

      <FieldSet>
        <FieldLegend className="flex items-center text-soil-800">
          Dados do sistema
        </FieldLegend>
        <FieldGroup className="flex gap-3">
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="processedBiomassKgPerYear">
                Quantidade de biomassa processada *
              </FieldLabel>
              <FieldContent>
                <Input
                  id="processedBiomassKgPerYear"
                  name="processedBiomassKgPerYear"
                  placeholder="Ex.: 12.000.000,00"
                  value={data.processedBiomassKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.processedBiomassKgPerYear}
                />
                <FieldDescription>
                  (não considerar a biomassa usada na co-geração, se houver)
                </FieldDescription>
                <span className="text-xs text-gray-500">kg/ano</span>
                <FieldError
                  errors={
                    errors.processedBiomassKgPerYear
                      ? [{ message: errors.processedBiomassKgPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="biomassConsumedInCogenerationKgPerYear">
                Quantidade de biomassa consumida na co-geração
              </FieldLabel>
              <FieldContent>
                <Input
                  id="biomassConsumedInCogenerationKgPerYear"
                  name="biomassConsumedInCogenerationKgPerYear"
                  placeholder="Ex.: 0,00 (deixe vazio se não houver co-geração)"
                  value={data.biomassConsumedInCogenerationKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.biomassConsumedInCogenerationKgPerYear}
                />
                <span className="text-xs text-gray-500">kg/ano</span>
                <FieldError
                  errors={
                    errors.biomassConsumedInCogenerationKgPerYear
                      ? [
                          {
                            message:
                              errors.biomassConsumedInCogenerationKgPerYear,
                          },
                        ]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      {/* Energia - Eletricidade */}
      <FieldSet>
        <FieldLegend className="flex items-center text-soil-800">
          <MdEnergySavingsLeaf className="inline mr-2 size-5" /> Energia -
          Eletricidade
        </FieldLegend>
        <FieldGroup className="flex gap-3">
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="gridMixMediumVoltage">
                Eletricidade da rede - mix média voltagem
              </FieldLabel>
              <FieldContent>
                <Input
                  id="gridMixMediumVoltage"
                  name="gridMixMediumVoltage"
                  placeholder="Ex.: 1.000,00"
                  value={data.gridMixMediumVoltage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.gridMixMediumVoltage}
                />
                <span className="text-xs text-gray-500">kWh/ano</span>
                <FieldError
                  errors={
                    errors.gridMixMediumVoltage
                      ? [{ message: errors.gridMixMediumVoltage }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="gridMixHighVoltage">
                Eletricidade da rede - mix alta voltagem
              </FieldLabel>
              <FieldContent>
                <Input
                  id="gridMixHighVoltage"
                  name="gridMixHighVoltage"
                  placeholder="Ex.: 1.000,00"
                  value={data.gridMixHighVoltage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.gridMixHighVoltage}
                />
                <span className="text-xs text-gray-500">kWh/ano</span>
                <FieldError
                  errors={
                    errors.gridMixHighVoltage
                      ? [{ message: errors.gridMixHighVoltage }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="electricityPCH">
                Eletricidade - PCH
              </FieldLabel>
              <FieldContent>
                <Input
                  id="electricityPCH"
                  name="electricityPCH"
                  placeholder="Ex.: 1.000,00"
                  value={data.electricityPCH}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.electricityPCH}
                />
                <span className="text-xs text-gray-500">kWh/ano</span>
                <FieldError
                  errors={
                    errors.electricityPCH
                      ? [{ message: errors.electricityPCH }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="electricityBiomass">
                Eletricidade - biomassa
              </FieldLabel>
              <FieldContent>
                <Input
                  id="electricityBiomass"
                  name="electricityBiomass"
                  placeholder="Ex.: 1.000,00"
                  value={data.electricityBiomass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.electricityBiomass}
                />
                <span className="text-xs text-gray-500">kWh/ano</span>
                <FieldError
                  errors={
                    errors.electricityBiomass
                      ? [{ message: errors.electricityBiomass }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="electricityDiesel">
                Eletricidade - óleo diesel
              </FieldLabel>
              <FieldContent>
                <Input
                  id="electricityDiesel"
                  name="electricityDiesel"
                  placeholder="Ex.: 1.000,00"
                  value={data.electricityDiesel}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.electricityDiesel}
                />
                <span className="text-xs text-gray-500">kWh/ano</span>
                <FieldError
                  errors={
                    errors.electricityDiesel
                      ? [{ message: errors.electricityDiesel }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="electricitySolar">
                Eletricidade - solar
              </FieldLabel>
              <FieldContent>
                <Input
                  id="electricitySolar"
                  name="electricitySolar"
                  placeholder="Ex.: 1.000,00"
                  value={data.electricitySolar}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.electricitySolar}
                />
                <span className="text-xs text-gray-500">kWh/ano</span>
                <FieldError
                  errors={
                    errors.electricitySolar
                      ? [{ message: errors.electricitySolar }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="electricityImpactFactorKgCO2PerKWh">
                Fator de impacto do consumo de eletricidade
              </FieldLabel>
              <FieldContent>
                <Input
                  id="electricityImpactFactorKgCO2PerKWh"
                  name="electricityImpactFactorKgCO2PerKWh"
                  placeholder="Preenchimento automático"
                  value={data.electricityImpactFactorKgCO2PerKWh}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.electricityImpactFactorKgCO2PerKWh}
                  disabled
                />
                <span className="text-xs text-gray-500">kg CO₂/ kWh</span>
                <FieldError
                  errors={
                    errors.electricityImpactFactorKgCO2PerKWh
                      ? [{ message: errors.electricityImpactFactorKgCO2PerKWh }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="electricityImpactResultKgCO2PerMJ">
                Impacto do consumo de eletricidade
              </FieldLabel>
              <FieldContent>
                <Input
                  id="electricityImpactResultKgCO2PerMJ"
                  name="electricityImpactResultKgCO2PerMJ"
                  placeholder="Preenchimento automático"
                  value={data.electricityImpactResultKgCO2PerMJ}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.electricityImpactResultKgCO2PerMJ}
                  disabled
                />
                <span className="text-xs text-gray-500">kg CO₂/MJ</span>
                <FieldError
                  errors={
                    errors.electricityImpactResultKgCO2PerMJ
                      ? [{ message: errors.electricityImpactResultKgCO2PerMJ }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      {/* Energia - Combustível */}
      <FieldSet>
        <FieldLegend className="flex items-center text-soil-800">
          <BsFillFuelPumpFill className="inline mr-2 size-5" /> Energia -
          Combustível
        </FieldLegend>
        <FieldGroup className="flex gap-3">
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="fuelDieselLitersPerYear">Diesel</FieldLabel>
              <FieldContent>
                <Input
                  id="fuelDieselLitersPerYear"
                  name="fuelDieselLitersPerYear"
                  placeholder="Ex.: 500,00"
                  value={data.fuelDieselLitersPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelDieselLitersPerYear}
                />
                <span className="text-xs text-gray-500">Litros/ano</span>
                <FieldError
                  errors={
                    errors.fuelDieselLitersPerYear
                      ? [{ message: errors.fuelDieselLitersPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="fuelNaturalGasNm3PerYear">
                Gás natural
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fuelNaturalGasNm3PerYear"
                  name="fuelNaturalGasNm3PerYear"
                  placeholder="Ex.: 200,00"
                  value={data.fuelNaturalGasNm3PerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelNaturalGasNm3PerYear}
                />
                <span className="text-xs text-gray-500">Nm³/ano</span>
                <FieldError
                  errors={
                    errors.fuelNaturalGasNm3PerYear
                      ? [{ message: errors.fuelNaturalGasNm3PerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="fuelLPGKgPerYear">GLP</FieldLabel>
              <FieldContent>
                <Input
                  id="fuelLPGKgPerYear"
                  name="fuelLPGKgPerYear"
                  placeholder="Ex.: 100,00"
                  value={data.fuelLPGKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelLPGKgPerYear}
                />
                <span className="text-xs text-gray-500">kg/ano</span>
                <FieldError
                  errors={
                    errors.fuelLPGKgPerYear
                      ? [{ message: errors.fuelLPGKgPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="fuelGasolineALitersPerYear">
                Gasolina A
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fuelGasolineALitersPerYear"
                  name="fuelGasolineALitersPerYear"
                  placeholder="Ex.: 500,00"
                  value={data.fuelGasolineALitersPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelGasolineALitersPerYear}
                />
                <span className="text-xs text-gray-500">Litros/ano</span>
                <FieldError
                  errors={
                    errors.fuelGasolineALitersPerYear
                      ? [{ message: errors.fuelGasolineALitersPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="fuelEthanolAnhydrousLitersPerYear">
                Etanol anidro
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fuelEthanolAnhydrousLitersPerYear"
                  name="fuelEthanolAnhydrousLitersPerYear"
                  placeholder="Ex.: 500,00"
                  value={data.fuelEthanolAnhydrousLitersPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelEthanolAnhydrousLitersPerYear}
                />
                <span className="text-xs text-gray-500">Litros/ano</span>
                <FieldError
                  errors={
                    errors.fuelEthanolAnhydrousLitersPerYear
                      ? [{ message: errors.fuelEthanolAnhydrousLitersPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="fuelEthanolHydratedLitersPerYear">
                Etanol hidratado
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fuelEthanolHydratedLitersPerYear"
                  name="fuelEthanolHydratedLitersPerYear"
                  placeholder="Ex.: 500,00"
                  value={data.fuelEthanolHydratedLitersPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelEthanolHydratedLitersPerYear}
                />
                <span className="text-xs text-gray-500">Litros/ano</span>
                <FieldError
                  errors={
                    errors.fuelEthanolHydratedLitersPerYear
                      ? [{ message: errors.fuelEthanolHydratedLitersPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="fuelWoodChipsKgPerYear">
                Cavaco de madeira
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fuelWoodChipsKgPerYear"
                  name="fuelWoodChipsKgPerYear"
                  placeholder="Ex.: 100,00"
                  value={data.fuelWoodChipsKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelWoodChipsKgPerYear}
                />
                <span className="text-xs text-gray-500">kg/ano</span>
                <FieldError
                  errors={
                    errors.fuelWoodChipsKgPerYear
                      ? [{ message: errors.fuelWoodChipsKgPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="fuelFirewoodKgPerYear">Lenha</FieldLabel>
              <FieldContent>
                <Input
                  id="fuelFirewoodKgPerYear"
                  name="fuelFirewoodKgPerYear"
                  placeholder="Ex.: 100,00"
                  value={data.fuelFirewoodKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelFirewoodKgPerYear}
                />
                <span className="text-xs text-gray-500">kg/ano</span>
                <FieldError
                  errors={
                    errors.fuelFirewoodKgPerYear
                      ? [{ message: errors.fuelFirewoodKgPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="fuelProductionImpactKgCO2PerYear">
                Impacto da produção de combustível (preenchimento automático)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fuelProductionImpactKgCO2PerYear"
                  name="fuelProductionImpactKgCO2PerYear"
                  placeholder="Preenchimento automático"
                  value={data.fuelProductionImpactKgCO2PerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.fuelProductionImpactKgCO2PerYear}
                  disabled
                />
                <span className="text-xs text-gray-500">kg CO₂/ano</span>
                <FieldError
                  errors={
                    errors.fuelProductionImpactKgCO2PerYear
                      ? [{ message: errors.fuelProductionImpactKgCO2PerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="fuelStationaryCombustionImpactKgCO2PerYear">
                Impacto da combustão estacionária (preenchimento automático)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fuelStationaryCombustionImpactKgCO2PerYear"
                  name="fuelStationaryCombustionImpactKgCO2PerYear"
                  placeholder="Preenchimento automático"
                  value={data.fuelStationaryCombustionImpactKgCO2PerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={
                    !!errors.fuelStationaryCombustionImpactKgCO2PerYear
                  }
                  disabled
                />
                <span className="text-xs text-gray-500">kg CO₂/ano</span>
                <FieldError
                  errors={
                    errors.fuelStationaryCombustionImpactKgCO2PerYear
                      ? [
                          {
                            message:
                              errors.fuelStationaryCombustionImpactKgCO2PerYear,
                          },
                        ]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="fuelConsumptionImpactKgCO2PerMJ">
                Impacto do consumo de combustível
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fuelConsumptionImpactKgCO2PerMJ"
                  name="fuelConsumptionImpactKgCO2PerMJ"
                  placeholder="Preenchimento automático"
                  value={data.fuelConsumptionImpactKgCO2PerMJ}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.fuelConsumptionImpactKgCO2PerMJ}
                  disabled
                />
                <span className="text-xs text-gray-500">kg CO₂/MJ</span>
                <FieldError
                  errors={
                    errors.fuelConsumptionImpactKgCO2PerMJ
                      ? [{ message: errors.fuelConsumptionImpactKgCO2PerMJ }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      {/* Co-geração (Aproveitamento energético) */}
      <FieldSet>
        <FieldLegend className="flex items-center text-soil-800">
          <MdLocalFireDepartment className="inline mr-2 size-5" /> Co-geração
          (Aproveitamento energético)
        </FieldLegend>
        <FieldGroup className="flex gap-3">
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="biomassCombustionEmissionFactorKgCO2PerKg">
                Fator de emissão da combustão da biomassa
              </FieldLabel>
              <FieldContent>
                <Input
                  id="biomassCombustionEmissionFactorKgCO2PerKg"
                  name="biomassCombustionEmissionFactorKgCO2PerKg"
                  placeholder="Preenchimento automático"
                  value={data.biomassCombustionEmissionFactorKgCO2PerKg}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled
                  aria-invalid={
                    !!errors.biomassCombustionEmissionFactorKgCO2PerKg
                  }
                />
                <span className="text-xs text-gray-500">
                  kg CO₂/ kg de biomassa queimada
                </span>
                <FieldError
                  errors={
                    errors.biomassCombustionEmissionFactorKgCO2PerKg
                      ? [
                          {
                            message:
                              errors.biomassCombustionEmissionFactorKgCO2PerKg,
                          },
                        ]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="biomassCombustionImpactKgCO2PerYear">
                Impacto da combustão da biomassa (preenchimento automático)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="biomassCombustionImpactKgCO2PerYear"
                  name="biomassCombustionImpactKgCO2PerYear"
                  placeholder="Preenchimento automático"
                  value={data.biomassCombustionImpactKgCO2PerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.biomassCombustionImpactKgCO2PerYear}
                  disabled
                />
                <span className="text-xs text-gray-500">kg CO₂/ano</span>
                <FieldError
                  errors={
                    errors.biomassCombustionImpactKgCO2PerYear
                      ? [
                          {
                            message: errors.biomassCombustionImpactKgCO2PerYear,
                          },
                        ]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="biomassCombustionImpactKgCO2PerMJ">
                Impacto da combustão da biomassa
              </FieldLabel>
              <FieldContent>
                <Input
                  id="biomassCombustionImpactKgCO2PerMJ"
                  name="biomassCombustionImpactKgCO2PerMJ"
                  placeholder="Preenchimento automático"
                  value={data.biomassCombustionImpactKgCO2PerMJ}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.biomassCombustionImpactKgCO2PerMJ}
                  disabled
                />
                <span className="text-xs text-gray-500">kg CO₂/MJ</span>
                <FieldError
                  errors={
                    errors.biomassCombustionImpactKgCO2PerMJ
                      ? [{ message: errors.biomassCombustionImpactKgCO2PerMJ }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      {/* Insumos de manufatura */}
      <FieldSet>
        <FieldLegend className="flex items-center text-soil-800">
          <MdHandyman className="inline mr-2 size-5" /> Insumos de manufatura
        </FieldLegend>
        <FieldGroup className="flex gap-3">
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="waterLitersPerYear">Água</FieldLabel>
              <FieldContent>
                <Input
                  id="waterLitersPerYear"
                  name="waterLitersPerYear"
                  placeholder="Ex.: 500,00"
                  value={data.waterLitersPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.waterLitersPerYear}
                />
                <span className="text-xs text-gray-500">litros/ano</span>
                <FieldError
                  errors={
                    errors.waterLitersPerYear
                      ? [{ message: errors.waterLitersPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="lubricantOilKgPerYear">
                Óleo lubrificante
              </FieldLabel>
              <FieldContent>
                <Input
                  id="lubricantOilKgPerYear"
                  name="lubricantOilKgPerYear"
                  placeholder="Ex.: 100,00"
                  value={data.lubricantOilKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.lubricantOilKgPerYear}
                />
                <span className="text-xs text-gray-500">kg/ano</span>
                <FieldError
                  errors={
                    errors.lubricantOilKgPerYear
                      ? [{ message: errors.lubricantOilKgPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="silicaSandKgPerYear">
                Areia de sílica
              </FieldLabel>
              <FieldContent>
                <Input
                  id="silicaSandKgPerYear"
                  name="silicaSandKgPerYear"
                  placeholder="Ex.: 100,00"
                  value={data.silicaSandKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.silicaSandKgPerYear}
                />
                <span className="text-xs text-gray-500">kg/ano</span>
                <FieldError
                  errors={
                    errors.silicaSandKgPerYear
                      ? [{ message: errors.silicaSandKgPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="manufacturingImpactKgCO2eqPerYear">
                Impacto da fase industrial
              </FieldLabel>
              <FieldContent>
                <Input
                  id="manufacturingImpactKgCO2eqPerYear"
                  name="manufacturingImpactKgCO2eqPerYear"
                  placeholder="Preenchimento automático"
                  value={data.manufacturingImpactKgCO2eqPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.manufacturingImpactKgCO2eqPerYear}
                  disabled
                />
                <span className="text-xs text-gray-500">kg CO₂ eq./ano</span>
                <FieldError
                  errors={
                    errors.manufacturingImpactKgCO2eqPerYear
                      ? [{ message: errors.manufacturingImpactKgCO2eqPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="manufacturingImpactKgCO2eqPerMJ">
                Impacto da fase industrial
              </FieldLabel>
              <FieldContent>
                <Input
                  id="manufacturingImpactKgCO2eqPerMJ"
                  name="manufacturingImpactKgCO2eqPerMJ"
                  placeholder="Preenchimento automático"
                  value={data.manufacturingImpactKgCO2eqPerMJ}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.manufacturingImpactKgCO2eqPerMJ}
                  disabled
                />
                <span className="text-xs text-gray-500">kg CO₂ eq./ MJ</span>
                <FieldError
                  errors={
                    errors.manufacturingImpactKgCO2eqPerMJ
                      ? [{ message: errors.manufacturingImpactKgCO2eqPerMJ }]
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
