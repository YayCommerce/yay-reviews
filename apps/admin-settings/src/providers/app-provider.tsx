import { createContext, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type ContextType = {
  activeTab: string;
  reviewsEnabled: boolean;
  changeTab: (tab: string) => void;
  setReviewsEnabled: (reviewsEnabled: boolean) => void;
};

const AppContext = createContext<ContextType>({
  activeTab: 'dashboard',
  reviewsEnabled: false,
  changeTab: () => {},
  setReviewsEnabled: () => {},
});

export { AppContext };

const queryClient = new QueryClient();

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, changeTab] = useState('dashboard');
  const [reviewsEnabled, setReviewsEnabled] = useState(
    window.yayReviews.wc_reviews_settings.reviews_enabled ?? false,
  );

  const memorizedValue = useMemo(
    () => ({ activeTab, changeTab: changeTab, reviewsEnabled, setReviewsEnabled }),
    [activeTab, reviewsEnabled],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={memorizedValue}>{children}</AppContext.Provider>
    </QueryClientProvider>
  );
}
