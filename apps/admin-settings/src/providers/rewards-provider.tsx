import { createContext, useMemo } from 'react';

import useCouponsQuery from '@/hooks/use-coupons-query';

type RewardsContextType = {
  coupons: any[];
};

export const RewardsContext = createContext<RewardsContextType>({
  coupons: [],
});

export default function RewardsProvider({ children }: { children: React.ReactNode }) {
  const memorizedValue = useMemo(() => {
    return {
      coupons: window.yayReviews.coupons ?? [],
    };
  }, []);
  return <RewardsContext.Provider value={memorizedValue}>{children}</RewardsContext.Provider>;
}
