import { useMemo } from 'react';
import PageLayout from '@/layouts/page-layout';
import { __ } from '@wordpress/i18n';

import { SettingsFormData } from '@/lib/schema';
import useAppContext from '@/hooks/use-app-context';
import { useFormContext } from '@/components/ui/form';
import GiftIcon from '@/components/icons/Gift';
import OverviewIcon from '@/components/icons/Overview';
import ReminderIcon from '@/components/icons/Reminder';
import PageTitle from '@/components/page-title';

import AddonCard, { Addon } from './addon-card';

const addonsInformation = [
  {
    id: 'reminder',
    title: __('Reminder', 'yay-reviews'),
    description: __(
      'Sends reminders to customers after buying, encouraging reviews and increasing engagement.',
      'yay-reviews',
    ),
    icon: <ReminderIcon size={30} />,
    settingsPath: 'addons.reminder',
  },
  {
    id: 'reward',
    title: __('Review Reward', 'yay-reviews'),
    description: __(
      'Sends discount coupons for quality reviews meeting set criteria, encouraging great feedback and repeat purchases.',
      'yay-reviews',
    ),
    icon: <GiftIcon size={30} />,
    settingsPath: 'addons.reward',
  },
  // {
  //   id: 'optional_fields',
  //   title: __('Optional Fields', 'yay-reviews'),
  //   description: __(
  //     'Adds custom fields to review forms, letting customers share tailored feedback for your needs.',
  //     'yay-reviews',
  //   ),
  //   icon: <NoteIcon size={30} />,
  //   settingsPath: 'addons.optional_fields',
  // },
  {
    id: 'overview',
    title: __('Reviews Overview', 'yay-reviews'),
    description: __(
      'Displays a summary of user ratings, helping customers make informed decisions.',
      'yay-reviews',
    ),
    icon: <OverviewIcon size={30} />,
    settingsPath: 'addons.overview',
  },
];

export default function DashboardPage() {
  const { changeTab } = useAppContext();
  const { watch } = useFormContext<SettingsFormData>();

  const addonStatus = watch('addons');

  const addons = useMemo(() => {
    return addonsInformation.map((addon) => ({
      ...addon,
      enabled: addonStatus[addon.id as keyof typeof addonStatus] ?? false,
    })) as Addon[];
  }, [{ ...addonStatus }]);

  return (
    <PageLayout>
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
              {__('Review Settings', 'yay-reviews')}
            </span>
          </>
        }
      />
      <div className="container mx-auto px-7 py-0">
        <div className="text-foreground mb-6 text-xl font-semibold">Addon-on settings</div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {addons.map((addon) => (
            <AddonCard key={addon.id} {...addon} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
