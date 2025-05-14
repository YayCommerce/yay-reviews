import { useState } from 'react';

import { __ } from '@/lib/utils';

import InboxIcon from '../icons/Inbox';
import RewardCard from '../RewardCard';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export default function ReviewRewardTab() {
  const [reward, setReward] = useState<
    { id: number; name: string; status: 'active' | 'inactive' }[]
  >([]);

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
                <Button variant="outline" size="sm" onClick={handleCreateNewReward}>
                  {__('add_new')}
                </Button>
              </div>
              {reward.map((item) => (
                <RewardCard key={item.id} item={item} />
                // <Card className="relative flex flex-col gap-6 p-6">
                //   {/* Top bar: Reward name and actions */}
                //   <div className="flex items-center justify-between">
                //     <input
                //       className="border-none bg-transparent text-xl font-semibold outline-none"
                //       value={item.name}
                //       // onChange={...} // Add logic if you want to edit the name
                //       readOnly
                //     />
                //     <div className="flex gap-2">
                //       {/* Replace with your actual icon components */}
                //       <button title="Duplicate">{/* Duplicate Icon */}</button>
                //       <button title="Delete">{/* Delete Icon */}</button>
                //     </div>
                //   </div>

                //   {/* Coupon selection */}
                //   <div className="flex flex-col gap-2">
                //     <label className="font-medium">Select coupon to be sent</label>
                //     <select className="input">{/* ...options... */}</select>
                //   </div>

                //   {/* User roles and except emails */}
                //   <div className="flex flex-col gap-2">
                //     <label className="font-medium">To users</label>
                //     <select className="input">{/* ...options... */}</select>
                //     <label className="mt-2 font-medium">Except emails</label>
                //     <textarea className="input" rows={3} />
                //   </div>

                //   {/* Review criteria */}
                //   <div>
                //     <div className="mb-2 text-lg font-bold">Review criteria</div>
                //     <div className="mb-2 flex items-center gap-2">
                //       <input type="checkbox" checked />
                //       <span>Only send coupon for reviews from purchased customers.</span>
                //     </div>
                //     <div className="mb-2 flex items-center gap-2">
                //       <input type="checkbox" disabled />
                //       <span className="text-muted-foreground">Guests can receive reward?</span>
                //     </div>
                //     <div className="flex gap-4">
                //       <div>
                //         <label className="font-medium">Minimum required rating</label>
                //         <input type="number" className="input w-16" value={3} />
                //       </div>
                //       <div>
                //         <label className="font-medium">Minimum media files uploaded</label>
                //         <input type="number" className="input w-16" value={1} />
                //       </div>
                //     </div>
                //   </div>

                //   {/* Coupon restriction */}
                //   <div>
                //     <div className="mb-2 text-lg font-bold">Coupon restriction</div>
                //     <div className="mb-2 flex items-center gap-2">
                //       <input type="checkbox" />
                //       <span>Inherit coupon restriction</span>
                //     </div>
                //     <div className="flex flex-col gap-2">
                //       <label className="font-medium">Products in</label>
                //       <select className="input">{/* ...options... */}</select>
                //       <label className="font-medium">Select categories</label>
                //       <select className="input">{/* ...options... */}</select>
                //       <label className="font-medium">Select products</label>
                //       <select className="input">{/* ...options... */}</select>
                //       <label className="font-medium">Exclude categories</label>
                //       <select className="input">{/* ...options... */}</select>
                //       <label className="font-medium">Exclude products</label>
                //       <select className="input">{/* ...options... */}</select>
                //     </div>
                //   </div>
                // </Card>
              ))}
              <Button
                className="w-fit self-center"
                variant="outline"
                size="sm"
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
