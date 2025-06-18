import { useState } from 'react';
import { __ } from '@wordpress/i18n';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import { CouponForm } from './CouponForm';
import { useFormContext } from './ui/form';

export const NewCouponDrawer = ({
  children,
  rewardId,
}: {
  children: React.ReactNode;
  rewardId: string;
}) => {
  const [open, setOpen] = useState(false);
  const { getValues, setValue } = useFormContext();

  const handleUpdateCouponId = (couponId: string) => {
    const rewards = getValues('rewards');
    if (!rewards || !rewards[rewardId]) return;

    const updatedReward = {
      ...rewards[rewardId],
      coupon_id: couponId,
    };

    setValue(`rewards.${rewardId}`, updatedReward);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="yay-reviews-coupon-form mt-[32px]">
        <DrawerHeader className="border-b text-left">
          <DrawerTitle className="m-0">{__('Create new coupon', 'yay-reviews')}</DrawerTitle>
          <DrawerDescription className="hidden"></DrawerDescription>
        </DrawerHeader>
        <CouponForm
          className="px-4 pt-4"
          setOpen={setOpen}
          handleUpdateCouponId={handleUpdateCouponId}
        />
      </DrawerContent>
    </Drawer>
  );
};

NewCouponDrawer.displayName = 'NewCouponDrawer';
