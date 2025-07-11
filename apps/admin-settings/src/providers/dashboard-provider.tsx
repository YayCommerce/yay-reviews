import { createContext, useCallback, useMemo, useState } from 'react';

type DashboardContextType = {
  reviewsEnabled: boolean;
  handleUpdateReviewsEnabled: (reviewsEnabled: boolean) => void;
};

export const DashboardContext = createContext<DashboardContextType>({
  reviewsEnabled: false,
  handleUpdateReviewsEnabled: () => {},
});

export default function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [reviewsEnabled, setReviewsEnabled] = useState<boolean>(
    window.yayReviews.wc_reviews_settings.reviews_enabled ?? false,
  );

  const handleUpdateReviewsEnabled = useCallback((reviewsEnabled: boolean) => {
    setReviewsEnabled(reviewsEnabled);
  }, []);

  const memorizedValue = useMemo(() => {
    return {
      reviewsEnabled,
      handleUpdateReviewsEnabled,
    };
  }, [reviewsEnabled, handleUpdateReviewsEnabled]);

  return <DashboardContext.Provider value={memorizedValue}>{children}</DashboardContext.Provider>;
}
