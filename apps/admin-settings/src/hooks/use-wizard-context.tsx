import { useContext } from 'react';
import { WizardContext } from '@/providers/wizard-provider';

export default function useWizardContext() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizardContext must be used within an WizardProvider');
  }
  return context;
}
