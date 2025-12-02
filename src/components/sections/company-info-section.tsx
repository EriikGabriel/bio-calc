import { BR_STATES } from "@constants/state"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@ui/field"
import { Input } from "@ui/input"
import { formatCNPJ, formatPhoneBR } from "@utils/format"
import { Briefcase } from "lucide-react"

export interface CompanyFormData {
  companyName: string
  taxId: string
  state: string
  city: string
  contactPerson: string
  phone: string
  email: string
}

export interface CompanyFieldErrors {
  [K: string]: string | undefined
}

export function CompanyInfoSection({
  data,
  errors,
  onFieldChange,
  onFieldBlur,
}: {
  data: CompanyFormData
  errors: CompanyFieldErrors
  onFieldChange: (name: keyof CompanyFormData, value: string) => void
  onFieldBlur?: (name: keyof CompanyFormData) => void
}) {
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    let next = value
    if (name === "taxId") next = formatCNPJ(value)
    if (name === "phone") next = formatPhoneBR(value)
    onFieldChange(name as keyof CompanyFormData, next)
  }
  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name } = e.target
    onFieldBlur?.(name as keyof CompanyFormData)
  }

  return (
    <section className="space-y-6">
      <FieldSet>
        <FieldLegend className="flex items-center text-forest-600">
          <Briefcase className="inline mr-2 size-4 " /> Dados da Empresa
        </FieldLegend>
        <FieldGroup className="gap-3">
          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="companyName">Nome da Empresa *</FieldLabel>
              <FieldContent>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Ex.: Bioenergia Ltda"
                  value={data.companyName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.companyName}
                />
                <FieldError
                  errors={
                    errors.companyName ? [{ message: errors.companyName }] : []
                  }
                />
              </FieldContent>
            </Field>

            <Field orientation="vertical">
              <FieldLabel htmlFor="taxId">CNPJ *</FieldLabel>
              <FieldContent>
                <Input
                  id="taxId"
                  name="taxId"
                  placeholder="00.000.000/0000-00"
                  value={data.taxId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.taxId}
                  inputMode="numeric"
                  maxLength={18}
                />

                <FieldError
                  errors={errors.taxId ? [{ message: errors.taxId }] : []}
                />
              </FieldContent>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="state">Estado (UF) *</FieldLabel>
              <FieldContent>
                <select
                  id="state"
                  name="state"
                  value={data.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.state}
                  className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {BR_STATES.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
                <FieldError
                  errors={errors.state ? [{ message: errors.state }] : []}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="city">Cidade *</FieldLabel>
              <FieldContent>
                <Input
                  id="city"
                  name="city"
                  placeholder="Ex.: Piracicaba"
                  value={data.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.city}
                />
                <FieldError
                  errors={errors.city ? [{ message: errors.city }] : []}
                />
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="contactPerson">
              Responsável pelo preenchimento *
            </FieldLabel>
            <FieldContent>
              <Input
                id="contactPerson"
                name="contactPerson"
                placeholder="Nome completo"
                value={data.contactPerson}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!errors.contactPerson}
              />
              <FieldError
                errors={
                  errors.contactPerson
                    ? [{ message: errors.contactPerson }]
                    : []
                }
              />
            </FieldContent>
          </Field>

          <div className="flex gap-3">
            <Field>
              <FieldLabel htmlFor="phone">Telefone</FieldLabel>
              <FieldContent>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(11) 99999-0000"
                  value={data.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.phone}
                  inputMode="tel"
                  maxLength={15}
                />
                <FieldError
                  errors={errors.phone ? [{ message: errors.phone }] : []}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">E-mail *</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contato@empresa.com"
                  value={data.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.email}
                />
                <FieldError
                  errors={errors.email ? [{ message: errors.email }] : []}
                />
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>
    </section>
  )
}
