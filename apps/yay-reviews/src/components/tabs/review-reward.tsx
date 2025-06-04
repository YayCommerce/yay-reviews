import { useQuery } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

import { getCoupons } from '@/lib/queries';
import { Reward } from '@/lib/schema';
import { __ } from '@/lib/utils';

import InboxIcon from '../icons/Inbox';
import RewardCard from '../RewardCard';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useFormContext } from '../ui/form';

export default function ReviewRewardTab({
  setActiveTab,
  setCurrentEmailTab,
}: {
  setActiveTab: (tab: string) => void;
  setCurrentEmailTab: (tab: string) => void;
}) {
  const { watch, setValue } = useFormContext();

  const rewards = watch('rewards') as Reward[];

  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => getCoupons('', 10),
    staleTime: 5 * 60 * 1000,
  });

  const handleCreateNewReward = () => {
    const newId = uuidv4();
    const newReward = {
      id: newId,
      name: 'New Reward',
      enabled: true,
      coupon_id: coupons.length > 0 ? coupons[0].id : '',
      only_send_to_purchased_customers: true,
      send_to_guests: false,
      minimum_required_rating: 3,
      minimum_media_files_uploaded: 1,
      minimum_required_reviews_since_last_reward: 1,
    };
    setValue('rewards', { ...rewards, [newId]: newReward });
  };

  const handleDuplicate = (reward: Reward) => {
    const duplicateReward = { ...reward };
    const newId = uuidv4();
    duplicateReward.id = newId;
    setValue('rewards', { ...rewards, [newId]: duplicateReward });
  };

  const handleDelete = (reward: Reward) => {
    const updatedRewards = { ...rewards };
    delete updatedRewards[reward.id as keyof typeof updatedRewards];
    setValue('rewards', updatedRewards);
  };

  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="text-foreground text-3xl font-bold">{__('review_reward')}</div>
      <div className="flex flex-col gap-4">
        {/* No reward added */}
        {Object.values(rewards).length === 0 && (
          <Card className="items-center gap-2 pt-6 pb-4 text-center">
            <CardContent className="p-0">
              <div className="flex flex-col items-center gap-2 pb-4">
                <InboxIcon strokeWidth={1} size={100} />
                <div className="px-6 text-lg font-semibold">{__('no_reward_added')}</div>
                <div className="text-muted-foreground px-6 pb-4 text-sm leading-5 font-normal">
                  {__('no_reward_added_description_first')}
                  <br />
                  {__('no_reward_added_description_second')}
                </div>
                <Button
                  className="w-fit cursor-pointer gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCreateNewReward();
                  }}
                >
                  {__('create_new')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* List of Reward added */}
        {Object.values(rewards).length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-foreground text-lg font-semibold">
                  {__('you_have')} {Object.values(rewards).length} {__('reward_set')}
                </div>
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCreateNewReward();
                  }}
                >
                  {__('add_new')}
                </Button>
              </div>
              {Object.values(rewards).map((reward: Reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  coupons={coupons}
                  setActiveTab={setActiveTab}
                  handleDuplicate={handleDuplicate}
                  handleDelete={handleDelete}
                  setCurrentEmailTab={setCurrentEmailTab}
                />
              ))}
              <Button
                className="w-fit cursor-pointer self-center"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  handleCreateNewReward();
                }}
              >
                {__('add_new')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
