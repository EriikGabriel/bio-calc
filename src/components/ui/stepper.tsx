import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import React from "react"

export type Step = {
  id: string
  label: string
  description?: string
}

type StepperProps = {
  steps: Step[]
  current: number
  onStepClick?: (index: number) => void
  className?: string
}

export function Stepper({
  steps,
  current,
  onStepClick,
  className,
}: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-4 overflow-x-auto py-2">
        {steps.map((step, index) => {
          const isActive = index === current
          const isCompleted = index < current
          const isClickable =
            typeof onStepClick === "function" && index <= current

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(index)}
                  className={cn(
                    "flex items-center gap-3 rounded-full border transition-colors pr-4 ",
                    isClickable ? "hover:brightness-105" : "cursor-default",
                    isActive
                      ? "border-forest-600 bg-herb-300 text-white"
                      : isCompleted
                      ? "border-forest-600/40 bg-herb-300/50"
                      : "border-cedar-700 bg-herb-300/50 text-cedar-700"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "inline-flex size-10 items-center justify-center rounded-full border",
                      isActive
                        ? "bg-forest-600 text-white border-forest-600"
                        : isCompleted
                        ? "bg-sage-500 text-white border-sage-500"
                        : "bg-herb-300 text-cedar-700 border-cedar-700"
                    )}
                  >
                    {isCompleted ? <Check className="size-4" /> : index + 1}
                  </span>
                  <span className="text-left">
                    <span
                      className={cn(
                        "block text-sm font-medium leading-none pt-2",
                        isActive ? "text-soil-800" : "text-soil-800"
                      )}
                    >
                      {step.label}
                    </span>
                    {step.description ? (
                      <span
                        className={cn(
                          "block text-xs pb-1",
                          isActive ? "text-cedar-700" : "text-cedar-700"
                        )}
                      >
                        {step.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              </div>
              {index < steps.length - 1 ? (
                <Separator className="min-w-10 flex-1" />
              ) : null}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
