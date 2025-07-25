import PageLayout from '@/layouts/page-layout';
import { __ } from '@wordpress/i18n';

import PageTitle from '@/components/page-title';

export default function RewardFallback() {
  return (
    <PageLayout>
      <PageTitle title={__('Review rewards', 'yay-customer-reviews-woocommerce')} />
      <div className="container mx-auto space-y-8 px-7 py-0">Fallback</div>
    </PageLayout>
  );
}
