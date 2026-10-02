import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  isRTL: boolean;
}

const StepIndicator = ({ currentStep, totalSteps, stepLabels, isRTL }: StepIndicatorProps) => {
  const activeLabel = stepLabels[currentStep - 1];

  return (
    <div className="mb-5 sm:mb-7">
      <div className={`mb-4 flex items-end justify-between gap-4`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <p className="font-mono text-[10px] uppercase text-muted-foreground">
            {isRTL ? 'المرحلة الحالية' : 'Current step'}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground sm:text-base">{activeLabel}</p>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground" dir="ltr">
          {String(currentStep).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
        </span>
      </div>

      <div className={`flex w-full items-center`}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className={`flex min-w-0 items-center ${stepNumber < totalSteps ? 'flex-1' : ''}`}>
              <motion.div
                initial={false}
                animate={{ scale: isCurrent ? 1.08 : 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-xs transition-colors duration-300 sm:h-9 sm:w-9 ${
                  isCompleted || isCurrent
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted text-muted-foreground'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? <Check className="h-4 w-4" strokeWidth={2} /> : <span>{stepNumber}</span>}
              </motion.div>

              {stepNumber < totalSteps && (
                <div className="relative mx-2 h-px min-w-3 flex-1 overflow-hidden bg-border sm:mx-3">
                  <motion.div
                    className={`absolute inset-y-0 bg-primary ${isRTL ? 'right-0' : 'left-0'}`}
                    initial={false}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
