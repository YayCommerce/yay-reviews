import { __ } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FormField, useFormContext } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

export default function ReviewTab() {
  const { control } = useFormContext();

  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="text-foreground text-3xl font-bold">{__('review_settings')}</div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="border-border flex items-center justify-between border-b pb-4">
              <span className="text-lg">{__('upload_media')}</span>
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
            <div className="w-full sm:w-1/2">
              <div className="flex w-full flex-col gap-2">
                {/* Is Required */}
                <div className="flex items-center gap-2">
                  <FormField
                    control={control}
                    name={`reviews.upload_required`}
                    render={({ field: { value, onChange } }) => (
                      <Switch checked={Boolean(value)} onCheckedChange={() => onChange(!value)} />
                    )}
                  />
                  <span className="lowercase">{__('is_required')}</span>
                </div>
                {/* Media Types */}
                <div className="flex flex-col gap-1">
                  <span>{__('media_types')}</span>
                  <FormField
                    control={control}
                    name={`reviews.media_type`}
                    render={({ field: { value, onChange } }) => (
                      <Select value={value} onValueChange={onChange}>
                        <SelectTrigger className="w-1/2">
                          <SelectValue placeholder={__('select_types')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video_image">{__('video_and_image')}</SelectItem>
                          <SelectItem value="only_video">{__('only_video')}</SelectItem>
                          <SelectItem value="only_image">{__('only_image')}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {/* Maximum Files */}
                <div className="flex flex-col gap-1">
                  <div>{__('maximum_files')}</div>
                  <FormField
                    control={control}
                    name={`reviews.max_upload_file_qty`}
                    render={({ field: { value, onChange } }) => (
                      <Input
                        type="number"
                        value={value}
                        onChange={onChange}
                        className="w-1/2"
                        min={1}
                        max={window.yayReviews.upload_max_qty}
                      />
                    )}
                  />
                  <span className="text-xs text-slate-500">{__('maximum_files_desc')}</span>
                </div>
                {/* Maximum File Size */}
                <div className="flex flex-col gap-1">
                  <div>{__('maximum_file_size')} (Kbs)</div>
                  <FormField
                    control={control}
                    name={`reviews.max_upload_file_size`}
                    render={({ field: { value, onChange } }) => (
                      <Input
                        type="number"
                        value={value}
                        onChange={onChange}
                        className="w-1/2"
                        min={1}
                        max={window.yayReviews.upload_max_size}
                      />
                    )}
                  />
                  <span className="text-xs text-slate-500">
                    {__('maximum')} {window.yayReviews.upload_max_size}
                    {__('Kbs')}
                  </span>
                </div>
                {/* Field Label */}
                <div className="flex flex-col gap-1">
                  <div>{__('field_label')}</div>
                  <FormField
                    control={control}
                    name={`reviews.upload_file_label`}
                    render={({ field: { value, onChange } }) => (
                      <Input type="text" value={value} onChange={onChange} className="w-full" />
                    )}
                  />
                </div>
              </div>
            </div>
            {/* Field Description */}
            <div className="flex w-full flex-col gap-1">
              <div>{__('field_description')}</div>
              <FormField
                control={control}
                name={`reviews.upload_file_description`}
                render={({ field: { value, onChange } }) => (
                  <Textarea
                    rows={3}
                    value={value}
                    onChange={onChange}
                    placeholder={__('field_description_default')}
                    className="w-full"
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="border-border flex items-center justify-between border-b pb-4">
              <span className="text-lg">{__('data_processing_consent')}</span>
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
            <div className="flex flex-col gap-2">
              {/* GDPR message */}
              <div className="flex flex-col gap-1">
                <div>{__('gdpr_message')}</div>
                <FormField
                  control={control}
                  name={`reviews.gdpr_message`}
                  render={({ field: { value, onChange } }) => (
                    <Textarea
                      rows={3}
                      value={value}
                      onChange={onChange}
                      placeholder={__('gdpr_message_default')}
                    />
                  )}
                />
              </div>
              {/* Before message */}
              <div className="flex flex-col gap-1">
                <div>{__('before_message')}</div>
                <FormField
                  control={control}
                  name={`reviews.before_message`}
                  render={({ field: { value, onChange } }) => (
                    <Textarea
                      rows={3}
                      value={value}
                      onChange={onChange}
                      placeholder={__('before_message_default')}
                    />
                  )}
                />
              </div>
              {/* After message */}
              <div className="flex flex-col gap-1">
                <div>{__('after_message')}</div>
                <FormField
                  control={control}
                  name={`reviews.after_message`}
                  render={({ field: { value, onChange } }) => (
                    <Textarea
                      rows={3}
                      value={value}
                      onChange={onChange}
                      placeholder={__('after_message_default')}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
