import { BIOMASS_TYPES } from "@constants/biomass"
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
import { GiCorn } from "react-icons/gi"
import { MdAgriculture } from "react-icons/md"
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
}

export interface AgriculturalPhaseFieldErrors {
  [K: string]: string | undefined
}

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
      <h1 className="text-xl border-b pb-1 border-forest-600/70 font-bold flex items-center text-forest-600">
        <MdAgriculture className="inline mr-2 size-8 " /> Fase Agricola
      </h1>
      <FieldSet>
        <FieldLegend className="flex items-center text-forest-600">
          <GiCorn className="inline mr-2 size-5 " /> Produção de Biomassa
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
                  placeholder="preenchimento automático"
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
    </section>
  )
}
