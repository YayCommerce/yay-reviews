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

import { DEFAULT_REWARD } from './add-reward-button';
import { NewCouponDrawer } from './new-coupon-drawer';

const frequencyOptions = [
  {
    label: __('Every review', 'yay-reviews'),
    value: 'every_review',
    summary: __('every review', 'yay-reviews'),
  },
  {
    label: __('Every 2 reviews', 'yay-reviews'),
    value: 'every_2_reviews',
    summary: __('every 2 reviews', 'yay-reviews'),
  },
  {
    label: __('Every 3 reviews', 'yay-reviews'),
    value: 'every_3_reviews',
    summary: __('every 3 reviews', 'yay-reviews'),
  },
];

const ratingOptions = [
  {
    label: __('Any rating', 'yay-reviews'),
    value: 'any',
    summary: '',
  },
  {
    label: __('Less than 5★', 'yay-reviews'),
    value: 'less_than_5_stars',
    summary: __('less than 5★', 'yay-reviews'),
  },
  {
    label: __('5★ only', 'yay-reviews'),
    value: '5_stars',
    summary: __('5★', 'yay-reviews'),
  },
];

const mediaOptions = [
  {
    label: __('No requirement', 'yay-reviews'),
    value: 'none',
    summary: '',
  },
  {
    label: __('Photo or video required', 'yay-reviews'),
    value: 'at_least_1_media',
    summary: __('at least one photo or video', 'yay-reviews'),
    shortSummary: __('photo or video required', 'yay-reviews'),
  },
];

