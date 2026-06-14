import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  steps: string[];
  currentStep: number;
}

export function OnboardingProgress({ steps, currentStep }: OnboardingProgressProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isComplete
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : isActive
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-md'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold text-center max-w-[72px] leading-tight ${
                    isActive || isComplete ? 'text-primary' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
                    stepNumber < currentStep ? 'bg-primary' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
