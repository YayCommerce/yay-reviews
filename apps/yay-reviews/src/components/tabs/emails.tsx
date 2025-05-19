import { useState } from 'react';

import { __ } from '@/lib/utils';

import EmailTemplateCard from '../EmailTemplateCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function EmailsTab() {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="text-foreground text-3xl font-bold">{__('emails_settings')}</div>
      <div className="flex flex-col gap-4">
        {/* Email template */}
        <div className="flex flex-col gap-2">
          <Tabs defaultValue="reminder" className="gap-6">
            <TabsList className="w-1/2">
              <TabsTrigger value="reminder" className="w-1/2">
                {__('reminder')}
              </TabsTrigger>
              <TabsTrigger value="reward" className="w-1/2">
                {__('reward')}
              </TabsTrigger>
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
