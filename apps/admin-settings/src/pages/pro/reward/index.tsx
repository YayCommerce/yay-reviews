import { useMemo } from 'react';
import PageLayout from '@/layouts/page-layout';
import RewardsProvider from '@/providers/rewards-provider';
import { __ } from '@wordpress/i18n';
import { InfoIcon } from 'lucide-react';

import { Reward } from '@/lib/schema';
import { Card, CardContent } from '@/components/ui/card';
import { useFormContext } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import InboxIcon from '@/components/icons/Inbox';
import PageTitle from '@/components/page-title';

import AddRewardButton from './add-reward-button';
import RewardCard from './reward-card';

export default function RewardPage() {
  const { watch } = useFormContext();

  const rewards = watch('rewards') as Reward[];

  const isEmpty = useMemo(() => {
    return Object.values(rewards).length === 0;
  }, [rewards]);

  return (
    <RewardsProvider>
      <PageLayout>
        <PageTitle title={__('Review rewards', 'yay-reviews')} />
        <div className="container mx-auto space-y-8 px-7 py-0">
          {/* No reward added */}
          {isEmpty && (
            <Card className="items-center gap-2 pt-6 pb-4 text-center">
              <CardContent className="p-0">
                <div className="flex flex-col items-center gap-2 pb-4">
                  <InboxIcon strokeWidth={1} size={100} />
                  <div className="px-6 text-lg font-semibold">
                    {__('No reward added', 'yay-reviews')}
                  </div>
                  <div className="text-muted-foreground px-6 pb-4 text-sm leading-5 font-normal">
                    {__(
                      'Sends discount coupons for quality reviews meeting set criteria,',
                      'yay-reviews',
                    )}
                    <br />
                    {__('encouraging great feedback and repeat purchases.', 'yay-reviews')}
                  </div>
                  <AddRewardButton text={__('Create new', 'yay-reviews')} isEmpty={isEmpty} />
                </div>
              </CardContent>
            </Card>
          )}
          {/* List of Reward added */}
          {!isEmpty && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-foreground flex items-center gap-2 text-lg font-semibold">
                    {__('You have', 'yay-reviews')} {Object.values(rewards).length}{' '}
                    {Object.keys(rewards).length > 1
                      ? __('reward sets', 'yay-reviews')
                      : __('reward set', 'yay-reviews')}
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon size={18} />
                        </TooltipTrigger>
                        <TooltipContent>
                          {__('Each review can trigger only one reward set', 'yay-reviews')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <AddRewardButton text={__('Add reward set', 'yay-reviews')} />
              </div>
              {Object.values(rewards).map((reward: Reward) => (
                <RewardCard key={reward.id + reward.coupon_id} reward={reward} />
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </RewardsProvider>
  );
}
