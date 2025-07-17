import { createContext, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type ContextType = {
  activeTab: string;
  isWcReviewsEnabled: boolean;
  changeTab: (tab: string) => void;
  changeWcReviewsStatus: (value: boolean) => void;
  wizardCompleted: boolean;
  finishWizard: () => void;
};

const AppContext = createContext<ContextType>({
  activeTab: 'dashboard',
  isWcReviewsEnabled: false,
  changeTab: () => {},
  changeWcReviewsStatus: () => {},
  wizardCompleted: false,
  finishWizard: () => {},
});

export { AppContext };

const queryClient = new QueryClient();

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, changeTab] = useState('dashboard');
  const [isWcReviewsEnabled, setIsWcReviewsEnabled] = useState(
    window.yayReviews.wc_reviews_settings.reviews_enabled ?? false,
  );
  const [wizardCompleted, setWizardCompleted] = useState(
    window.yayReviews.wizard_completed === 'yes',
  );

  const memorizedValue = useMemo(
    () => ({
      activeTab,
      changeTab: changeTab,
      isWcReviewsEnabled,
      changeWcReviewsStatus: setIsWcReviewsEnabled,
      wizardCompleted,
      finishWizard: () => {
        setWizardCompleted(true);
      },
    }),
    [activeTab, isWcReviewsEnabled, wizardCompleted],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={memorizedValue}>{children}</AppContext.Provider>
    </QueryClientProvider>
  );
}
