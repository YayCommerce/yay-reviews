import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type RewardsContextType = {
  coupons: any[];
  addCoupon: (coupon: any) => void;
};

export const RewardsContext = createContext<RewardsContextType>({
  coupons: [],
  addCoupon: () => {},
});

export default function RewardsProvider({ children }: { children: React.ReactNode }) {
  const [coupons, setCoupons] = useState<any[]>(window.yayReviews.coupons ?? []);

  const addCoupon = useCallback((coupon: any) => {
    setCoupons((prevCoupons) => [coupon, ...prevCoupons]);
  }, []);

  const memorizedValue = useMemo(() => {
    return {
      coupons,
      addCoupon,
    };
  }, [coupons, addCoupon]);

  return <RewardsContext.Provider value={memorizedValue}>{children}</RewardsContext.Provider>;
}
