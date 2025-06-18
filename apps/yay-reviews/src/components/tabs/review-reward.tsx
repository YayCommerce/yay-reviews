import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { v4 as uuidv4 } from 'uuid';

import { getCoupons } from '@/lib/queries';
import { Reward } from '@/lib/schema';

import InboxIcon from '../icons/Inbox';
import RewardCard from '../RewardCard';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useFormContext } from '../ui/form';

export default function ReviewRewardTab() {
  const { watch, setValue } = useFormContext();
  const [newRewardIds, setNewRewardIds] = useState<string[]>([]);

  const rewards = watch('rewards') as Reward[];

  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => getCoupons(''),
    staleTime: 5 * 60 * 1000,
  });

  const handleCreateNewReward = () => {
    const newId = uuidv4();
    const newReward = {
      id: newId,
      name: __('Reward for reviewing the product', 'yay-reviews'),
      enabled: true,
      coupon_id: coupons.length > 0 ? coupons[0].id : '',
      only_send_to_purchased_customers: false,
      send_to_guests: false,
      minimum_required_rating: 4,
      minimum_media_files_uploaded: 1,
      minimum_required_reviews_since_last_reward: 0,
    };
    setValue('rewards', { ...rewards, [newId]: newReward });
    setNewRewardIds((prev) => [...prev, newId]);
  };

  const handleDuplicate = (reward: Reward) => {
    const duplicateReward = { ...reward };
    const newId = uuidv4();
    duplicateReward.id = newId;
    setValue('rewards', { ...rewards, [newId]: duplicateReward });
    setNewRewardIds((prev) => [...prev, newId]);
  };

  const handleDelete = (reward: Reward) => {
    const updatedRewards = { ...rewards };
    delete updatedRewards[reward.id as keyof typeof updatedRewards];
    setValue('rewards', updatedRewards);
    setNewRewardIds((prev) => prev.filter((id) => id !== reward.id));
  };

  return (
    <div className="flex w-[1100px] max-w-[90%] flex-col gap-8">
      <div className="text-foreground text-3xl font-bold">{__('Review Reward', 'yay-reviews')}</div>
      <div className="flex flex-col gap-4">
        {/* No reward added */}
        {Object.values(rewards).length === 0 && (
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
                <Button
                  className="w-fit gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCreateNewReward();
                  }}
                >
                  {__('Create new', 'yay-reviews')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* List of Reward added */}
        {Object.values(rewards).length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="text-foreground text-lg font-semibold">
                  {__('You have', 'yay-reviews')} {Object.values(rewards).length}{' '}
                  {__('reward set', 'yay-reviews')}
                </div>
                <Button
                  variant="outline"
                  className=""
                  onClick={(e) => {
                    e.preventDefault();
                    handleCreateNewReward();
                  }}
                >
                  {__('Add new', 'yay-reviews')}
                </Button>
              </div>
              {Object.values(rewards).map((reward: Reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  coupons={coupons}
                  handleDuplicate={handleDuplicate}
                  handleDelete={handleDelete}
                  isNew={newRewardIds.includes(reward.id)}
                />
              ))}
              <Button
                className="w-fit self-center"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  handleCreateNewReward();
                }}
              >
                {__('Add new', 'yay-reviews')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
