import { createContext, useMemo, useState } from 'react';

type ContextType = {
  currentStep: number;
  goNext: () => void;
};

export const WizardContext = createContext<ContextType>({
  currentStep: 0,
  goNext: () => {},
});

export default function WizardProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const memorizedValue = useMemo(() => {
    return {
      currentStep,
      goNext: () => {
        setCurrentStep((prev) => prev + 1);
      },
    };
  }, [currentStep]);

  return <WizardContext.Provider value={memorizedValue}>{children}</WizardContext.Provider>;
}
