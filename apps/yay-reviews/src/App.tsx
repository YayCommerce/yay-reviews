import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Form, useForm } from '@/components/ui/form';
import { toast, Toaster } from '@/components/ui/sonner';

import EmailIcon from './components/icons/Email';
import GiftIcon from './components/icons/Gift';
import HomeIcon from './components/icons/Home';
// import NoteIcon from './components/icons/Note';
import ReminderIcon from './components/icons/Reminder';
import ReviewIcon from './components/icons/Review';
import DashboardTab from './components/tabs/dashboard';
import EmailsTab from './components/tabs/emails';
// import OptionalFieldTab from './components/tabs/optional-field';
import ReminderTab from './components/tabs/reminder';
import ReviewTab from './components/tabs/review';
import ReviewRewardTab from './components/tabs/review-reward';
import { postSettings } from './lib/queries';
import { SettingsFormData, settingsSchema } from './lib/schema';
import { __, cn, getSettings } from './lib/utils';

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
              {/* Navigation */}
              <div className="flex space-x-6">
                <Button
                  variant="link"
                  className={cn(
                    'flex h-[55px] items-center gap-2 rounded-none border-b-2 border-transparent text-gray-700 hover:text-[#2271B1] hover:no-underline focus:outline-none',
                    activeTab === 'dashboard' && 'border-[#2271B1] text-[#2271B1]',
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('dashboard');
                  }}
                >
                  <HomeIcon />
                  {__('dashboard')}
                </Button>
                <Button
                  variant="link"
                  className={cn(
                    'flex h-[55px] items-center gap-2 rounded-none border-b-2 border-transparent text-gray-700 hover:text-[#2271B1] hover:no-underline focus:outline-none',
                    activeTab === 'review' && 'border-[#2271B1] text-[#2271B1]',
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('review');
                  }}
                >
                  <ReviewIcon />
                  {__('review')}
                </Button>
                {addonReminder && (
                  <Button
                    variant="link"
                    className={cn(
                      'flex h-[55px] items-center gap-2 rounded-none border-b-2 border-transparent text-gray-700 hover:text-[#2271B1] hover:no-underline focus:outline-none',
                      activeTab === 'reminder' && 'border-[#2271B1] text-[#2271B1]',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('reminder');
                    }}
                  >
                    <ReminderIcon />
                    {__('reminder')}
                  </Button>
                )}
                {addonReward && (
                  <Button
                    variant="link"
                    className={cn(
                      'flex h-[55px] items-center gap-2 rounded-none border-b-2 border-transparent text-gray-700 hover:text-[#2271B1] hover:no-underline focus:outline-none',
                      activeTab === 'review-reward' && 'border-[#2271B1] text-[#2271B1]',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('review-reward');
                    }}
                  >
                    <GiftIcon />
                    {__('review_reward')}
                  </Button>
                )}
                {(addonReminder || addonReward) && (
                  <Button
                    variant="link"
                    className={cn(
                      'flex h-[55px] items-center gap-2 rounded-none border-b-2 border-transparent text-gray-700 hover:text-[#2271B1] hover:no-underline focus:outline-none',
                      activeTab === 'emails' && 'border-[#2271B1] text-[#2271B1]',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('emails');
                    }}
                  >
                    <EmailIcon />
                    {__('emails')}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 pr-6">
              <Button type="submit" disabled={isLoading || !hasChanges}>
                {__('save')}
              </Button>
            </div>
          </div>
          {/* </Tabs> */}
          <div className="flex items-center justify-center px-6 py-12">
            {activeTab === 'dashboard' && <DashboardTab setActiveTab={setActiveTab} />}
            {activeTab === 'review' && <ReviewTab />}
            {activeTab === 'reminder' && <ReminderTab setActiveTab={setActiveTab} />}
            {activeTab === 'review-reward' && <ReviewRewardTab setActiveTab={setActiveTab} />}
            {activeTab === 'emails' && <EmailsTab />}
          </div>
        </form>
      </Form>
    </QueryClientProvider>
  );
}
