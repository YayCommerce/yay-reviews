import { __ } from '@wordpress/i18n';

import { getImageUrl } from '@/lib/utils';

import { WizardContent } from '.';

export default function WelcomeStep() {
  return (
    <WizardContent>
      <img
        src={getImageUrl('yayrev-welcome-img.webp')}
        alt={__('Yay Reviews', 'yay-customer-reviews-woocommerce')}
        className="rounded-md"
      />
      <div className="text-foreground font-medium">
        {__(
          'YayReviews helps you collect richer product feedback, nudge shoppers to share it, and reward their effort—all in one flow.',
          'yay-customer-reviews-woocommerce',
        )}
      </div>
      <div>{__('Get reviews live in 1 minutes.', 'yay-customer-reviews-woocommerce')}</div>
    </WizardContent>
  );
}
