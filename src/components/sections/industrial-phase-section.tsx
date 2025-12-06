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
  hasCogeneration: "Sim" | "Não" | ""
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
}: {
  data: IndustrialPhaseFormData
  errors: IndustrialPhaseFieldErrors
  onFieldChange: (name: keyof IndustrialPhaseFormData, value: string) => void
  onFieldBlur?: (name: keyof IndustrialPhaseFormData) => void
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
              <FieldLabel htmlFor="hasCogeneration">
                Existe co-geração de energia (aproveitamento da biomassa na
                geração de energia)
              </FieldLabel>
              <FieldContent>
                <select
                  id="hasCogeneration"
                  name="hasCogeneration"
                  value={data.hasCogeneration}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.hasCogeneration}
                  className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="" disabled>
                    Selecionar na lista suspensa
                  </option>
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
                <FieldDescription>
                  (não considerar a biomassa usada na co-geração, se houver)
                </FieldDescription>
                <FieldError
                  errors={
                    errors.hasCogeneration
                      ? [{ message: errors.hasCogeneration }]
                      : []
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="processedBiomassKgPerYear">
                Quantidade de biomassa processada
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
                <FieldDescription>kg/ano</FieldDescription>
                <FieldError
                  errors={
                    errors.processedBiomassKgPerYear
                      ? [{ message: errors.processedBiomassKgPerYear }]
                      : []
                  }
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="biomassConsumedInCogenerationKgPerYear">
                Quantidade de biomassa consumida na co-geração
              </FieldLabel>
              <FieldContent>
                <Input
                  id="biomassConsumedInCogenerationKgPerYear"
                  name="biomassConsumedInCogenerationKgPerYear"
                  placeholder="Ex.: 0,00"
                  value={data.biomassConsumedInCogenerationKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.biomassConsumedInCogenerationKgPerYear}
                />
                <FieldDescription>kg/ano</FieldDescription>
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
                  placeholder="kWh/ano"
                  value={data.gridMixMediumVoltage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.gridMixMediumVoltage}
                />
                <FieldDescription>kWh/ano</FieldDescription>
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
                  placeholder="kWh/ano"
                  value={data.gridMixHighVoltage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.gridMixHighVoltage}
                />
                <FieldDescription>kWh/ano</FieldDescription>
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
                  placeholder="kWh/ano"
                  value={data.electricityPCH}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.electricityPCH}
                />
                <FieldDescription>kWh/ano</FieldDescription>
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
                  placeholder="kWh/ano"
                  value={data.electricityBiomass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.electricityBiomass}
                />
                <FieldDescription>kWh/ano</FieldDescription>
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
                  placeholder="kWh/ano"
                  value={data.electricityDiesel}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.electricityDiesel}
                />
                <FieldDescription>kWh/ano</FieldDescription>
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
                  placeholder="kWh/ano"
                  value={data.electricitySolar}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.electricitySolar}
                />
                <FieldDescription>kWh/ano</FieldDescription>
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
                <FieldDescription>kg CO₂/ kWh</FieldDescription>
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
                <FieldDescription>kg CO₂/MJ</FieldDescription>
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
                  placeholder="Litros/ano"
                  value={data.fuelDieselLitersPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelDieselLitersPerYear}
                />
                <FieldDescription>Litros/ano</FieldDescription>
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
                  placeholder="Nm³/ano"
                  value={data.fuelNaturalGasNm3PerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelNaturalGasNm3PerYear}
                />
                <FieldDescription>Nm³/ano</FieldDescription>
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
                  placeholder="kg/ano"
                  value={data.fuelLPGKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelLPGKgPerYear}
                />
                <FieldDescription>kg/ano</FieldDescription>
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
                  placeholder="Litros/ano"
                  value={data.fuelGasolineALitersPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelGasolineALitersPerYear}
                />
                <FieldDescription>Litros/ano</FieldDescription>
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
                  placeholder="Litros/ano"
                  value={data.fuelEthanolAnhydrousLitersPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelEthanolAnhydrousLitersPerYear}
                />
                <FieldDescription>Litros/ano</FieldDescription>
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
                  placeholder="Litros/ano"
                  value={data.fuelEthanolHydratedLitersPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelEthanolHydratedLitersPerYear}
                />
                <FieldDescription>Litros/ano</FieldDescription>
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
                  placeholder="kg/ano"
                  value={data.fuelWoodChipsKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelWoodChipsKgPerYear}
                />
                <FieldDescription>kg/ano</FieldDescription>
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
                  placeholder="kg/ano"
                  value={data.fuelFirewoodKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.fuelFirewoodKgPerYear}
                />
                <FieldDescription>kg/ano</FieldDescription>
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
                <FieldDescription>kg CO₂/ano</FieldDescription>
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
                <FieldDescription>kg CO₂/ano</FieldDescription>
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
                <FieldDescription>kg CO₂/MJ</FieldDescription>
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
                  placeholder="kg CO₂/ kg de biomassa queimada"
                  value={data.biomassCombustionEmissionFactorKgCO2PerKg}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={
                    !!errors.biomassCombustionEmissionFactorKgCO2PerKg
                  }
                />
                <FieldDescription>
                  kg CO₂/ kg de biomassa queimada
                </FieldDescription>
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
                <FieldDescription>kg CO₂/ano</FieldDescription>
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
                <FieldDescription>kg CO₂/MJ</FieldDescription>
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
                  placeholder="litros/ano"
                  value={data.waterLitersPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.waterLitersPerYear}
                />
                <FieldDescription>litros/ano</FieldDescription>
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
                  placeholder="kg/ano"
                  value={data.lubricantOilKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.lubricantOilKgPerYear}
                />
                <FieldDescription>kg/ano</FieldDescription>
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
                  placeholder="kg/ano"
                  value={data.silicaSandKgPerYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="decimal"
                  aria-invalid={!!errors.silicaSandKgPerYear}
                />
                <FieldDescription>kg/ano</FieldDescription>
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
                <FieldDescription>kg CO₂ eq./ano</FieldDescription>
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
                <FieldDescription>kg CO₂ eq./ MJ</FieldDescription>
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
