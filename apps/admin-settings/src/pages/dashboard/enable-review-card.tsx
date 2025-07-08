import { useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { CheckCircleIcon, InfoIcon, Loader2Icon } from 'lucide-react';

import { changeWcReviewsSettings } from '@/lib/ajax';
import useAppContext from '@/hooks/use-app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EnableReviewCard() {
  const { reviewsEnabled, setReviewsEnabled } = useAppContext();
  const errorMessage = useRef<string>('');
  const [isLoadingTurnOn, setIsLoadingTurnOn] = useState(false);

  const defaultReviewsEnabled = window.yayReviews.wc_reviews_settings.reviews_enabled ?? false;

  const handleTurnOnReviews = () => {
    setIsLoadingTurnOn(true);
    changeWcReviewsSettings('reviews_enabled', true)
      .then((res) => {
        if (res.success) {
          setReviewsEnabled(true);
          errorMessage.current = '';
        } else {
          errorMessage.current = res.data.mess;
        }
      })
      .finally(() => {
        setIsLoadingTurnOn(false);
      });
  };

  return (
    !defaultReviewsEnabled && (
      <div className="container w-fit px-7 py-0">
        <Card className="py-3">
          <CardContent className="px-3">
            <div className="text-foreground flex items-center gap-3">
              {!reviewsEnabled ? <InfoIcon size={18} /> : <CheckCircleIcon size={18} />}
              <span className="text-sm font-medium">
                <span>
                  {reviewsEnabled
                    ? __('You can change this any time in')
                    : __('Product reviews are disabled in WooCommerce.', 'yay-reviews')}
                </span>
                {reviewsEnabled && (
                  <>
                    {' '}
                    <span
                      className="cursor-pointer text-sm font-medium underline decoration-solid"
                      onClick={() => {
                        window.open(window.yayReviews.wc_settings_url, '_blank');
                      }}
                    >
                      {__('WooCommerce settings', 'yay-reviews')}
                    </span>
                  </>
                )}
              </span>
              {!reviewsEnabled && (
                <Button
                  size="sm"
                  disabled={isLoadingTurnOn}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTurnOnReviews();
                  }}
                >
                  {isLoadingTurnOn ? (
                    <div className="flex w-[46px] items-center justify-center">
                      <Loader2Icon className="animate-spin" />
                    </div>
                  ) : (
                    __('Turn on', 'yay-reviews')
                  )}
                </Button>
              )}
            </div>
            {errorMessage.current && (
              <div className="mx-auto text-sm text-red-500">{errorMessage.current}</div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  );
}
