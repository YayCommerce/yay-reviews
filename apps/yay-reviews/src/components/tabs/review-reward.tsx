import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCoupons } from '@/lib/queries';
import { __ } from '@/lib/utils';

import InboxIcon from '../icons/Inbox';
import RewardCard from '../RewardCard';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export default function ReviewRewardTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [reward, setReward] = useState<
    { id: number; name: string; status: 'active' | 'inactive' }[]
  >([]);

  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => getCoupons('', 10),
    staleTime: 5 * 60 * 1000,
  });

  const handleCreateNewReward = () => {
    setReward([...reward, { id: reward.length + 1, name: 'New Reward', status: 'active' }]);
  };

  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="text-foreground text-3xl font-bold">{__('review_reward')}</div>
      <div className="flex flex-col gap-4">
        {/* No reward added */}
        {reward.length === 0 && (
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
                <Button className="w-fit gap-2" onClick={handleCreateNewReward}>
                  {__('create_new')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* List of Reward added */}
        {reward.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-foreground text-lg font-semibold">
                  {__('you_have')} {reward.length} {__('reward_set')}
                </div>
                <Button variant="outline" onClick={handleCreateNewReward}>
                  {__('add_new')}
                </Button>
              </div>
              {reward.map((item) => (
                <RewardCard
                  key={item.id}
                  item={item}
                  setActiveTab={setActiveTab}
                  coupons={coupons}
                />
              ))}
              <Button
                className="w-fit self-center"
                variant="outline"
                onClick={handleCreateNewReward}
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
