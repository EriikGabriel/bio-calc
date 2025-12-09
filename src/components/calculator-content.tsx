import { FormWizard } from "@/components/form-wizard"
import type { CalculateResponse } from "@/types/api"
import type { FieldErrors } from "@/types/forms"
import { buildFullPayload, buildPayloadForStep } from "@/utils/payload-builders"
import { isEmpty } from "@/utils/validations/common"
import { validateDistributionPhase } from "@/utils/validations/distribution-phase-validation"
import { validateIndustrialPhase } from "@/utils/validations/industrial-phase-validation"
import {
  AGRICULTURAL_PHASE_INITIAL,
  COMPANY_INFO_INITIAL,
  DISTRIBUTION_PHASE_INITIAL,
  INDUSTRIAL_PHASE_INITIAL,
} from "@constants/initial-states"
import { TabsContent } from "@ui/tabs"
import { validateAgriculturalPhase } from "@utils/validations/agricultural-phase-validation"
import { validateCompanyInfo } from "@utils/validations/company-info-validation"
import { BarChart3, Calculator } from "lucide-react"
import { useState } from "react"
import { ResultsSection } from "./results-section"
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

type CalculatorContentProps = {
  onResultsReady?: (result: CalculateResponse | null) => void
}

export function CalculatorContent({
  onResultsReady,
}: CalculatorContentProps = {}) {
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

  const [calculationResult, setCalculationResult] =
    useState<CalculateResponse | null>(null)

  function validateAll() {
    const v1 = validateCompanyInfo(companyInfo)
    const v2 = validateAgriculturalPhase(agriculturalData)
    const v3 = validateIndustrialPhase(industrialData)
    const v4 = validateDistributionPhase(distributionData)
    setCompanyErrors(v1)
    setAgriculturalErrors(v2)
    setIndustrialErrors(v3)
    setDistributionErrors(v4)
    return [v1, v2, v3, v4]
  }

  async function handleFinish(result: CalculateResponse | null) {
    const [v1, v2, v3, v4] = validateAll()
    if (
      Object.keys(v1).length === 0 &&
      Object.keys(v2).length === 0 &&
      Object.keys(v3).length === 0 &&
      Object.keys(v4).length === 0
    ) {
      console.log("Cálculo finalizado com sucesso!", result)
      setCalculationResult(result)
      // Notificar o componente pai para mudar de aba
      onResultsReady?.(result)
    }
  }

  return (
    <>
      <TabsContent
        value="calculator"
        className="border-cedar-700 bg-green-50/60 border rounded-2xl min-h-80 text-soil-800 p-5"
      >
        <div>
          <div className="flex gap-2 text-forest-600 items-center">
            <Calculator className="size-8 text-forest-600" />
            <div>
              <h1 className="font-semibold">
                Calculadora para contabilização de Eficiência
                Energético-Ambiental para biocombustíveis sólidos (Pellets ou
                Briquetes)
              </h1>
              <p className="text-cedar-700 text-sm">
                Estima a eficiência energético-ambiental de pellets e briquetes
                considerando poder calorífico, umidade, densidade, energia
                usada, emissões no transporte e origem da biomassa.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <FormWizard
              onFinish={handleFinish}
              getPayload={() =>
                buildFullPayload(
                  agriculturalData,
                  industrialData,
                  distributionData
                )
              }
              getPayloadForStep={(index) => {
                return buildPayloadForStep(
                  index,
                  agriculturalData,
                  industrialData,
                  distributionData
                )
              }}
              steps={[
                {
                  id: "company",
                  label: "Empresa",
                  description: "Informações gerais",
                  content: (
                    <CompanyInfoSection
                      data={companyInfo}
                      errors={companyErrors}
                      onFieldChange={(name, value) => {
                        setCompanyInfo((d) => ({ ...d, [name]: value }))
                      }}
                      onFieldBlur={(name) => {
                        // Validar e remover erro do campo específico se estiver correto
                        const fullValidation = validateCompanyInfo({
                          ...companyInfo,
                        })
                        if (!fullValidation[name]) {
                          setCompanyErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors[name]
                            return newErrors
                          })
                        } else {
                          setCompanyErrors((prev) => ({
                            ...prev,
                            [name]: fullValidation[name],
                          }))
                        }
                      }}
                    />
                  ),
                  onValidate: () => {
                    const v = validateCompanyInfo(companyInfo)
                    setCompanyErrors(v)
                    return Object.keys(v).length === 0
                  },
                },
                {
                  id: "agricultural",
                  label: "Fase Agrícola",
                  description: "Origem e preparo da biomassa",
                  content: (
                    <AgriculturalPhaseSection
                      data={agriculturalData}
                      errors={agriculturalErrors}
                      onFieldChange={(name, value) => {
                        setAgriculturalData((d) => {
                          return { ...d, [name]: value }
                        })
                      }}
                      onFieldBlur={(name) => {
                        // Validar e remover erro do campo específico se estiver correto
                        const fullValidation = validateAgriculturalPhase({
                          ...agriculturalData,
                        })

                        // Se o campo biomassType mudou, verificar se deve remover erro de woodResidueLifecycleStage
                        if (name === "biomassType") {
                          const isWoodResidue =
                            /^Resíduo de (Pinus|Eucaliptus)$/i.test(
                              agriculturalData.biomassType
                            )
                          // Se não for resíduo de madeira, remover erro de woodResidueLifecycleStage
                          if (
                            !isWoodResidue &&
                            !isEmpty(agriculturalData.biomassType)
                          ) {
                            setAgriculturalErrors((prev) => {
                              const newErrors = { ...prev }
                              delete newErrors.woodResidueLifecycleStage
                              return newErrors
                            })
                          }
                        }

                        if (!fullValidation[name]) {
                          setAgriculturalErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors[name]
                            return newErrors
                          })
                        } else {
                          setAgriculturalErrors((prev) => ({
                            ...prev,
                            [name]: fullValidation[name],
                          }))
                        }
                      }}
                    />
                  ),
                  onValidate: () => {
                    const v = validateAgriculturalPhase(agriculturalData)
                    setAgriculturalErrors(v)
                    return Object.keys(v).length === 0
                  },
                },
                {
                  id: "industrial",
                  label: "Fase Industrial",
                  description: "Produção e energia",
                  content: (
                    <IndustrialPhaseSection
                      data={industrialData}
                      errors={industrialErrors}
                      onFieldChange={(name, value) => {
                        setIndustrialData((d) => ({ ...d, [name]: value }))
                      }}
                      onFieldBlur={(name) => {
                        // Validar e remover erro do campo específico se estiver correto
                        const fullValidation = validateIndustrialPhase({
                          ...industrialData,
                        })
                        if (!fullValidation[name]) {
                          setIndustrialErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors[name]
                            return newErrors
                          })
                        } else {
                          setIndustrialErrors((prev) => ({
                            ...prev,
                            [name]: fullValidation[name],
                          }))
                        }
                      }}
                      previousPhases={{
                        agricultural: agriculturalData,
                      }}
                    />
                  ),
                  onValidate: () => {
                    const v = validateIndustrialPhase(industrialData)
                    setIndustrialErrors(v)
                    return Object.keys(v).length === 0
                  },
                },
                {
                  id: "distribution",
                  label: "Distribuição",
                  description: "Transporte e entrega",
                  content: (
                    <DistributionPhaseSection
                      data={distributionData}
                      errors={distributionErrors}
                      onFieldChange={(name, value) => {
                        setDistributionData((d) => ({ ...d, [name]: value }))
                      }}
                      onFieldBlur={(name) => {
                        // Validar e remover erro do campo específico se estiver correto
                        const fullValidation = validateDistributionPhase({
                          ...distributionData,
                        })
                        if (!fullValidation[name]) {
                          setDistributionErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors[name]
                            return newErrors
                          })
                        } else {
                          setDistributionErrors((prev) => ({
                            ...prev,
                            [name]: fullValidation[name],
                          }))
                        }
                      }}
                      previousPhases={{
                        agricultural: agriculturalData,
                        industrial: industrialData,
                      }}
                    />
                  ),
                  onValidate: () => {
                    const v = validateDistributionPhase(distributionData)
                    setDistributionErrors(v)
                    return Object.keys(v).length === 0
                  },
                },
              ]}
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="results"
        className="border-cedar-700 bg-green-50/60 border rounded-2xl min-h-80 text-soil-800 p-5"
      >
        <div>
          <div className="flex gap-2 text-forest-600 items-center mb-4">
            <BarChart3 className="size-8 text-forest-600" />
            <div>
              <h1 className="font-semibold">Resultados da Análise</h1>
              <p className="text-cedar-700 text-sm">
                Visualização dos resultados do cálculo de eficiência
                energético-ambiental
              </p>
            </div>
          </div>
          <ResultsSection
            result={calculationResult}
            companyName={companyInfo.companyName}
            biomassType={agriculturalData.biomassType}
          />
        </div>
      </TabsContent>
    </>
  )
}
