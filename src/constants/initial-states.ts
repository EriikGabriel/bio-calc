import type { CompanyFormData } from "@components/sections/company-info-section"
import type { AgriculturalPhaseFormData } from "@components/sections/agricultural-phase-section"

export const COMPANY_INFO_INITIAL: CompanyFormData = {
  companyName: "",
  taxId: "",
  state: "",
  city: "",
  contactPerson: "",
  phone: "",
  email: "",
}

export const AGRICULTURAL_PHASE_INITIAL: AgriculturalPhaseFormData = {
  biomassType: "",
  hasConsumptionInfo: "",
  biomassInputSpecific: "",
  biomassImpactFactor: "",
  biomassCalorificValue: "",
  cornStarchInput: "",
  cornStarchConsumptionFactor: "",
  cornStarchImpact: "",
  biomassProductionImpact: "",
}
