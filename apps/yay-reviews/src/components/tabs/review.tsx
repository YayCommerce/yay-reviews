import { __ } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

export default function ReviewTab() {
  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="text-foreground text-3xl font-bold">{__('review_settings')}</div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="border-border flex items-center justify-between border-b pb-4">
              <span className="text-lg">{__('upload_media')}</span>
              <Switch />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {/* Is Required */}
              <div className="flex items-center gap-2">
                <Switch />
                <span className="lowercase">{__('is_required')}</span>
              </div>
              {/* Media Types */}
              <div className="flex flex-col gap-1">
                <span>{__('media_types')}</span>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={__('select_types')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video_image">{__('video_and_image')}</SelectItem>
                    <SelectItem value="only_video">{__('only_video')}</SelectItem>
                    <SelectItem value="only_image">{__('only_image')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Maximum Files */}
              <div className="flex flex-col gap-1">
                <div>{__('maximum_files')}</div>
                <Input type="text" defaultValue={5} className="w-1/2" />
                <span className="text-sm text-slate-500">{__('maximum_files_desc')}</span>
              </div>
              {/* Maximum File Size */}
              <div className="flex flex-col gap-1">
                <div>{__('maximum_file_size')} (Kbs)</div>
                <Input type="number" defaultValue={1000} className="w-1/2" />
                <span className="text-sm text-slate-500">{__('maximum_file_size_desc')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="border-border flex items-center justify-between border-b pb-4">
              <span className="text-lg">{__('data_process_consent')}</span>
              <Switch />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {/* GDPR message */}
              <div className="flex flex-col gap-1">
                <div>{__('gdpr_message')}</div>
                <Textarea rows={3} defaultValue={__('gdpr_message_default')} />
              </div>
              {/* Before message */}
              <div className="flex flex-col gap-1">
                <div>{__('before_message')}</div>
                <Textarea rows={3} defaultValue={__('before_message_default')} />
              </div>
              {/* After message */}
              <div className="flex flex-col gap-1">
                <div>{__('after_message')}</div>
                <Textarea rows={3} defaultValue={__('after_message_default')} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
