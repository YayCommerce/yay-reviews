import { useContext, useState } from 'react';
import PageLayout from '@/layouts/page-layout';
import EmailsProvider, { EmailsContext } from '@/providers/emails-provider';
import { __ } from '@wordpress/i18n';

import useEmailsContext from '@/hooks/use-emails-context';
import { useFormContext } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTitle from '@/components/page-title';

import TemplateCard from './template-card';

export default function EmailsPage() {
  const { watch } = useFormContext();
  const reminderEnabled = watch('addons.reminder');
  const rewardEnabled = watch('addons.reward');

  return (
    <EmailsProvider>
      <PageLayout className="w-[90%]">
        <PageTitle title={__('Email templates', 'yay-reviews')} />
        <div className="container mx-auto space-y-8 px-7 py-0">
          {/* Email template */}
          <div className="flex flex-col gap-2.5">
            <Tabs defaultValue={reminderEnabled ? 'reminder' : 'reward'} className="w-full">
              <TabsList className="w-full bg-muted h-9 max-w-[400px] rounded-lg p-1">
                {reminderEnabled && (
                  <TabsTrigger
                    value="reminder"
                    className="flex items-center justify-center text-sm font-medium"
                  >
                    {__('Reminder', 'yay-reviews')}
                  </TabsTrigger>
                )}
                {rewardEnabled && (
                  <TabsTrigger
                    value="reward"
                    className="flex items-center justify-center text-sm font-medium"
                  >
                    {__('Reward', 'yay-reviews')}
                  </TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="reminder" className="px-0">
                <TemplateCard templateId="reminder" />
              </TabsContent>
              <TabsContent value="reward" className="px-0">
                <TemplateCard templateId="reward" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageLayout>
    </EmailsProvider>
  );
}