export default function RewardCard({ reward }: { reward: Reward }) {
  const { control, watch, setValue } = useFormContext<SettingsFormData>();
  const { coupons } = useRewardsContext();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const coupon = watch(`rewards.${reward.id}.coupon_id`);
  const rewards = watch('rewards');

  const isMediaEnabled = watch('reviews.upload_media');

  const handleDuplicate = (reward: Reward) => {
    const newId = uuidv4();
    const duplicateReward = { ...reward, id: newId, is_open: true };
    const updatedRewards = { ...rewards, [newId]: duplicateReward };
    setValue('rewards', updatedRewards, { shouldDirty: true });
  };

  const handleDelete = (reward: Reward) => {
    const updatedRewards = { ...rewards };
    delete updatedRewards[reward.id];

    if (Object.keys(updatedRewards).length === 0) {
      setValue('rewards', { __temp__: true } as any, { shouldDirty: true });
      setTimeout(() => {
        setValue('rewards', {}, { shouldDirty: true });
      }, 0);
    } else {
      setValue('rewards', updatedRewards, { shouldDirty: true });
    }
  };

  const selectedCouponStatus = useMemo(() => {
    return coupons.find((c) => c.id === coupon)?.expired
      ? __('Expired', 'yay-reviews')
      : coupons.find((c) => c.id === coupon)?.out_of_usage
        ? __('Out of usage', 'yay-reviews')
        : '';
  }, [coupons, coupon]);

  const frequency = watch(`rewards.${reward.id}.frequency`);
  const rating = watch(`rewards.${reward.id}.rating_requirement`);
  const media = watch(`rewards.${reward.id}.media_requirement`);

  const headingSummary = useMemo(() => {
    const result = [];
    const frequencySummary = frequencyOptions.find((option) => option.value === frequency)?.summary;
    const ratingSummary = ratingOptions.find((option) => option.value === rating)?.summary;
    const mediaSummary = mediaOptions.find((option) => option.value === media)?.shortSummary;

    if (frequencySummary) {
      result.push(frequencySummary);
    }

    if (ratingSummary) {
      result.push(ratingSummary);
    }

    if (mediaSummary) {
      result.push(mediaSummary);
    }

    if (coupon) {
      const couponData = coupons.find((c) => c.id === coupon);
      let couponAmount = '$' + couponData?.amount;
      if (couponData?.type.includes('percent')) {
        couponAmount = couponData.amount + '%';
      }
      result.push(couponAmount + ' ' + __('off coupon', 'yay-reviews'));
    }
    return result.join('&nbsp;•&nbsp;');
  }, [frequency, rating, media, coupon, coupons]);

  const bodySummary = useMemo(() => {
    const frequencySummary = frequencyOptions.find((option) => option.value === frequency)?.summary;
    const ratingSummary = ratingOptions.find((option) => option.value === rating)?.summary;
    const mediaSummary = mediaOptions.find((option) => option.value === media)?.summary;

    let result = __('Reward will be given', 'yay-reviews');
    let subResult = '';
    let pluralBe =
      frequency === 'every_review' ? __('is', 'yay-reviews') : __('are', 'yay-reviews');
    let pluralContain =
      frequency === 'every_review' ? __('contains', 'yay-reviews') : __('contain', 'yay-reviews');

    if (frequencySummary) {
      result += ` ${frequencySummary}`;
    }

    if (ratingSummary) {
      subResult += __(' that', 'yay-reviews') + ` ${pluralBe} ${ratingSummary}`;
    }

    if (mediaSummary) {
      subResult +=
        (ratingSummary ? __(' and', 'yay-reviews') : __(' that', 'yay-reviews')) +
        ` ${pluralContain} ${mediaSummary}`;
    }

    return result + subResult;
  }, [frequency, rating, media]);

  return (
    <Collapsible className="yay-reviews-collapsible" defaultOpen={reward.is_open}>
      <CollapsibleTrigger
        asChild
        className="yay-reviews-collapsible-trigger w-full cursor-pointer flex-wrap rounded-md bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-2 p-6">
          <div className="flex w-full max-w-[350px] items-center gap-3">
            <div className="flex w-full items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <FormField
                control={control}
                name={`rewards.${reward.id}.enabled`}
                render={({ field: { value, onChange } }) => (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Switch checked={Boolean(value)} onCheckedChange={() => onChange(!value)} />
                      </TooltipTrigger>
                      <TooltipContent>{__('Enable/disable reward', 'yay-reviews')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
          <div
            className="text-muted-foreground flex-1 text-sm font-normal"
            dangerouslySetInnerHTML={{ __html: headingSummary }}
          />
          <div className="flex items-center">
            <TooltipProvider delayDuration={300}>
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
            <TooltipProvider delayDuration={300}>
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
          <div className="max-w-[300px]">
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

          <hr className="border-t border-[#f0f0f0]" />
          {/* Send to */}
          <div className="text-foreground text-lg font-semibold">
            {__('Who can receive the reward?', 'yay-reviews')}
          </div>
          <div className="max-w-[300px]">
            <FormField
              control={control}
              name={`rewards.${reward.id}.send_to`}
              render={({ field: { value, onChange } }) => (
                <Select
                  id={`rewards.${reward.id}.send_to`}
                  defaultValue="all_reviewers"
                  value={value}
                  onValueChange={onChange}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder={__('Select value', 'yay-reviews')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_reviewers">
                      {__('All reviewers (include guest users)', 'yay-reviews')}
                    </SelectItem>
                    <SelectItem value="purchased_customers">
                      {__('Purchased customers only', 'yay-reviews')}
                    </SelectItem>
                    <SelectItem value="guest_users">
                      {__('Guest users only', 'yay-reviews')}
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
              {__('Conditions to trigger the reward', 'yay-reviews')}
            </div>
            <div className="max-w-[300px]">
              <Label htmlFor={`rewards.${reward.id}.frequency`} className="mb-2 w-full font-normal">
                {__('Frequency', 'yay-reviews')}
              </Label>
              <FormField
                control={control}
                name={`rewards.${reward.id}.frequency`}
                render={({ field: { value, onChange } }) => (
                  <Select
                    id={`rewards.${reward.id}.frequency`}
                    defaultValue={DEFAULT_REWARD.frequency}
                    value={value}
                    onValueChange={onChange}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder={__('Select requirement', 'yay-reviews')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(frequencyOptions).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="max-w-[300px]">
              <Label
                htmlFor={`rewards.${reward.id}.rating_requirement`}
                className="mb-2 w-full font-normal"
              >
                {__('Rating', 'yay-reviews')}
              </Label>
              <FormField
                control={control}
                name={`rewards.${reward.id}.rating_requirement`}
                render={({ field: { value, onChange } }) => (
                  <Select
                    id={`rewards.${reward.id}.rating_requirement`}
                    defaultValue={DEFAULT_REWARD.rating_requirement}
                    value={value}
                    onValueChange={onChange}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder={__('Select requirement', 'yay-reviews')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ratingOptions).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {isMediaEnabled && (
              <div className="max-w-[300px]">
                <Label
                  htmlFor={`rewards.${reward.id}.media_requirement`}
                  className="mb-2 w-full font-normal"
                >
                  {__('Media', 'yay-reviews')}
                </Label>
                <div className="flex items-center gap-2">
                  <FormField
                    control={control}
                    name={`rewards.${reward.id}.media_requirement`}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        id={`rewards.${reward.id}.media_requirement`}
                        defaultValue={DEFAULT_REWARD.media_requirement}
                        value={value}
                        onValueChange={onChange}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder={__('Select requirement', 'yay-reviews')} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(mediaOptions).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            )}
            <div className="text-foreground text-sm font-normal">{bodySummary}</div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
