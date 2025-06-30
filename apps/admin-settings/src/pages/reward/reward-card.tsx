import { useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { v4 as uuidv4 } from 'uuid';

import { Reward, SettingsFormData } from '@/lib/schema';
import useRewardsContext from '@/hooks/use-rewards-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormField, useFormContext } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DuplicateIcon from '@/components/icons/Duplicate';
import TrashIcon from '@/components/icons/Trash';

import { NewCouponDrawer } from './new-coupon-drawer';

export default function RewardCard({ reward }: { reward: Reward }) {
  const { control, watch, setValue, unregister } = useFormContext<SettingsFormData>();
  const { coupons } = useRewardsContext();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const coupon = watch(`rewards.${reward.id}.coupon_id`);
  const rewards = watch('rewards');

  const isMediaEnabled = watch('reviews.upload_media');

  const handleDuplicate = (reward: Reward) => {
    const newId = uuidv4();
    const duplicateReward = { ...reward, id: newId, is_open: true };
    setValue('rewards', { ...rewards, [newId]: duplicateReward });
  };

  const handleDelete = (reward: Reward) => {
    const updatedRewards = { ...rewards };
    delete updatedRewards[reward.id as keyof typeof updatedRewards];
    setValue('rewards', updatedRewards);
  };

  const selectedCouponStatus = useMemo(() => {
    return coupons.find((c) => c.id === coupon)?.expired
      ? __('Expired', 'yay-reviews')
      : coupons.find((c) => c.id === coupon)?.out_of_usage
        ? __('Out of usage', 'yay-reviews')
        : '';
  }, [coupons, coupon]);

  return (
    <Collapsible className="yay-reviews-collapsible" defaultOpen={reward.is_open}>
      <CollapsibleTrigger
        asChild
        className="yay-reviews-collapsible-trigger w-full cursor-pointer rounded-md bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-2 p-6">
          <div className="flex w-full max-w-[400px] items-center gap-3">
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
                      e.stopPropagation();
                      onChange(e.target.value);
                    }}
                    className="w-full"
                  />
                )}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                <TooltipContent>{__('Duplicate', 'yay-reviews')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <TrashIcon strokeWidth={1.5} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-md"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle>{__('Delete reward', 'yay-reviews')}</DialogTitle>
                      </DialogHeader>
                      <div>{__('Are you sure you want to delete this reward?', 'yay-reviews')}</div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          className=""
                          onClick={(e) => {
                            e.preventDefault();
                            setDeleteDialogOpen(false);
                          }}
                        >
                          {__('Cancel', 'yay-reviews')}
                        </Button>
                        <Button
                          variant="default"
                          className=""
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(reward);
                            setDeleteDialogOpen(false);
                          }}
                        >
                          {__('Delete reward', 'yay-reviews')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>{__('Delete', 'yay-reviews')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="yay-reviews-collapsible-content rounded-b-xl bg-white">
        <div className="flex flex-col gap-4 p-6">
          <div className="text-foreground text-lg font-semibold">{__('Coupon', 'yay-reviews')}</div>
          {/* Coupon selection */}
          <div className="max-w-[400px]">
            <Label htmlFor={`rewards.${reward.id}.coupon_id`} className="mb-2 w-full font-normal">
              {__('Select coupon to be sent', 'yay-reviews')}
            </Label>
            <div className="w-full">
              <FormField
                control={control}
                name={`rewards.${reward.id}.coupon_id`}
                render={({ field: { value, onChange } }) => (
                  <Select
                    id={`rewards.${reward.id}.coupon_id`}
                    value={value || ''}
                    defaultValue={value || ''}
                    onValueChange={onChange}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder={__('Select coupon', 'yay-reviews')} />
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
                                    {__('expired', 'yay-reviews')}
                                  </Badge>
                                ) : (
                                  ''
                                )}{' '}
                                {coupon.out_of_usage ? (
                                  <Badge variant="secondary" className="px-1 py-0">
                                    {__('out of usage', 'yay-reviews')}
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
                          {__('No coupons found', 'yay-reviews')}
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
              <span className="text-foreground cursor-pointer lowercase underline decoration-solid">
                {__('Create new coupon', 'yay-reviews')}
              </span>
            </NewCouponDrawer>
          </div>
          {/* Coupon status */}
          {selectedCouponStatus !== '' && (
            <span>
              <span className="text-slate-500">
                {selectedCouponStatus + ` `}
                {__(
                  'coupon cannot be sent to customers as rewards. Please update its',
                  'yay-reviews',
                )}
              </span>
              {` `}
              <a
                className="text-foreground lowercase underline decoration-solid"
                href={coupons.find((c) => c.id === coupon)?.edit_url}
                target="_blank"
                rel="noreferrer"
              >
                {__('restrictions', 'yay-reviews')}
              </a>
            </span>
          )}

          {/* Send to */}
          <div className="max-w-[400px]">
            <Label htmlFor={`rewards.${reward.id}.send_to`} className="mb-2 w-max font-normal">
              {__('Send to', 'yay-reviews')}
            </Label>
            <FormField
              control={control}
              name={`rewards.${reward.id}.send_to`}
              render={({ field: { value, onChange } }) => (
                <Select
                  id={`rewards.${reward.id}.send_to`}
                  defaultValue="purchased_customers"
                  value={value}
                  onValueChange={onChange}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder={__('Select value', 'yay-reviews')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchased_customers">
                      {__('Only purchased customers', 'yay-reviews')}
                    </SelectItem>
                    <SelectItem value="all_reviewers">
                      {__('All reviewers (include guest users)', 'yay-reviews')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <hr className="border-t border-[#f0f0f0]" />
          {/* Review criteria */}
          <div className="flex flex-col gap-4">
            <div className="text-foreground text-lg font-semibold">
              {__('Send reward after', 'yay-reviews')}
            </div>
            <div className="max-w-[300px]">
              <FormField
                control={control}
                name={`rewards.${reward.id}.rating_requirement`}
                render={({ field: { value, onChange } }) => (
                  <Select
                    id={`rewards.${reward.id}.rating_requirement`}
                    defaultValue="at_least_4_stars"
                    value={value}
                    onValueChange={onChange}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder={__('Select requirement', 'yay-reviews')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {__('Review with any rating', 'yay-reviews')}
                      </SelectItem>
                      <SelectItem value="at_least_3_stars">
                        {__('Review with 3+ stars', 'yay-reviews')}
                      </SelectItem>
                      <SelectItem value="at_least_4_stars">
                        {__('Review with 4+ stars', 'yay-reviews')}
                      </SelectItem>
                      <SelectItem value="at_least_5_stars">
                        {__('5-star review', 'yay-reviews')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {isMediaEnabled && (
              <div className="max-w-[300px]">
                <Label
                  htmlFor={`rewards.${reward.id}.media_requirement`}
                  className="mb-2 w-max font-normal"
                >
                  {__('And', 'yay-reviews')}
                </Label>
                <FormField
                  control={control}
                  name={`rewards.${reward.id}.media_requirement`}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      id={`rewards.${reward.id}.media_requirement`}
                      defaultValue="none"
                      value={value}
                      onValueChange={onChange}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder={__('Select requirement', 'yay-reviews')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {__('Review with any media', 'yay-reviews')}
                        </SelectItem>
                        <SelectItem value="at_least_2_media">
                          {__('Review contains at least 2 media files', 'yay-reviews')}
                        </SelectItem>
                        <SelectItem value="at_least_3_media">
                          {__('Review contains at least 3 media files', 'yay-reviews')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
            <div className="max-w-[300px]">
              <Label
                htmlFor={`rewards.${reward.id}.minimum_required_reviews_since_last_reward`}
                className="mb-2 w-max font-normal"
              >
                {__('And', 'yay-reviews')}
              </Label>
              <FormField
                control={control}
                name={`rewards.${reward.id}.minimum_required_reviews_since_last_reward`}
                render={({ field: { value, onChange } }) => (
                  <Select
                    id={`rewards.${reward.id}.minimum_required_reviews_since_last_reward`}
                    defaultValue="none"
                    value={value}
                    onValueChange={onChange}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder={__('Select requirement', 'yay-reviews')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {__('Reward after every review', 'yay-reviews')}
                      </SelectItem>
                      <SelectItem value="at_least_2_reviews">
                        {__('Reward after at least 2 reviews', 'yay-reviews')}
                      </SelectItem>
                      <SelectItem value="at_least_3_reviews">
                        {__('Reward after at least 3 reviews', 'yay-reviews')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
