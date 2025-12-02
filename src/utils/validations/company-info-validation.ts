import type {
  CompanyFieldErrors,
  CompanyFormData,
} from "@components/sections/company-info-section"

export function validateCompanyInfo(form: CompanyFormData): CompanyFieldErrors {
  const errors: CompanyFieldErrors = {}
  const cnpjClean = form.taxId.replace(/\D/g, "")

  if (!form.companyName.trim()) errors.companyName = "Informe o nome da empresa"
  if (cnpjClean.length !== 14) errors.taxId = "CNPJ deve ter 14 dígitos"
  if (!form.state) errors.state = "Selecione UF"
  if (!form.city.trim()) errors.city = "Informe a cidade"
  if (!form.contactPerson.trim()) errors.contactPerson = "Informe o responsável"
  if (form.phone && form.phone.replace(/\D/g, "").length < 10)
    errors.phone = "Telefone incompleto"
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
    errors.email = "E-mail inválido"

  return errors
}
