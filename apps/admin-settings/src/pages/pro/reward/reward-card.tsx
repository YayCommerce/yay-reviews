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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import InputNumberWithSuffix from './input-numper-with-suffix';
import { NewCouponDrawer } from './new-coupon-drawer';

const frequencyOptions = [
  {
    label: __('Every review', 'yay-customer-reviews-woocommerce'),
    value: 'every_review',
    summary: __('every review', 'yay-customer-reviews-woocommerce'),
  },
  {
    label: __('Every 2 reviews', 'yay-customer-reviews-woocommerce'),
    value: 'every_2_reviews',
    summary: __('every 2 reviews', 'yay-customer-reviews-woocommerce'),
  },
  {
    label: __('Every 3 reviews', 'yay-customer-reviews-woocommerce'),
    value: 'every_3_reviews',
    summary: __('every 3 reviews', 'yay-customer-reviews-woocommerce'),
  },
];

const ratingOptions = [
  {
    label: __('Any rating', 'yay-customer-reviews-woocommerce'),
    value: 'any',
    summary: '',
  },
  {
    label: __('Less than 5★', 'yay-customer-reviews-woocommerce'),
    value: 'less_than_5_stars',
    summary: __('less than 5★', 'yay-customer-reviews-woocommerce'),
  },
  {
    label: __('5★ only', 'yay-customer-reviews-woocommerce'),
    value: '5_stars',
    summary: __('5★', 'yay-customer-reviews-woocommerce'),
  },
];

const mediaOptions = [
  {
    label: __('No requirement', 'yay-customer-reviews-woocommerce'),
    value: 'none',
    summary: '',
  },
  {
    label: __('Photo or video required', 'yay-customer-reviews-woocommerce'),
    value: 'at_least_1_media',
    summary: __('at least one photo or video', 'yay-customer-reviews-woocommerce'),
    shortSummary: __('photo or video required', 'yay-customer-reviews-woocommerce'),
  },
];

