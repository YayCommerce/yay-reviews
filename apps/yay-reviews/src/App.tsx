import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Form, useForm } from '@/components/ui/form';
import { toast, Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import EmailIcon from './components/icons/Email';
import GiftIcon from './components/icons/Gift';
import HomeIcon from './components/icons/Home';
// import NoteIcon from './components/icons/Note';
import ReminderIcon from './components/icons/Reminder';
import ReviewIcon from './components/icons/Review';
import DashboardTab from './components/tabs/dashboard';
import EmailsTab from './components/tabs/emails';
import OptionalFieldTab from './components/tabs/optional-field';
import ReminderTab from './components/tabs/reminder';
import ReviewTab from './components/tabs/review';
import ReviewRewardTab from './components/tabs/review-reward';
import { postSettings } from './lib/queries';
import { SettingsFormData, settingsSchema } from './lib/schema';
import { __, getSettings } from './lib/utils';

const queryClient = new QueryClient();

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: getSettings(),
    mode: 'onChange',
  });

  const addonReminder = form.watch('addons.reminder');
  const addonReward = form.watch('addons.reward');
  // const addonOptionalFields = form.watch('addons.optional_fields');

  // Watch all form values for changes
  const formValues = form.watch();
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const defaultValues = getSettings();
    const isDifferent = JSON.stringify(formValues) !== JSON.stringify(defaultValues);
    setHasChanges(isDifferent);
  }, [formValues]);

  async function onSubmit(data: SettingsFormData) {
    try {
      setIsLoading(true);
      await postSettings(data);
      toast.success('Settings saved successfully');
      form.reset(data); // Reset form with new values after successful save
      setHasChanges(false); // Reset changes state
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors, e) => {
            console.log(errors, e);
          })}
        >
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-4">
                <div className="border-r border-gray-100 p-2.5">
                  <img
                    src={window.yayReviews.image_url + '/yay-reviews-logo.png'}
                    alt="Yay Reviews"
                    width={34}
                    height={34}
                  />
                </div>
                <TabsList>
                  <TabsTrigger value="dashboard">
                    <HomeIcon />
                    {__('dashboard')}
                  </TabsTrigger>
                  <TabsTrigger value="review">
                    <ReviewIcon />
                    {__('review')}
                  </TabsTrigger>
                  {addonReminder && (
                    <TabsTrigger value="reminder">
                      <ReminderIcon />
                      {__('reminder')}
                    </TabsTrigger>
                  )}
                  {addonReward && (
                    <TabsTrigger value="reward">
                      <GiftIcon />
                      {__('review_reward')}
                    </TabsTrigger>
                  )}
                  {(addonReminder || addonReward) && (
                    <TabsTrigger value="emails">
                      <EmailIcon />
                      {__('emails')}
                    </TabsTrigger>
                  )}
                  {/* {addonOptionalFields && (
                    <TabsTrigger value="optional_fields">
                      <NoteIcon />
                      {__('optional_fields')}
                    </TabsTrigger>
                  )} */}
                </TabsList>
              </div>
              <div className="flex items-center gap-2 p-2.5">
                {/* <Button type="button" variant="outline">
                  {__('preview_form')}
                </Button> */}
                <Button type="submit" disabled={isLoading || !hasChanges}>
                  {__('save')}
                </Button>
              </div>
            </div>
            <div className="p-6">
              <TabsContent
                value="dashboard"
                className="flex items-center justify-center data-[state=inactive]:hidden"
                forceMount
              >
                <DashboardTab setActiveTab={setActiveTab} />
              </TabsContent>
              <TabsContent
                value="review"
                className="flex items-center justify-center data-[state=inactive]:hidden"
                forceMount
              >
                <ReviewTab />
              </TabsContent>
              <TabsContent
                value="reminder"
                className="flex items-center justify-center data-[state=inactive]:hidden"
                forceMount
              >
                <ReminderTab setActiveTab={setActiveTab} />
              </TabsContent>
              <TabsContent
                value="reward"
                className="flex items-center justify-center data-[state=inactive]:hidden"
                forceMount
              >
                <ReviewRewardTab setActiveTab={setActiveTab} />
              </TabsContent>
              <TabsContent
                value="optional_fields"
                className="flex items-center justify-center data-[state=inactive]:hidden"
                forceMount
              >
                <OptionalFieldTab />
              </TabsContent>
              <TabsContent
                value="emails"
                className="flex items-center justify-center data-[state=inactive]:hidden"
                forceMount
              >
                <EmailsTab />
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </Form>
    </QueryClientProvider>
  );
}
