import { useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Coupon } from 'types/coupon';

import { Reward, SettingsFormData } from '@/lib/schema';

import DuplicateIcon from './icons/Duplicate';
import TrashIcon from './icons/Trash';
import { NewCouponDrawer } from './NewCouponDrawer';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { FormField, useFormContext } from './ui/form';
import { Input } from './ui/input';
import { Label } from './ui/label';
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const coupon = watch(`rewards.${reward.id}.coupon_id`);

  const selectedCouponStatus = useMemo(() => {
    return coupons.find((c) => c.id === coupon)?.expired
      ? __('Expired', 'yay-reviews')
      : coupons.find((c) => c.id === coupon)?.out_of_usage
        ? __('Out of usage', 'yay-reviews')
        : '';
  }, [coupons, coupon]);

  return (
    <Collapsible className="yay-reviews-collapsible" defaultOpen={isNew}>
      <CollapsibleTrigger className="yay-reviews-collapsible-trigger w-full rounded-t-xl bg-white shadow-sm">
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
                <TooltipTrigger asChild>
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
          <div className="flex max-w-[400px] flex-col gap-2">
            <span className="w-full">
              <Label htmlFor={`rewards.${reward.id}.coupon_id`} className="font-normal">
                {__('Select coupon to be sent', 'yay-reviews')}
              </Label>
            </span>
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
          <div className="flex max-w-[400px] flex-col gap-2">
            <span className="w-max">
              <Label htmlFor={`rewards.${reward.id}.send_to`} className="font-normal">
                {__('Send to', 'yay-reviews')}
              </Label>
            </span>
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
                      {__('All reviewers ( include guest users )', 'yay-reviews')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <hr className="border-t border-[#f0f0f0]" />
          {/* Review criteria */}
          <div className="flex flex-col gap-4">
            <div className="text-foreground mb-2 text-lg font-semibold">
              {__('Review criteria', 'yay-reviews')}
            </div>
            <div className="flex flex-col gap-2">
              <span className="w-max">
                <Label
                  htmlFor={`rewards.${reward.id}.minimum_required_rating`}
                  className="font-normal"
                >
                  {__('Minimum required rating', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`rewards.${reward.id}.minimum_required_rating`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id={`rewards.${reward.id}.minimum_required_rating`}
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
              <span className="w-max">
                <Label
                  htmlFor={`rewards.${reward.id}.minimum_media_files_uploaded`}
                  className="font-normal"
                >
                  {__('Minimum media files uploaded', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`rewards.${reward.id}.minimum_media_files_uploaded`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id={`rewards.${reward.id}.minimum_media_files_uploaded`}
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
              <span className="w-max">
                <Label
                  htmlFor={`rewards.${reward.id}.minimum_required_reviews_since_last_reward`}
                  className="font-normal"
                >
                  {__('Minimum required reviews posted since the last reward?', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`rewards.${reward.id}.minimum_required_reviews_since_last_reward`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id={`rewards.${reward.id}.minimum_required_reviews_since_last_reward`}
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
                {__('Leave empty to receive reward after every review', 'yay-reviews')}
              </span>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
