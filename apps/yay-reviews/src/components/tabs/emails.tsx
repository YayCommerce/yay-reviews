import { useState } from 'react';
import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';

import EmailTemplateCard from '../EmailTemplateCard';
import { useFormContext } from '../ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function EmailsTab() {
  const { watch } = useFormContext();
  const addonReminder = watch('addons.reminder');
  const addonReward = watch('addons.reward');

  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  return (
    <div className="flex w-[90%] flex-col gap-8">
      <div className="text-foreground text-3xl font-bold">{__('Email Templates', 'yay-reviews')}</div>
      <div className="flex flex-col gap-4">
        {/* Email template */}
        <div className="flex flex-col gap-2">
          <Tabs defaultValue={addonReminder ? 'reminder' : 'reward'} className="gap-6">
            <TabsList className={cn('w-1/4', addonReminder && addonReward && 'w-1/2')}>
              {addonReminder && (
                <TabsTrigger value="reminder" className="w-1/2">
                  {__('Reminder', 'yay-reviews')}
                </TabsTrigger>
              )}
              {addonReward && (
                <TabsTrigger value="reward" className="w-1/2">
                  {__('Reward', 'yay-reviews')}
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="reminder" className="px-0">
              <EmailTemplateCard templateId="reminder" device={device} setDevice={setDevice} />
            </TabsContent>
            <TabsContent value="reward" className="px-0">
              <EmailTemplateCard templateId="reward" device={device} setDevice={setDevice} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
