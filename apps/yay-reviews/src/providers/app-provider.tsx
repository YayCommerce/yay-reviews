import { createContext, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type ContextType = {
  activeTab: string;
  changeTab: (tab: string) => void;
};

const AppContext = createContext<ContextType>({
  activeTab: 'dashboard',
  changeTab: () => {},
});

export { AppContext };

const queryClient = new QueryClient();

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, changeTab] = useState('dashboard');

  const memorizedValue = useMemo(() => ({ activeTab, changeTab: changeTab }), [activeTab]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={memorizedValue}>{children}</AppContext.Provider>
    </QueryClientProvider>
  );
}
