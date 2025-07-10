import { useState } from 'react';
import PageLayout from '@/layouts/page-layout';
import ReviewProvider from '@/providers/review-provider';
import { __ } from '@wordpress/i18n';
import { toast } from 'sonner';

import { changeWcReviewsSettings } from '@/lib/ajax';
import { cn } from '@/lib/utils';
import useReviewContext from '@/hooks/use-review-context';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import PageTitle from '@/components/page-title';

export default function ReviewPage() {
  return (
    <ReviewProvider>
      <PageLayout>
        <PageTitle title={__('Review settings', 'yay-reviews')} />
        <div className="container mx-auto px-7 py-0">
          <div className="flex flex-col gap-4">
            <UploadMediaCard />
            <DataProcessingConsentCard />
            <WooCommerceSettingsCard />
          </div>
        </div>
      </PageLayout>
    </ReviewProvider>
  );
}

function UploadMediaCard() {
  const { control, watch } = useFormContext();
  const enableMediaUpload = watch('reviews.enable_media_upload');
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-foreground flex flex-wrap items-center gap-3 text-xl font-semibold">
            <span>{__('Upload media', 'yay-reviews')}</span>
            <ActiveBadge enabled={enableMediaUpload} />
          </div>
          <FormField
            control={control}
            name="reviews.enable_media_upload"
            render={({ field: { value, onChange } }) => (
              <Switch checked={Boolean(value)} onCheckedChange={() => onChange(!value)} />
            )}
          />
        </div>
        <div className="border-t border-t-[#f0f0f0]" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <FormField
            control={control}
            name="reviews.require_media_upload"
            render={({ field: { value, onChange } }) => (
              <Switch
                id="reviews.require_media_upload"
                checked={Boolean(value)}
                onCheckedChange={() => onChange(!value)}
              />
            )}
          />
          <Label htmlFor="reviews.require_media_upload">
            {__('Is media required when submitting a review?', 'yay-reviews')}
          </Label>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="reviews.allowed_media_types">{__('Media types', 'yay-reviews')}</Label>
            <FormField
              control={control}
              name="reviews.allowed_media_types"
              render={({ field: { value, onChange } }) => (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger id="reviews.allowed_media_types" className="w-full">
                    <SelectValue placeholder={__('Select types', 'yay-reviews')} />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      {
                        value: 'video_photo',
                        label: __('Video and photo', 'yay-reviews'),
                      },
                      {
                        value: 'only_video',
                        label: __('Only video', 'yay-reviews'),
                      },
                      {
                        value: 'only_photo',
                        label: __('Only photo', 'yay-reviews'),
                      },
                    ].map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviews.max_upload_files">
              {__('Maximum files per review', 'yay-reviews')}
            </Label>
            <FormField
              control={control}
              name="reviews.max_upload_files"
              render={({ field: { value, onChange } }) => (
                <Input
                  id="reviews.max_upload_files"
                  type="number"
                  value={value}
                  onChange={(e) =>
                    onChange(e.target.value == '' ? '' : Math.max(1, Number(e.target.value)))
                  }
                  placeholder={__('Unlimited', 'yay-reviews')}
                  className="w-full"
                  min={1}
                  max={20}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviews.max_upload_filesize">
              {__('Maximum file size (Kb)', 'yay-reviews')}
            </Label>
            <FormField
              control={control}
              name="reviews.max_upload_filesize"
              render={({ field: { value, onChange } }) => (
                <Input
                  id="reviews.max_upload_filesize"
                  type="number"
                  value={value}
                  onChange={(e) => onChange(Math.max(10, Number(e.target.value)))}
                  className="w-full"
                  step={10}
                  min={10}
                  max={window.yayReviews.upload_max_filesize}
                />
              )}
            />
            <div className="text-muted-foreground mt-2 text-sm">
              {__('Maximum 102400Kbs', 'yay-reviews')}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reviews.media_upload_label">
            {__('Field label (optional)', 'yay-reviews')}
          </Label>
          <FormField
            control={control}
            name="reviews.media_upload_label"
            render={({ field: { value, onChange } }) => (
              <Input
                id="reviews.media_upload_label"
                type="text"
                value={value}
                onChange={onChange}
                className="w-full"
                placeholder={__('Upload media', 'yay-reviews')}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reviews.media_upload_description">
            {__('Field description (optional)', 'yay-reviews')}
          </Label>
          <FormField
            control={control}
            name="reviews.media_upload_description"
            render={({ field: { value, onChange } }) => (
              <Textarea
                id="reviews.media_upload_description"
                rows={4}
                value={value}
                onChange={onChange}
                placeholder={__('Type your description here', 'yay-reviews')}
                className="w-full"
              />
            )}
          />
        </div>
      </div>
    </Card>
  );
}

function DataProcessingConsentCard() {
  const { control, watch } = useFormContext();
  const enableGdprConsent = watch('reviews.enable_gdpr_consent');
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-foreground flex flex-wrap items-center gap-3 text-xl font-semibold">
            <span>{__('Data processing consent', 'yay-reviews')}</span>
            <ActiveBadge enabled={enableGdprConsent} />
          </div>
          <FormField
            control={control}
            name="reviews.enable_gdpr_consent"
            render={({ field: { value, onChange } }) => (
              <Switch checked={Boolean(value)} onCheckedChange={() => onChange(!value)} />
            )}
          />
        </div>
        <div className="border-t border-t-[#f0f0f0]" />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="reviews.pre_gdpr_message">{__('Before message', 'yay-reviews')}</Label>
          <FormField
            control={control}
            name="reviews.pre_gdpr_message"
            render={({ field: { value, onChange } }) => (
              <Textarea
                id="reviews.pre_gdpr_message"
                rows={4}
                value={value}
                onChange={onChange}
                placeholder={__(
                  'We respect your privacy and need your consent to continue.',
                  'yay-reviews',
                )}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reviews.gdpr_consent_message">
            {__('Inline GDPR message', 'yay-reviews')}
          </Label>
          <FormField
            control={control}
            name="reviews.gdpr_consent_message"
            render={({ field: { value, onChange } }) => (
              <Textarea
                id="reviews.gdpr_message"
                rows={4}
                value={value}
                onChange={onChange}
                placeholder={__('I agree to the Privacy Policy.', 'yay-reviews')}
              />
            )}
          />
        </div>
      </div>
    </Card>
  );
}

function WooCommerceSettingsCard() {
  const { wcReviewsSettings, updateWcReviewsSettings } = useReviewContext();
  const [isLoadingUpdate, setIsLoadingUpdate] = useState('');

  const handleChangeWooCommerceSettings = (name: string, value: boolean) => {
    toast.dismiss();
    setIsLoadingUpdate(name);
    changeWcReviewsSettings(name, value).then((res) => {
      if (res.success) {
        updateWcReviewsSettings({
          ...wcReviewsSettings,
          [name]: value,
        });
        toast.success(
          (name === 'verification_label'
            ? __('Verified owner label', 'yay-reviews')
            : name === 'verification_required'
              ? __('Verification required', 'yay-reviews')
              : name === 'enable_review_rating'
                ? __('Star ratings enabled', 'yay-reviews')
                : __('Star ratings required', 'yay-reviews')) +
            ': ' +
            (value ? __('ON', 'yay-reviews') : __('OFF', 'yay-reviews')),
        );
      } else {
        toast.error(res.data.mess);
      }
      setIsLoadingUpdate('');
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-foreground flex flex-wrap items-center gap-3 text-xl font-semibold">
            <span>{__('WooCommerce Settings', 'yay-reviews')}</span>
          </div>
        </div>
        <div className="border-t border-t-[#f0f0f0]" />
      </div>

      <div className="text-sm">
        <span className="text-slate-500">{__('Manage ')}</span>
        <span
          className="cursor-pointer underline decoration-solid"
          onClick={() => {
            window.open(window.yayReviews.wc_settings_url, '_blank');
          }}
        >
          {__('WooCommerce settings', 'yay-reviews')}
        </span>
      </div>

      <div className="space-y-6">
        <div className="text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
          {__('Reviews', 'yay-reviews')}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="woocommerce_review_rating_verification_label"
            checked={Boolean(wcReviewsSettings.verification_label)}
            loading={isLoadingUpdate === 'verification_label'}
            onCheckedChange={(value) =>
              handleChangeWooCommerceSettings('verification_label', value)
            }
          />
          <Label htmlFor="woocommerce_review_rating_verification_label">
            {__('Show "verified owner" label on customer reviews', 'yay-reviews')}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="woocommerce_review_rating_verification_required"
            checked={Boolean(wcReviewsSettings.verification_required)}
            loading={isLoadingUpdate === 'verification_required'}
            onCheckedChange={(value) =>
              handleChangeWooCommerceSettings('verification_required', value)
            }
          />
          <Label htmlFor="woocommerce_review_rating_verification_required">
            {__('Reviews can only be left by "verified owners"', 'yay-reviews')}
          </Label>
        </div>
      </div>
      <hr className="yay-reviews-hr border-t border-[#f0f0f0]" />
      <div className="space-y-6">
        <div className="text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
          {__('Product ratings', 'yay-reviews')}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="woocommerce_enable_review_rating"
            checked={Boolean(wcReviewsSettings.enable_review_rating)}
            loading={isLoadingUpdate === 'enable_review_rating'}
            onCheckedChange={(value) =>
              handleChangeWooCommerceSettings('enable_review_rating', value)
            }
          />
          <Label htmlFor="woocommerce_enable_review_rating">
            {__('Enable star rating on reviews', 'yay-reviews')}
          </Label>
        </div>
        {wcReviewsSettings.enable_review_rating && (
          <div className="flex items-center gap-2">
            <Switch
              id="woocommerce_review_rating_required"
              checked={Boolean(wcReviewsSettings.review_rating_required)}
              loading={isLoadingUpdate === 'review_rating_required'}
              onCheckedChange={(value) =>
                handleChangeWooCommerceSettings('review_rating_required', value)
              }
            />
            <Label htmlFor="woocommerce_review_rating_required">
              {__('Star ratings should be required, not optional', 'yay-reviews')}
            </Label>
          </div>
        )}
      </div>
    </Card>
  );
}

function ActiveBadge({ enabled }: { enabled: boolean }) {
  return (
    <Badge
      variant={enabled ? 'default' : 'outline'}
      className={cn('text-xs transition-none', enabled && 'bg-green-600')}
    >
      {enabled ? __('Active', 'yay-reviews') : __('Inactive', 'yay-reviews')}
    </Badge>
  );
}
