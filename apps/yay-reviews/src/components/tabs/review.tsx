import PageLayout from '@/layouts/page-layout';
import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';

import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FormField, useFormContext } from '../ui/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

export default function ReviewTab() {
  const { control, watch } = useFormContext();
  const uploadMedia = watch('reviews.upload_media');
  const enableGdpr = watch('reviews.enable_gdpr');

  return (
    <PageLayout>
      <div className="text-foreground text-3xl font-bold">
        {__('Review Settings', 'yay-reviews')}
      </div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="border-border flex items-center justify-between gap-4 border-b pb-4">
              <span className="flex items-center gap-3 text-lg">
                {__('Upload media', 'yay-reviews')}{' '}
                <Badge
                  variant={uploadMedia ? 'default' : 'outline'}
                  className={cn('text-xs transition-none', uploadMedia && 'bg-green-600')}
                >
                  {uploadMedia ? __('Active', 'yay-reviews') : __('Inactive', 'yay-reviews')}
                </Badge>
              </span>

              <FormField
                control={control}
                name={`reviews.upload_media`}
                render={({ field: { value, onChange } }) => (
                  <Switch checked={Boolean(value)} onCheckedChange={() => onChange(!value)} />
                )}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="w-full max-w-[500px]">
              <div className="flex w-full flex-col gap-4">
                {/* Is Required */}
                <div className="flex items-center gap-2">
                  <FormField
                    control={control}
                    name={`reviews.upload_required`}
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        id="reviews.upload_required"
                        checked={Boolean(value)}
                        onCheckedChange={() => onChange(!value)}
                      />
                    )}
                  />
                  <Label htmlFor="reviews.upload_required" className="font-normal lowercase">
                    {__('Mark as required when submitting a review?', 'yay-reviews')}
                  </Label>
                </div>
                {/* Media Types */}
                <div className="flex max-w-[200px] flex-col gap-2">
                  <Label htmlFor="reviews.media_type" className="font-normal">
                    {__('Media types', 'yay-reviews')}
                  </Label>
                  <FormField
                    control={control}
                    name={`reviews.media_type`}
                    render={({ field: { value, onChange } }) => (
                      <Select value={value} onValueChange={onChange}>
                        <SelectTrigger id="reviews.media_type" className="w-full">
                          <SelectValue placeholder={__('Select types', 'yay-reviews')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video_image">
                            {__('Video and image', 'yay-reviews')}
                          </SelectItem>
                          <SelectItem value="only_video">
                            {__('Only video', 'yay-reviews')}
                          </SelectItem>
                          <SelectItem value="only_image">
                            {__('Only image', 'yay-reviews')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {/* Maximum Files */}
                <div className="flex max-w-[200px] flex-col gap-2">
                  <Label htmlFor="reviews.max_upload_file_qty" className="font-normal">
                    {__('Maximum files', 'yay-reviews')}
                  </Label>
                  <FormField
                    control={control}
                    name={`reviews.max_upload_file_qty`}
                    render={({ field: { value, onChange } }) => (
                      <Input
                        id="reviews.max_upload_file_qty"
                        type="number"
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className="w-full"
                        min={1}
                        max={window.yayReviews.upload_max_qty}
                      />
                    )}
                  />
                  <span className="text-xs text-slate-500">
                    {__('Maximum files customer can upload', 'yay-reviews')}
                  </span>
                </div>
                {/* Maximum File Size */}
                <div className="flex max-w-[200px] flex-col gap-2">
                  <Label htmlFor="reviews.max_upload_file_size" className="font-normal">
                    {__('Maximum file size (Kbs)', 'yay-reviews')}
                  </Label>
                  <FormField
                    control={control}
                    name={`reviews.max_upload_file_size`}
                    render={({ field: { value, onChange } }) => (
                      <Input
                        id="reviews.max_upload_file_size"
                        type="number"
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className="w-full"
                        min={1}
                        max={window.yayReviews.upload_max_size}
                      />
                    )}
                  />
                  <span className="text-xs text-slate-500">
                    {__('Maximum', 'yay-reviews')} {window.yayReviews.upload_max_size}
                    {__('Kbs', 'yay-reviews')}
                  </span>
                </div>
                {/* Field Label */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reviews.upload_file_label" className="font-normal">
                    {__('Field label (optional)', 'yay-reviews')}
                  </Label>
                  <FormField
                    control={control}
                    name={`reviews.upload_file_label`}
                    render={({ field: { value, onChange } }) => (
                      <Input
                        id="reviews.upload_file_label"
                        type="text"
                        value={value}
                        onChange={onChange}
                        className="w-full"
                      />
                    )}
                  />
                </div>
                {/* Field Description */}
                <div className="flex w-full flex-col gap-2">
                  <Label htmlFor="reviews.upload_file_description" className="font-normal">
                    {__('Field description (optional)', 'yay-reviews')}
                  </Label>
                  <FormField
                    control={control}
                    name={`reviews.upload_file_description`}
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
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="border-border flex items-center justify-between gap-4 border-b pb-4">
              <span className="flex items-center gap-3 text-lg">
                {__('Data processing consent', 'yay-reviews')}
                <Badge
                  variant={enableGdpr ? 'default' : 'outline'}
                  className={cn('text-xs transition-none', enableGdpr && 'bg-green-600')}
                >
                  {enableGdpr ? __('Active', 'yay-reviews') : __('Inactive', 'yay-reviews')}
                </Badge>
              </span>
              <FormField
                control={control}
                name={`reviews.enable_gdpr`}
                render={({ field: { value, onChange } }) => (
                  <Switch checked={Boolean(value)} onCheckedChange={() => onChange(!value)} />
                )}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex w-full flex-col gap-4">
              {/* Before message */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="reviews.before_message" className="font-normal">
                  {__('Before message', 'yay-reviews')}
                </Label>
                <FormField
                  control={control}
                  name={`reviews.before_message`}
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
              {/* GDPR message */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="reviews.gdpr_message" className="font-normal">
                  {__('Inline GDPR message', 'yay-reviews')}
                </Label>
                <FormField
                  control={control}
                  name={`reviews.gdpr_message`}
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
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
