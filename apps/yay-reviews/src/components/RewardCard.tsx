import { useMemo } from 'react';
import { Coupon } from 'types/coupon';

import { Reward, SettingsFormData } from '@/lib/schema';
import { __ } from '@/lib/utils';

import DuplicateIcon from './icons/Duplicate';
import TrashIcon from './icons/Trash';
import { NewCouponDrawer } from './NewCouponDrawer';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { FormField, useFormContext } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export default function RewardCard({
  reward,
  coupons,
  handleDuplicate,
  handleDelete,
  isNew = false,
}: {
  reward: Reward;
  coupons: Coupon[];
  handleDuplicate: (reward: Reward) => void;
  handleDelete: (reward: Reward) => void;
  isNew?: boolean;
}) {
  const { control, watch } = useFormContext<SettingsFormData>();
  const coupon = watch(`rewards.${reward.id}.coupon_id`);
  const onlySendToPurchasedCustomers = watch(
    `rewards.${reward.id}.only_send_to_purchased_customers`,
  );

  const selectedCouponStatus = useMemo(() => {
    return coupons.find((c) => c.id === coupon)?.expired
      ? __('expired')
      : coupons.find((c) => c.id === coupon)?.out_of_usage
        ? __('out_of_usage')
        : '';
  }, [coupons, coupon]);

  return (
    <Collapsible className="yay-reviews-collapsible" defaultOpen={isNew}>
      <CollapsibleTrigger className="yay-reviews-collapsible-trigger w-full rounded-t-xl bg-white shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex w-1/2 items-center gap-2">
            <div className="flex w-full items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <FormField
                control={control}
                name={`rewards.${reward.id}.enabled`}
                render={({ field: { value, onChange } }) => (
                  <Switch checked={Boolean(value)} onCheckedChange={() => onChange(!value)} />
                )}
              />
              <FormField
                control={control}
                name={`rewards.${reward.id}.name`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    value={value}
                    onChange={(e) => {
                      e.preventDefault();
                      onChange(e.target.value);
                    }}
                    className="w-full"
                  />
                )}
              />
            </div>
          </div>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDuplicate(reward);
                    }}
                  >
                    <DuplicateIcon strokeWidth={1.5} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{__('duplicate')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(reward);
                    }}
                  >
                    <TrashIcon strokeWidth={1.5} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{__('delete')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="yay-reviews-collapsible-content rounded-b-xl bg-white">
        <div className="flex flex-col gap-4 p-6">
          {/* Coupon selection */}
          <div className="flex flex-col gap-2">
            <span className="text-sm">{__('select_coupon_to_be_sent')}</span>
            <div>
              <FormField
                control={control}
                name={`rewards.${reward.id}.coupon_id`}
                render={({ field: { value, onChange } }) => (
                  <Select value={value || ''} defaultValue={value || ''} onValueChange={onChange}>
                    <SelectTrigger className="w-1/2 bg-white">
                      <SelectValue placeholder={__('select_coupon')} />
                    </SelectTrigger>
                    <SelectContent>
                      {coupons.length > 0 ? (
                        coupons.map((coupon) => (
                          <SelectItem
                            key={coupon.id}
                            value={coupon.id}
                            className="yay-reviews-coupon-select-item"
                          >
                            <div className="flex w-full items-center justify-between gap-2">
                              <span>{coupon.code}</span>
                              <span>
                                {coupon.expired ? (
                                  <Badge variant="destructive" className="px-1 py-0">
                                    {__('expired')}
                                  </Badge>
                                ) : (
                                  ''
                                )}{' '}
                                {coupon.out_of_usage ? (
                                  <Badge variant="secondary" className="px-1 py-0">
                                    {__('out_of_usage')}
                                  </Badge>
                                ) : (
                                  ''
                                )}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-muted-foreground mt-2 mb-2 flex items-center justify-center text-sm">
                          {__('no_coupons_found')}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          {/* Create new coupon */}
          <div className="text-sm">
            <span className="text-slate-500 capitalize">{__('or')}</span>
            {` `}
            <NewCouponDrawer rewardId={reward.id}>
              <span className="text-foreground lowercase underline decoration-solid">
                {__('create_new_coupon')}
              </span>
            </NewCouponDrawer>
          </div>
          {/* Coupon status */}
          {selectedCouponStatus !== '' && (
            <span>
              <span className="text-slate-500">
                {selectedCouponStatus + ` `}
                {__('coupon_not_available')}
              </span>
              {` `}
              <a
                className="text-foreground lowercase underline decoration-solid"
                href={coupons.find((c) => c.id === coupon)?.edit_url}
                target="_blank"
                rel="noreferrer"
              >
                {__('restrictions')}
              </a>
            </span>
          )}

          <hr className="border-t border-[#f0f0f0]" />
          {/* Review criteria */}
          <div className="flex flex-col gap-2">
            <div className="text-foreground mb-2 text-lg font-semibold">
              {__('review_criteria')}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <FormField
                control={control}
                name={`rewards.${reward.id}.only_send_to_purchased_customers`}
                render={({ field: { value, onChange } }) => (
                  <Switch checked={Boolean(value)} onCheckedChange={() => onChange(!value)} />
                )}
              />
              <span>{__('only_send_coupon_for_reviews_from_purchased_customers')}</span>
            </div>

            {!onlySendToPurchasedCustomers && (
              <div className="mb-2 flex items-center gap-2">
                <FormField
                  control={control}
                  name={`rewards.${reward.id}.send_to_guests`}
                  render={({ field: { value, onChange } }) => (
                    <Switch checked={Boolean(value)} onCheckedChange={() => onChange(!value)} />
                  )}
                />
                <span>{__('guests_can_receive_reward')}</span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-sm">{__('minimum_required_rating')}</label>
              <FormField
                control={control}
                name={`rewards.${reward.id}.minimum_required_rating`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    type="number"
                    className="w-16"
                    min={0}
                    value={value}
                    onChange={(e) => {
                      onChange(Number(e.target.value));
                    }}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">{__('minimum_media_files_uploaded')}</label>
              <FormField
                control={control}
                name={`rewards.${reward.id}.minimum_media_files_uploaded`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    type="number"
                    className="w-16"
                    min={0}
                    value={value}
                    onChange={(e) => {
                      onChange(Number(e.target.value));
                    }}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">{__('minimum_required_reviews')}</label>
              <FormField
                control={control}
                name={`rewards.${reward.id}.minimum_required_reviews_since_last_reward`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    type="number"
                    className="w-16"
                    min={0}
                    value={value}
                    onChange={(e) => {
                      onChange(Number(e.target.value));
                    }}
                  />
                )}
              />
              <span className="text-slate-500">
                {__('leave_empty_to_receive_reward_after_every_review')}
              </span>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
