import type { FieldErrors } from "@/types/forms"
import { validateDistributionPhase } from "@/utils/validations/distribution-phase-validation"
import { validateIndustrialPhase } from "@/utils/validations/industrial-phase-validation"
import {
  AGRICULTURAL_PHASE_INITIAL,
  COMPANY_INFO_INITIAL,
  DISTRIBUTION_PHASE_INITIAL,
  INDUSTRIAL_PHASE_INITIAL,
} from "@constants/initial-states"
import { Button } from "@ui/button"
import { TabsContent } from "@ui/tabs"
import { validateAgriculturalPhase } from "@utils/validations/agricultural-phase-validation"
import { validateCompanyInfo } from "@utils/validations/company-info-validation"
import { Calculator } from "lucide-react"
import { useState } from "react"
import type {
  AgriculturalPhaseFieldErrors,
  AgriculturalPhaseFormData,
} from "./sections/agricultural-phase-section"
import { AgriculturalPhaseSection } from "./sections/agricultural-phase-section"
import type {
  CompanyFieldErrors,
  CompanyFormData,
} from "./sections/company-info-section"
import { CompanyInfoSection } from "./sections/company-info-section"
import DistributionPhaseSection from "./sections/distribution-phase-section"
import {
  IndustrialPhaseSection,
  type IndustrialPhaseFieldErrors,
  type IndustrialPhaseFormData,
} from "./sections/industrial-phase-section"

export function CalculatorContent() {
  const [companyInfo, setCompanyInfo] =
    useState<CompanyFormData>(COMPANY_INFO_INITIAL)
  const [companyErrors, setCompanyErrors] = useState<CompanyFieldErrors>({})
  const [agriculturalData, setAgriculturalData] =
    useState<AgriculturalPhaseFormData>(AGRICULTURAL_PHASE_INITIAL)
  const [agriculturalErrors, setAgriculturalErrors] =
    useState<AgriculturalPhaseFieldErrors>({})

  const [industrialData, setIndustrialData] = useState<IndustrialPhaseFormData>(
    INDUSTRIAL_PHASE_INITIAL
  )
  const [industrialErrors, setIndustrialErrors] =
    useState<IndustrialPhaseFieldErrors>({})

  const [distributionData, setDistributionData] = useState(
    DISTRIBUTION_PHASE_INITIAL
  )
  const [distributionErrors, setDistributionErrors] = useState<FieldErrors>({})

  function handleSubmitAll(e: React.FormEvent) {
    e.preventDefault()
    const v1 = validateCompanyInfo(companyInfo)
    const v2 = validateAgriculturalPhase(agriculturalData)
    const v3 = validateIndustrialPhase(industrialData)
    const v4 = validateDistributionPhase(distributionData)
    setCompanyErrors(v1)
    setAgriculturalErrors(v2)
    setIndustrialErrors(v3)
    setDistributionErrors(v4)
    if (
      Object.keys(v1).length === 0 &&
      Object.keys(v2).length === 0 &&
      Object.keys(v3).length === 0 &&
      Object.keys(v4).length === 0
    ) {
      console.log("Payload completo:", {
        companyInfo,
        agriculturalData,
        industrialData,
        distributionData,
      })
    }
  }

  return (
    <TabsContent
      value="calculator"
      className="border-cedar-700 bg-green-50 border rounded-2xl min-h-80 text-soil-800 p-5"
    >
      <div>
        <div className="flex gap-2 text-forest-600 items-center">
          <Calculator className="size-8 text-forest-600" />
          <div>
            <h1 className="font-semibold">
              Calculadora para contabilização de Eficiência Energético-Ambiental
              para biocombustíveis sólidos (Pellets ou Briquetes)
            </h1>
            <p className="text-neutral-600 font-light text-sm">
              Estima a eficiência energético-ambiental de pellets e briquetes
              considerando poder calorífico, umidade, densidade, energia usada,
              emissões no transporte e origem da biomassa.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmitAll} className="mt-4 space-y-10" noValidate>
          <CompanyInfoSection
            data={companyInfo}
            errors={companyErrors}
            onFieldChange={(name, value) => {
              setCompanyInfo((d) => ({ ...d, [name]: value }))
            }}
            onFieldBlur={() => {
              setCompanyErrors(validateCompanyInfo(companyInfo))
            }}
          />

          <AgriculturalPhaseSection
            data={agriculturalData}
            errors={agriculturalErrors}
            onFieldChange={(name, value) => {
              setAgriculturalData((d) => ({ ...d, [name]: value }))
            }}
            onFieldBlur={() => {
              setAgriculturalErrors(validateAgriculturalPhase(agriculturalData))
            }}
          />

          <IndustrialPhaseSection
            data={industrialData}
            errors={industrialErrors}
            onFieldChange={(name, value) => {
              setIndustrialData((d) => ({ ...d, [name]: value }))
            }}
            onFieldBlur={() => {
              setIndustrialErrors(validateIndustrialPhase(industrialData))
            }}
          />

          <DistributionPhaseSection
            data={distributionData}
            errors={distributionErrors}
            onFieldChange={(name, value) => {
              setDistributionData((d) => ({ ...d, [name]: value }))
            }}
            onFieldBlur={() => {
              setDistributionErrors(validateDistributionPhase(distributionData))
            }}
          />

          <div className="flex justify-end">
            <Button type="submit" className="min-w-48 bg-soil-800">
              Calcular
            </Button>
          </div>
        </form>
      </div>
    </TabsContent>
  )
}
