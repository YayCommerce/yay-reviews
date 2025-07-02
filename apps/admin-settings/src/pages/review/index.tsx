import PageLayout from '@/layouts/page-layout';
import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';
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
    <PageLayout>
      <PageTitle title={__('Review Settings', 'yay-reviews')} />
      <div className="container mx-auto px-7 py-0">
        <div className="flex flex-col gap-4">
          <UploadMediaCard />
          <DataProcessingConsentCard />
        </div>
      </div>
    </PageLayout>
  );
}

function UploadMediaCard() {
  const { control, watch } = useFormContext();
  const enabled = watch('reviews.upload_media');
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-foreground flex flex-wrap items-center gap-3 text-xl font-semibold">
            <span>{__('Upload Media', 'yay-reviews')}</span>
            <ActiveBadge enabled={enabled} />
          </div>
          <FormField
            control={control}
            name="reviews.upload_media"
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
            name="reviews.upload_required"
            render={({ field: { value, onChange } }) => (
              <Switch
                id="reviews.upload_required"
                checked={Boolean(value)}
                onCheckedChange={() => onChange(!value)}
              />
            )}
          />
          <Label htmlFor="reviews.upload_required">
            {__('Is media required when submitting a review?', 'yay-reviews')}
          </Label>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="reviews.media_type">{__('Media types', 'yay-reviews')}</Label>
            <FormField
              control={control}
              name="reviews.media_type"
              render={({ field: { value, onChange } }) => (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger id="reviews.media_type" className="w-full">
                    <SelectValue placeholder={__('Select types', 'yay-reviews')} />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      {
                        value: 'video_image',
                        label: __('Video and image', 'yay-reviews'),
                      },
                      {
                        value: 'only_video',
                        label: __('Only video', 'yay-reviews'),
                      },
                      {
                        value: 'only_image',
                        label: __('Only image', 'yay-reviews'),
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
            <Label htmlFor="reviews.max_upload_file_qty">
              {__('Maximum files', 'yay-reviews')}
            </Label>
            <FormField
              control={control}
              name="reviews.max_upload_file_qty"
              render={({ field: { value, onChange } }) => (
                <Input
                  id="reviews.max_upload_file_qty"
                  type="number"
                  value={value}
                  onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
                  className="w-full"
                  min={1}
                  max={window.yayReviews.upload_max_qty}
                />
              )}
            />
            <div className="text-muted-foreground mt-2 text-sm">
              {__('Maximum files customer can upload', 'yay-reviews')}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviews.max_upload_file_size">
              {__('Maximum file size', 'yay-reviews')}
            </Label>
            <FormField
              control={control}
              name="reviews.max_upload_file_size"
              render={({ field: { value, onChange } }) => (
                <Input
                  id="reviews.max_upload_file_size"
                  type="number"
                  value={value}
                  onChange={(e) => onChange(Math.max(10, Number(e.target.value)))}
                  className="w-full"
                  step={10}
                  min={10}
                  max={window.yayReviews.upload_max_size}
                />
              )}
            />
            <div className="text-muted-foreground mt-2 text-sm">
              {__('Maximum 102400Kbs', 'yay-reviews')}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reviews.upload_file_label">
            {__('Field label (optional)', 'yay-reviews')}
          </Label>
          <FormField
            control={control}
            name="reviews.upload_file_label"
            render={({ field: { value, onChange } }) => (
              <Input
                id="reviews.upload_file_label"
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
          <Label htmlFor="reviews.upload_file_description">
            {__('Field description (optional)', 'yay-reviews')}
          </Label>
          <FormField
            control={control}
            name="reviews.upload_file_description"
            render={({ field: { value, onChange } }) => (
              <Textarea
                id="reviews.upload_file_description"
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
  const enabled = watch('reviews.enable_gdpr');
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-foreground flex flex-wrap items-center gap-3 text-xl font-semibold">
            <span>{__('Data Processing Consent', 'yay-reviews')}</span>
            <ActiveBadge enabled={enabled} />
          </div>
          <FormField
            control={control}
            name="reviews.enable_gdpr"
            render={({ field: { value, onChange } }) => (
              <Switch checked={Boolean(value)} onCheckedChange={() => onChange(!value)} />
            )}
          />
        </div>
        <div className="border-t border-t-[#f0f0f0]" />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="reviews.before_message">{__('Before message', 'yay-reviews')}</Label>
          <FormField
            control={control}
            name="reviews.before_message"
            render={({ field: { value, onChange } }) => (
              <Textarea
                id="reviews.before_message"
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
          <Label htmlFor="reviews.gdpr_message">{__('Inline GDPR message', 'yay-reviews')}</Label>
          <FormField
            control={control}
            name="reviews.gdpr_message"
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
