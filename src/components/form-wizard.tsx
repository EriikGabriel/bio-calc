import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Stepper, type Step as StepperStep } from "@/components/ui/stepper"
import { CalculationProvider } from "@/context/calculation"
import { cn } from "@/lib/utils"
import { calculatePhases } from "@/services/calc-api"
import { CalculateRequest, CalculateResponse } from "@/types/api"
import React, { useEffect, useState } from "react"

export type WizardStep = StepperStep & {
  content: React.ReactNode
  onValidate?: () => boolean | Promise<boolean>
}

type FormWizardProps = {
  steps: WizardStep[]
  initialStep?: number
  className?: string
  /** Called when the last step is completed. */
  onFinish?: (result: CalculateResponse | null) => void | Promise<void>
  /** Provide the full API payload composed from all form sections. */
  getPayload?: () => CalculateRequest
  /** Provide API payload up to a specific step index (inclusive). */
  getPayloadForStep?: (index: number) => CalculateRequest
  /** Optional callback after a step computation. */
  onStepComputed?: (index: number, result: CalculateResponse) => void
}

export function FormWizard({
  steps,
  initialStep = 0,
  className,
  onFinish,
  getPayload,
  getPayloadForStep,
  onStepComputed,
}: FormWizardProps) {
  const [current, setCurrent] = React.useState(initialStep)
  const isLast = current === steps.length - 1
  const [result, setResult] = useState<CalculateResponse | null>(null)
  const [resultsByStep, setResultsByStep] = useState<
    Record<number, CalculateResponse>
  >({})
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleNext() {
    const step = steps[current]
    let ok = true
    if (step?.onValidate) ok = await step.onValidate()
    if (!ok) {
      console.warn(
        `Validação falhou na etapa ${current} (${
          step?.id ?? "sem-id"
        }). Não chamando a API.`
      )
      setValidationError(
        "Existem campos obrigatórios ou inválidos nesta etapa. Corrija para continuar."
      )
      return
    }
    // Clear any previous validation message upon success
    setValidationError(null)

    // If it's the first step (etapa 0), it's only company info.
    // Skip API computation and just advance to the next step.
    if (current === 0) {
      if (isLast) {
        // Edge case: wizard has only one step. In that case, compute with full payload.
        const payloadForCurrent: CalculateRequest =
          (getPayloadForStep?.(current) as CalculateRequest) ??
          (getPayload?.() as CalculateRequest)
        setIsLoading(true)
        const data = await calculatePhases(payloadForCurrent).finally(() =>
          setIsLoading(false)
        )
        setResult(data)
        setResultsByStep((prev) => ({ ...prev, [current]: data }))
        onStepComputed?.(current, data)
        await onFinish?.(data)
        return
      }
      setCurrent((i) => Math.min(i + 1, steps.length - 1))
      return
    }

    // Compute for the current step before proceeding
    // Build a safe payload for the current step. If getPayloadForStep is not provided,
    // fall back to the full payload; otherwise ensure it matches CalculateRequest.
    const payloadForCurrent: CalculateRequest =
      (getPayloadForStep?.(current) as CalculateRequest) ??
      (getPayload?.() as CalculateRequest)
    setIsLoading(true)
    const data = await calculatePhases(payloadForCurrent).finally(() =>
      setIsLoading(false)
    )
    setResult(data)
    setResultsByStep((prev) => ({ ...prev, [current]: data }))
    onStepComputed?.(current, data)

    if (isLast) {
      const payload: CalculateRequest =
        (getPayload?.() as CalculateRequest) ?? payloadForCurrent
      const finalData =
        payload === payloadForCurrent
          ? data
          : await (async () => {
              setIsLoading(true)
              try {
                return await calculatePhases(payload)
              } finally {
                setIsLoading(false)
              }
            })()
      setResult(finalData)
      await onFinish?.(finalData)
      return
    }
    setCurrent((i) => Math.min(i + 1, steps.length - 1))
  }

  function handleBack() {
    setCurrent((i) => Math.max(i - 1, 0))
  }

  function handleStepClick(index: number) {
    if (index <= current) setCurrent(index)
  }

  useEffect(() => {
    if (result) console.log(result)
  }, [result])

  return (
    <CalculationProvider
      value={{
        currentStep: current,
        setCurrentStep: setCurrent,
        lastResult: result,
        setLastResult: setResult,
        resultsByStep,
        setResultsByStep,
      }}
    >
      <div
        className={cn(
          "w-full rounded-xl border border-cedar-700 bg-cedar-700/40 shadow-sm",
          className
        )}
      >
        <div className="sticky top-0 z-10 rounded-t-xl border-b border-cedar-700 bg-cedar-700 backdrop-blur p-4">
          <Stepper
            steps={steps}
            current={current}
            onStepClick={handleStepClick}
          />
        </div>

        <div className="p-6">
          <div className="min-h-48 rounded-lg border border-cedar-700/30 bg-herb-300/20 p-4">
            {steps[current]?.content}
          </div>

          <Separator className="my-2 bg-transparent" />

          {validationError && (
            <div className="mb-3 rounded-md border border-red-300 bg-red-100/60 px-3 py-2 text-sm text-red-800">
              {validationError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={current === 0}
            >
              Voltar
            </Button>
            <Button
              type="button"
              className="min-w-40 bg-soil-800"
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? "Calculando..." : isLast ? "Calcular" : "Próximo"}
            </Button>
          </div>
        </div>
      </div>
    </CalculationProvider>
  )
}
