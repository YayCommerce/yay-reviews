import PageLayout from '@/layouts/page-layout';
import EmailsProvider from '@/providers/emails-provider';
import { __ } from '@wordpress/i18n';

import useAddonStatus from '@/hooks/use-addon-status';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTitle from '@/components/page-title';

import TemplateCard from './template-card';

export default function EmailsPage() {
  const { isReminderEnabled, isRewardEnabled } = useAddonStatus();

  return (
    <EmailsProvider>
      <PageLayout className="w-[90%]">
        <PageTitle title={__('Email templates', 'yay-customer-reviews-woocommerce')} />
        <div className="container mx-auto space-y-8 px-7 py-0">
          {/* Email template */}
          <div className="flex flex-col gap-2.5">
            <Tabs defaultValue={isReminderEnabled ? 'reminder' : 'reward'} className="w-full">
              <TabsList className="bg-muted h-9 w-full max-w-[400px] rounded-lg p-1">
                {isReminderEnabled && (
                  <TabsTrigger
                    value="reminder"
                    className="flex items-center justify-center text-sm font-medium"
                  >
                    {__('Reminder', 'yay-customer-reviews-woocommerce')}
                  </TabsTrigger>
                )}
                {isRewardEnabled && (
                  <TabsTrigger
                    value="reward"
                    className="flex items-center justify-center text-sm font-medium"
                  >
                    {__('Reward', 'yay-customer-reviews-woocommerce')}
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
