import { createContext, useCallback, useMemo, useState } from 'react';

type ReviewContextType = {
  wcReviewsSettings: Record<string, boolean>;
  updateWcReviewsSettings: (wcReviewsSettings: Record<string, boolean>) => void;
};

export const ReviewContext = createContext<ReviewContextType>({
  wcReviewsSettings: {},
  updateWcReviewsSettings: () => {},
});

export default function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [wcReviewsSettings, setWcReviewsSettings] = useState<Record<string, boolean>>(
    window.yayReviews.wc_reviews_settings ?? {},
  );

  const updateWcReviewsSettings = useCallback((wcReviewsSettings: Record<string, boolean>) => {
    setWcReviewsSettings(wcReviewsSettings);
  }, []);

  const memorizedValue = useMemo(() => {
    return {
      wcReviewsSettings,
      updateWcReviewsSettings,
    };
  }, [wcReviewsSettings, updateWcReviewsSettings]);

  return <ReviewContext.Provider value={memorizedValue}>{children}</ReviewContext.Provider>;
}
