import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Stepper, type Step as StepperStep } from "@/components/ui/stepper"
import { cn } from "@/lib/utils"
import React from "react"

export type WizardStep = StepperStep & {
  content: React.ReactNode
  /**
   * Optional validate handler for this step. Should return true when the step is valid.
   * Can also trigger external state updates for error messages.
   */
  onValidate?: () => boolean | Promise<boolean>
}

type FormWizardProps = {
  steps: WizardStep[]
  initialStep?: number
  className?: string
  /** Called when the last step is completed. */
  onFinish?: () => void | Promise<void>
}

export function FormWizard({
  steps,
  initialStep = 0,
  className,
  onFinish,
}: FormWizardProps) {
  const [current, setCurrent] = React.useState(initialStep)
  const isLast = current === steps.length - 1

  async function handleNext() {
    // Validate current step first, then move forward exactly one step
    const step = steps[current]
    let ok = true
    if (step?.onValidate) {
      ok = await step.onValidate()
    }
    if (!ok) return

    // Recompute last status based on current index
    const last = current === steps.length - 1
    if (last) {
      await onFinish?.()
      return
    }

    setCurrent((i) => Math.min(i + 1, steps.length - 1))
  }

  function handleBack() {
    setCurrent((i) => Math.max(i - 1, 0))
  }

  function handleStepClick(index: number) {
    // Allow navigating back freely, prevent jumping ahead without validating
    if (index <= current) setCurrent(index)
  }

  return (
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
          >
            {isLast ? "Calcular" : "Próximo"}
          </Button>
        </div>
      </div>
    </div>
  )
}
