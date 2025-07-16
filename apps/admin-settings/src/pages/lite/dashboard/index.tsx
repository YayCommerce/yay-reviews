import { useMemo } from 'react';
import PageLayout from '@/layouts/page-layout';
import { __ } from '@wordpress/i18n';

import { __IS_PRO__ } from '@/config/version';
import { SettingsFormData } from '@/lib/schema';
import useAppContext from '@/hooks/use-app-context';
import { useFormContext } from '@/components/ui/form';
import NormalCard from '@/components/addon-card/normal-card';
import UpgradeCard from '@/components/addon-card/upgrade-card';
import GiftIcon from '@/components/icons/Gift';
import ReminderIcon from '@/components/icons/Reminder';
import PageTitle from '@/components/page-title';

import WooCommerceReviewStatus from './woocommerce-review-status';

export type Addon = {
  id: 'reminder' | 'reward';
  title: string;
  description: string;
  icon: React.ReactNode;
  settingsPath: string;
  enabled: boolean;
  version?: 'lite' | 'pro';
  documentationUrl: string;
};

const addonsInformation = [
  {
    id: 'reminder',
    title: __('Review reminder', 'yay-reviews'),
    description: __(
      'Sends reminders to customers after buying, encouraging reviews and increasing engagement.',
      'yay-reviews',
    ),
    icon: <ReminderIcon size={30} />,
    settingsPath: 'addons.reminder',
    documentationUrl: 'https://yayreviews.com/docs/reminder-addon',
  },
  {
    id: 'reward',
    title: __('Review rewards', 'yay-reviews'),
    description: __(
      'Sends discount coupons for quality reviews meeting set criteria, encouraging great feedback and repeat purchases.',
      'yay-reviews',
    ),
    icon: <GiftIcon size={30} />,
    settingsPath: 'addons.reward',
    documentationUrl: 'https://yayreviews.com/docs/reward-addon',
  },
];

const AddonCard = (props: Addon) => {
  return !__IS_PRO__ && props.version === 'pro' ? (
    <UpgradeCard {...props} />
  ) : (
    <NormalCard {...props} />
  );
};

export default function DashboardPage() {
  const { changeTab } = useAppContext();
  const { watch } = useFormContext<SettingsFormData>();

  const addonStatus = watch('addons');

  const addons = useMemo(() => {
    return addonsInformation.map((addon) => ({
      ...addon,
      enabled: addonStatus[`${addon.id}_enabled` as keyof typeof addonStatus] ?? false,
    })) as Addon[];
  }, [{ ...addonStatus }]);

  return (
    <PageLayout className="items-start">
      <PageTitle
        title={__('Welcome to Yay Reviews', 'yay-reviews')}
        description={
          <>
            <span>
              {__(
                'Your central hub for managing review forms, reminders, and coupons, providing an intuitive interface to monitor and optimize customer feedback.',
                'yay-reviews',
              )}
            </span>
            <br />
            <span>{__('Go to', 'yay-reviews')} </span>
            <span
              className="cursor-pointer lowercase underline decoration-solid"
              onClick={() => changeTab('review')}
            >
              {__('Review settings', 'yay-reviews')}
            </span>
          </>
        }
      />
      <WooCommerceReviewStatus />
      <div className="container mx-auto px-7 py-0">
        <div className="text-foreground mb-6 text-xl font-semibold">
          {__('Addon-on settings', 'yay-reviews')}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {addons.map((addon) => (
            <AddonCard key={addon.id} {...addon} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
