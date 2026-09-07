"use client";

import type * as React from "react";
import {
  Children,
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  type PropsWithChildren,
} from "react";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const stepIndicatorVariants = cva("flex items-center justify-center gap-2", {
  variants: {
    variant: {
      dots: "",
      pills: "",
    },
  },
  defaultVariants: {
    variant: "dots",
  },
});

const stepDotVariants = cva("rounded-full transition-all duration-200", {
  variants: {
    variant: {
      dots:
        "size-2 data-[state=active]:size-2.5 data-[state=active]:bg-foreground data-[state=completed]:bg-foreground/60 data-[state=inactive]:bg-muted-foreground/30",
      pills:
        "h-1 max-w-8 flex-1 rounded-full data-[state=active]:bg-foreground data-[state=completed]:bg-foreground/60 data-[state=inactive]:bg-muted-foreground/30",
    },
  },
  defaultVariants: {
    variant: "dots",
  },
});

export interface StepIndicatorProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof stepIndicatorVariants> {
  currentStep: number;
  totalSteps: number;
  dotClassName?: string;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  variant = "dots",
  className,
  dotClassName,
  ...props
}: StepIndicatorProps) {
  return (
    <div
      className={cn(stepIndicatorVariants({ variant }), className)}
      {...props}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;
        const stepState: "active" | "completed" | "inactive" = isActive
          ? "active"
          : isCompleted
            ? "completed"
            : "inactive";
        return (
          <div
            key={stepNumber}
            data-state={stepState}
            className={cn(stepDotVariants({ variant }), dotClassName)}
          />
        );
      })}
    </div>
  );
}

export interface OnboardingContextValue {
  currentStep: number;
  totalSteps: number;
  stepValue: number;
  setStep: (step: number | ((prev: number) => number)) => void;
  setStepValue: (value: number | ((prev: number) => number)) => void;
  maxStepValue: number;
  canGoNext: boolean;
  canGoBack: boolean;
  handleBack: () => void;
  handleNext: () => void;
  handleComplete: () => void;
  onComplete?: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("Onboarding components must be used within Onboarding.Root");
  }
  return ctx;
}

export interface OnboardingRootProps
  extends PropsWithChildren,
    Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (step: number) => void;
  stepValue?: number;
  defaultStepValue?: number;
  onStepValueChange?: (value: number) => void;
  totalSteps: number;
  maxStepValue?: number;
  onComplete?: () => void;
  canGoNext?: (step: number, stepValue: number) => boolean;
}

function OnboardingRoot({
  value: controlledValue,
  defaultValue = 1,
  onValueChange,
  stepValue: controlledStepValue,
  defaultStepValue = 0,
  onStepValueChange,
  totalSteps,
  maxStepValue: controlledMaxStepValue = 0,
  onComplete,
  canGoNext: canGoNextFn,
  children,
  className,
  ...props
}: OnboardingRootProps) {
  const [currentStep, setCurrentStep] = useControllableState({
    prop: controlledValue,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const [stepValue, setStepValueState] = useControllableState({
    prop: controlledStepValue,
    defaultProp: defaultStepValue,
    onChange: onStepValueChange,
  });

  const maxStepValue = controlledMaxStepValue ?? 0;
  const canGoNext = canGoNextFn ? canGoNextFn(currentStep, stepValue) : true;
  const canGoBack = currentStep > 1 || stepValue > 0;

  const handleNext = useCallback(() => {
    if (currentStep === 1 && stepValue < maxStepValue) {
      setStepValueState((prev) => prev + 1);
    } else if (currentStep < totalSteps) {
      setStepValueState(0);
      setCurrentStep((prev) => prev + 1);
    }
  }, [
    currentStep,
    stepValue,
    maxStepValue,
    totalSteps,
    setStepValueState,
    setCurrentStep,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep === 1 && stepValue > 0) {
      setStepValueState((prev) => prev - 1);
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setStepValueState(maxStepValue);
    } else if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [
    currentStep,
    stepValue,
    maxStepValue,
    setStepValueState,
    setCurrentStep,
  ]);

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  const contextValue = useMemo(
    () => ({
      currentStep,
      totalSteps,
      stepValue,
      setStep: setCurrentStep,
      setStepValue: setStepValueState,
      maxStepValue,
      canGoNext,
      canGoBack,
      handleBack,
      handleNext,
      handleComplete,
      onComplete,
    }),
    [
      currentStep,
      totalSteps,
      stepValue,
      setCurrentStep,
      setStepValueState,
      maxStepValue,
      canGoNext,
      canGoBack,
      handleBack,
      handleNext,
      handleComplete,
      onComplete,
    ]
  );

  return (
    <OnboardingContext.Provider value={contextValue}>
      <div className={cn(className)} {...props}>
        {children}
      </div>
    </OnboardingContext.Provider>
  );
}

export interface OnboardingStepProps
  extends React.ComponentPropsWithoutRef<"div"> {
  step: number;
}

function OnboardingStep({
  step,
  children,
  className,
  ...props
}: OnboardingStepProps) {
  const { currentStep } = useOnboarding();
  const isActive = currentStep === step;

  if (!isActive) {
    return null;
  }

  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export interface OnboardingStepIndicatorProps
  extends Omit<StepIndicatorProps, "currentStep" | "totalSteps"> {}

function OnboardingStepIndicator(props: OnboardingStepIndicatorProps) {
  const { currentStep, totalSteps } = useOnboarding();
  return <StepIndicator currentStep={currentStep} totalSteps={totalSteps} {...props} />;
}

export interface OnboardingHeaderProps
  extends React.ComponentPropsWithoutRef<"div"> {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

function OnboardingHeader({
  title,
  description,
  children,
  className,
  ...props
}: OnboardingHeaderProps) {
  if (children) {
    return (
      <div className={cn("text-center", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "text-center space-y-2 [&_.font-serif]:font-serif",
        className
      )}
      {...props}
    >
      {title != null && (
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export interface OnboardingNavigationProps
  extends React.ComponentPropsWithoutRef<"fieldset"> {
  backLabel?: string;
  nextLabel?: string;
  completeLabel?: string;
  canGoNext?: boolean;
  children?: React.ReactNode;
}

function OnboardingNavigation({
  backLabel = "Back",
  nextLabel = "Next",
  completeLabel = "Start Creating",
  canGoNext: canGoNextOverride,
  children,
  className,
  ...props
}: OnboardingNavigationProps) {
  const {
    currentStep,
    totalSteps,
    canGoNext: contextCanGoNext,
    canGoBack,
    handleBack,
    handleNext,
    handleComplete,
  } = useOnboarding();

  const canGoNext = canGoNextOverride ?? contextCanGoNext;
  const isLastStep = currentStep === totalSteps;

  if (children) {
    return (
      <fieldset className={cn("flex gap-2 justify-center", className)} {...props}>
        {children}
      </fieldset>
    );
  }

  return (
    <fieldset className={cn("flex gap-2 justify-center", className)} {...props}>
      <Button
        type="button"
        variant="outline"
        onClick={handleBack}
        disabled={!canGoBack}
      >
        {backLabel}
      </Button>
      {isLastStep ? (
        <Button type="button" onClick={handleComplete}>
          {completeLabel}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
        >
          {nextLabel}
        </Button>
      )}
    </fieldset>
  );
}

export const Onboarding = Object.assign(OnboardingRoot, {
  Step: OnboardingStep,
  StepIndicator: OnboardingStepIndicator,
  Header: OnboardingHeader,
  Navigation: OnboardingNavigation,
});

export { useOnboarding };
