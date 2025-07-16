import { createContext, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type ContextType = {
  activeTab: string;
  isWcReviewsEnabled: boolean;
  changeTab: (tab: string) => void;
  changeWcReviewsStatus: (value: boolean) => void;
};

const AppContext = createContext<ContextType>({
  activeTab: 'dashboard',
  isWcReviewsEnabled: false,
  changeTab: () => {},
  changeWcReviewsStatus: () => {},
});

export { AppContext };

const queryClient = new QueryClient();

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, changeTab] = useState('dashboard');
  const [isWcReviewsEnabled, setIsWcReviewsEnabled] = useState(
    window.yayReviews.wc_reviews_settings.reviews_enabled ?? false,
  );

  const memorizedValue = useMemo(
    () => ({
      activeTab,
      changeTab: changeTab,
      isWcReviewsEnabled,
      changeWcReviewsStatus: setIsWcReviewsEnabled,
    }),
    [activeTab, isWcReviewsEnabled],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={memorizedValue}>{children}</AppContext.Provider>
    </QueryClientProvider>
  );
}
