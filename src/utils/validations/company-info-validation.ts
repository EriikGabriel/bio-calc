import type {
  CompanyFieldErrors,
  CompanyFormData,
} from "@components/sections/company-info-section"
import { isEmpty, isValidEmail } from "./common"

export function validateCompanyInfo(form: CompanyFormData): CompanyFieldErrors {
  const errors: CompanyFieldErrors = {}

  // Debug: ver os valores do formulário
  console.debug("Validando formulário de empresa:", form)

  const cnpjClean = form.taxId.replace(/\D/g, "")

  if (isEmpty(form.companyName)) {
    errors.companyName = "Informe o nome da empresa"
  }

  if (cnpjClean.length !== 14) {
    errors.taxId = "CNPJ deve ter 14 dígitos"
  }

  if (isEmpty(form.state)) {
    errors.state = "Selecione UF"
  }

  if (isEmpty(form.city)) {
    errors.city = "Informe a cidade"
  }

  if (isEmpty(form.contactPerson)) {
    errors.contactPerson = "Informe o responsável"
  }

  if (!isEmpty(form.phone) && form.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Telefone incompleto"
  }

  if (isEmpty(form.email)) {
    errors.email = "E-mail é obrigatório"
  } else if (!isValidEmail(form.email)) {
    errors.email = "E-mail inválido"
  }

  // Debug: mostrar erros encontrados
  console.debug("Erros de validação:", errors)

  return errors
}
