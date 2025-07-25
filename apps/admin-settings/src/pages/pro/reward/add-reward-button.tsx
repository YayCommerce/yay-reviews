import { __ } from '@wordpress/i18n';
import { v4 as uuidv4 } from 'uuid';

import { Reward, SettingsFormData } from '@/lib/schema';
import useRewardsContext from '@/hooks/use-rewards-context';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form';

export const DEFAULT_REWARD = {
  ...window.yayReviews.reward_default_data,
  id: uuidv4(),
  name: __('Reward for reviewing the product', 'yay-customer-reviews-woocommerce'),
  is_open: true,
};

export default function AddRewardButton({ text, isEmpty }: { text: string; isEmpty?: boolean }) {
  const { coupons } = useRewardsContext();
  const { watch, setValue } = useFormContext<SettingsFormData>();
  const rewards = watch('rewards') as Record<string, Reward>;

  const handleCreateNewReward = () => {
    const newId = uuidv4();
    const newReward = {
      ...DEFAULT_REWARD,
      id: newId,
      coupon_id: coupons.length > 0 ? coupons[0].id : '',
    };
    setValue('rewards', { ...rewards, [newId]: newReward }, { shouldDirty: true });
  };
  return (
    <Button
      variant={isEmpty ? 'default' : 'outline'}
      className={isEmpty ? 'w-fit gap-2' : ''}
      onClick={(e) => {
        e.preventDefault();
        handleCreateNewReward();
      }}
    >
      {text}
    </Button>
  );
}
