import { createContext, useMemo, useState } from 'react';

type ContextType = {
  currentDevice: 'desktop' | 'mobile';
  setCurrentDevice: (device: 'desktop' | 'mobile') => void;
};

export const EmailsContext = createContext<ContextType>({
  currentDevice: 'desktop',
  setCurrentDevice: () => {},
});

export default function EmailsProvider({ children }: { children: React.ReactNode }) {
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'mobile'>('desktop');
  const memorizedValue = useMemo(() => {
    return {
      currentDevice,
      setCurrentDevice,
    };
  }, [currentDevice, setCurrentDevice]);

  return <EmailsContext.Provider value={memorizedValue}>{children}</EmailsContext.Provider>;
}