export default function RewardCard({ reward }: { reward: Reward }) {
  const { control, watch, setValue } = useFormContext<SettingsFormData>();
  const { coupons } = useRewardsContext();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const coupon = watch(`rewards.${reward.id}.coupon_id`);
  const rewards = watch('rewards');

  const enableMediaUpload = watch('reviews.enable_media_upload');

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
      ? __('Expired', 'yay-customer-reviews-woocommerce')
      : coupons.find((c) => c.id === coupon)?.out_of_usage
        ? __('Out of usage', 'yay-customer-reviews-woocommerce')
        : '';
  }, [coupons, coupon]);

  const frequency = watch(`rewards.${reward.id}.frequency`);
  const rating = watch(`rewards.${reward.id}.rating_requirement`);
  const media = watch(`rewards.${reward.id}.media_requirement`);
  const couponType = watch(`rewards.${reward.id}.coupon_type`);
  const couponValue = watch(`rewards.${reward.id}.coupon_value`);
  const couponValueSuffix = watch(`rewards.${reward.id}.coupon_value_suffix`);

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

    if (couponType === 'one_time_coupon') {
      let couponAmount = window.yayReviews.currency_symbol + couponValue;
      if (couponValueSuffix === 'percentage') {
        couponAmount = couponValue + '%';
      }
      result.push(couponAmount + ' ' + __('off coupon', 'yay-customer-reviews-woocommerce'));
    } else {
      if (coupon) {
        const couponData = coupons.find((c) => c.id === coupon);
        let couponAmount = window.yayReviews.currency_symbol + couponData?.amount;
        if (couponData?.type.includes('percent')) {
          couponAmount = couponData.amount + '%';
        }
        result.push(couponAmount + ' ' + __('off coupon', 'yay-customer-reviews-woocommerce'));
      }
    }

    return result.join('&nbsp;•&nbsp;');
  }, [frequency, rating, media, coupon, coupons, couponType, couponValue, couponValueSuffix]);

  const bodySummary = useMemo(() => {
    const frequencySummary = frequencyOptions.find((option) => option.value === frequency)?.summary;
    const ratingSummary = ratingOptions.find((option) => option.value === rating)?.summary;
    const mediaSummary = mediaOptions.find((option) => option.value === media)?.summary;

    let result = __('Reward will be given', 'yay-customer-reviews-woocommerce');
    let subResult = '';
    let pluralBe =
      frequency === 'every_review'
        ? __('is', 'yay-customer-reviews-woocommerce')
        : __('are', 'yay-customer-reviews-woocommerce');
    let pluralContain =
      frequency === 'every_review'
        ? __('contains', 'yay-customer-reviews-woocommerce')
        : __('contain', 'yay-customer-reviews-woocommerce');

    if (frequencySummary) {
      result += ` ${frequencySummary}`;
    }

    if (ratingSummary) {
      subResult +=
        __(' that', 'yay-customer-reviews-woocommerce') + ` ${pluralBe} ${ratingSummary}`;
    }

    if (mediaSummary) {
      subResult +=
        (ratingSummary
          ? __(' and', 'yay-customer-reviews-woocommerce')
          : __(' that', 'yay-customer-reviews-woocommerce')) + ` ${pluralContain} ${mediaSummary}`;
    }

    return result + subResult;
  }, [frequency, rating, media]);

  const coupon_value_suffix = watch(`rewards.${reward.id}.coupon_value_suffix`) || 'currency';
  const onSuffixChange = (suffix: string) => {
    setValue(`rewards.${reward.id}.coupon_value_suffix`, suffix, { shouldDirty: true });
  };

  return (
    <Collapsible className="yayrev-collapsible" defaultOpen={reward.is_open}>
      <CollapsibleTrigger
        asChild
        className="yayrev-collapsible-trigger w-full cursor-pointer flex-wrap rounded-md bg-white shadow-sm"
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
                      <TooltipContent>{__('Enable/disable reward', 'yay-customer-reviews-woocommerce')}</TooltipContent>
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
                <TooltipContent>{__('Duplicate', 'yay-customer-reviews-woocommerce')}</TooltipContent>
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
                        <DialogTitle>{__('Delete reward', 'yay-customer-reviews-woocommerce')}</DialogTitle>
                      </DialogHeader>
                      <div>{__('Are you sure you want to delete this reward?', 'yay-customer-reviews-woocommerce')}</div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          className=""
                          onClick={(e) => {
                            e.preventDefault();
                            setDeleteDialogOpen(false);
                          }}
                        >
                          {__('Cancel', 'yay-customer-reviews-woocommerce')}
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
                          {__('Delete reward', 'yay-customer-reviews-woocommerce')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>{__('Delete', 'yay-customer-reviews-woocommerce')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="yayrev-collapsible-content rounded-b-xl bg-white">
        <div className="flex flex-col gap-4 p-6">
          <div className="text-foreground text-lg font-semibold">{__('Coupon', 'yay-customer-reviews-woocommerce')}</div>
          <FormField
            control={control}
            name={`rewards.${reward.id}.coupon_type`}
            render={({ field: { value, onChange } }) => (
              <RadioGroup
                defaultValue="one_time_coupon"
                value={value}
                onValueChange={onChange}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="one_time_coupon" id="r1" />
                  <Label htmlFor="r1">
                    {__('Creates a unique one-time coupon for each review', 'yay-customer-reviews-woocommerce')}
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="manual_coupon" id="r2" />
                  <Label htmlFor="r2">{__('Manual coupon', 'yay-customer-reviews-woocommerce')}</Label>
                </div>
              </RadioGroup>
            )}
          />
          {couponType === 'manual_coupon' && (
            <>
              {/* Coupon selection */}
              <div className="max-w-[300px]">
                <Label
                  htmlFor={`rewards.${reward.id}.coupon_id`}
                  className="mb-2 w-full font-normal"
                >
                  {__('Select coupon to be sent', 'yay-customer-reviews-woocommerce')}
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
                          <SelectValue placeholder={__('Select coupon', 'yay-customer-reviews-woocommerce')} />
                        </SelectTrigger>
                        <SelectContent>
                          {coupons.length > 0 ? (
                            coupons.map((coupon) => (
                              <SelectItem
                                key={coupon.id}
                                value={coupon.id}
                                className="yayrev-coupon-select-item"
                              >
                                <div className="flex w-full items-center justify-between gap-2">
                                  <span>{coupon.code}</span>
                                  <span>
                                    {coupon.expired ? (
                                      <Badge variant="destructive" className="px-1 py-0">
                                        {__('expired', 'yay-customer-reviews-woocommerce')}
                                      </Badge>
                                    ) : (
                                      ''
                                    )}{' '}
                                    {coupon.out_of_usage ? (
                                      <Badge variant="secondary" className="px-1 py-0">
                                        {__('out of usage', 'yay-customer-reviews-woocommerce')}
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
                              {__('No coupons found', 'yay-customer-reviews-woocommerce')}
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
                    {__('Create new coupon', 'yay-customer-reviews-woocommerce')}
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
                      'yay-customer-reviews-woocommerce',
                    )}
                  </span>
                  {` `}
                  <a
                    className="text-foreground lowercase underline decoration-solid"
                    href={coupons.find((c) => c.id === coupon)?.edit_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {__('restrictions', 'yay-customer-reviews-woocommerce')}
                  </a>
                </span>
              )}
            </>
          )}

          {couponType === 'one_time_coupon' && (
            <div className="flex flex-col">
              <Label htmlFor={`rewards.${reward.id}.coupon_value`} className="mb-2 w-fit">
                <span>{__('Coupon amount', 'yay-customer-reviews-woocommerce')} </span>
                <span className="text-[#D50719]">*</span>
              </Label>
              <FormField
                control={control}
                name={`rewards.${reward.id}.coupon_value`}
                render={({ field: { value, onChange } }) => (
                  <InputNumberWithSuffix
                    width="w-[150px]"
                    name={`rewards.${reward.id}.coupon_value`}
                    value={Number(value)}
                    onChange={onChange}
                    suffix={coupon_value_suffix}
                    onSuffixChange={onSuffixChange}
                  />
                )}
              />
            </div>
          )}

          <hr className="border-t border-[#f0f0f0]" />
          {/* Send to */}
          <div className="text-foreground text-lg font-semibold">
            {__('Who can receive the reward?', 'yay-customer-reviews-woocommerce')}
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
                    <SelectValue placeholder={__('Select value', 'yay-customer-reviews-woocommerce')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_reviewers">
                      {__('All reviewers (include guest users)', 'yay-customer-reviews-woocommerce')}
                    </SelectItem>
                    <SelectItem value="purchased_customers">
                      {__('Purchased customers only', 'yay-customer-reviews-woocommerce')}
                    </SelectItem>
                    <SelectItem value="guest_users">
                      {__('Guest users only', 'yay-customer-reviews-woocommerce')}
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
              {__('Conditions to trigger the reward', 'yay-customer-reviews-woocommerce')}
            </div>
            <div className="max-w-[300px]">
              <Label htmlFor={`rewards.${reward.id}.frequency`} className="mb-2 w-fit">
                {__('Frequency', 'yay-customer-reviews-woocommerce')}
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
                      <SelectValue placeholder={__('Select requirement', 'yay-customer-reviews-woocommerce')} />
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
              <Label htmlFor={`rewards.${reward.id}.rating_requirement`} className="mb-2 w-fit">
                {__('Rating', 'yay-customer-reviews-woocommerce')}
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
                      <SelectValue placeholder={__('Select requirement', 'yay-customer-reviews-woocommerce')} />
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
            {enableMediaUpload && (
              <div className="max-w-[300px]">
                <Label htmlFor={`rewards.${reward.id}.media_requirement`} className="mb-2 w-fit">
                  {__('Media', 'yay-customer-reviews-woocommerce')}
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
                          <SelectValue placeholder={__('Select requirement', 'yay-customer-reviews-woocommerce')} />
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
