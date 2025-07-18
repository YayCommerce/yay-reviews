import { useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { CheckCircleIcon, InfoIcon, Loader2Icon } from 'lucide-react';

import { changeWcReviewsSettings } from '@/lib/ajax';
import useAppContext from '@/hooks/use-app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function WooCommerceReviewStatus() {
  const { isWcReviewsEnabled, changeWcReviewsStatus } = useAppContext();
  const errorMessage = useRef<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const defaultReviewsEnabled = window.yayReviews.wc_reviews_settings.reviews_enabled ?? false;

  const handleTurnOnReviews = () => {
    setIsLoading(true);
    changeWcReviewsSettings('reviews_enabled', true)
      .then((res) => {
        if (res.success) {
          changeWcReviewsStatus(true);
          errorMessage.current = '';
        } else {
          errorMessage.current = res.data.mess;
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    !defaultReviewsEnabled && (
      <div className="container w-fit px-7 py-0">
        <Card className="py-3">
          <CardContent className="px-3">
            <div className="text-foreground flex items-center gap-3">
              {!isWcReviewsEnabled ? <InfoIcon size={18} /> : <CheckCircleIcon size={18} />}
              <span className="text-sm font-medium">
                <span>
                  {isWcReviewsEnabled
                    ? __('You can change this any time in')
                    : __('Product reviews are disabled by WooCommerce.', 'yay-customer-reviews-woocommerce')}
                </span>
                {isWcReviewsEnabled && (
                  <>
                    {' '}
                    <span
                      className="cursor-pointer text-sm font-medium underline decoration-solid"
                      onClick={() => {
                        window.open(window.yayReviews.wc_settings_url, '_blank');
                      }}
                    >
                      {__('WooCommerce settings', 'yay-customer-reviews-woocommerce')}
                    </span>
                  </>
                )}
              </span>
              {!isWcReviewsEnabled && (
                <Button
                  size="sm"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTurnOnReviews();
                  }}
                >
                  {isLoading ? (
                    <div className="flex w-[46px] items-center justify-center">
                      <Loader2Icon className="animate-spin" />
                    </div>
                  ) : (
                    __('Turn on', 'yay-customer-reviews-woocommerce')
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
