import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, useForm } from '@/components/ui/form';
import { toast, Toaster } from '@/components/ui/sonner';

import EmailIcon from './components/icons/Email';
import EmailQueueIcon from './components/icons/EmailQueue';
import GiftIcon from './components/icons/Gift';
import HomeIcon from './components/icons/Home';
import ReminderIcon from './components/icons/Reminder';
import ReviewIcon from './components/icons/Review';
import DashboardTab from './components/tabs/dashboard';
import EmailsTab from './components/tabs/emails';
import EmailsQueueTab from './components/tabs/emails-queue';
import ReminderTab from './components/tabs/reminder';
import ReviewTab from './components/tabs/review';
import ReviewRewardTab from './components/tabs/review-reward';
import { postSettings } from './lib/queries';
import { SettingsFormData, settingsSchema } from './lib/schema';
import { cn, getSettings } from './lib/utils';

const queryClient = new QueryClient();

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isScrolled, setIsScrolled] = useState(false);

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

  const [defaultValues, setDefaultValues] = useState(getSettings());

  useEffect(() => {
    const isDifferent = JSON.stringify(formValues) !== JSON.stringify(defaultValues);
    setHasChanges(isDifferent);
  }, [formValues, defaultValues]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function onSubmit(data: SettingsFormData) {
    try {
      // delete all toast
      toast.dismiss();
      setIsLoading(true);
      await postSettings(data);
      toast.success(__('Settings saved successfully', 'yay-reviews'));
      form.reset(data); // Reset form with new values after successful save
      setDefaultValues(data);
      setHasChanges(false); // Reset changes state
    } catch (error) {
      toast.error(__('Failed to save settings', 'yay-reviews'));
    } finally {
      setIsLoading(false);
    }
  }

  const menuItems = useMemo(() => {
    const result = [
      {
        label: __('Dashboard', 'yay-reviews'),
        icon: <HomeIcon />,
        key: 'dashboard',
      },
      {
        label: __('Review', 'yay-reviews'),
        icon: <ReviewIcon />,
        key: 'review',
      },
    ];

    if (addonReminder) {
      result.push({
        label: __('Reminder', 'yay-reviews'),
        icon: <ReminderIcon />,
        key: 'reminder',
      });
    }

    if (addonReward) {
      result.push({
        label: __('Review Reward', 'yay-reviews'),
        icon: <GiftIcon />,
        key: 'reward',
      });
    }

    if (addonReminder || addonReward) {
      result.push({
        label: __('Emails', 'yay-reviews'),
        icon: <EmailIcon />,
        key: 'emails',
      });
    }

    return result;
  }, [addonReminder, addonReward]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors, e) => {
            console.log(errors, e);
          })}
        >
          <div
            className={cn(
              'sticky top-[32px] z-50 flex items-center justify-between gap-4 bg-white transition-shadow duration-200',
              isScrolled && 'shadow-[0px_12px_24px_-20px_rgba(0,0,0,0.5)]',
            )}
          >
            <div className="flex items-center gap-4">
              <div className="border-r border-gray-100 p-2.5">
                <img
                  src={window.yayReviews.image_url + '/yay-reviews-logo.png'}
                  alt={__('Yay Reviews', 'yay-reviews')}
                  width={34}
                  height={34}
                />
              </div>
              {/* Navigation */}
              <div className="flex flex-wrap space-x-7">
                {menuItems.map((item) => (
                  <Button
                    key={item.key}
                    variant="link"
                    className={cn(
                      'flex h-[56px] items-center gap-2 rounded-none border-b-2 border-transparent p-1 text-gray-700 hover:text-[#2271B1] hover:no-underline focus:outline-none',
                      activeTab === item.key && 'border-[#2271B1] text-[#2271B1]',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab(item.key);
                    }}
                  >
                    {item.icon}
                    <span
                      style={
                        activeTab === item.key
                          ? {
                              textShadow: '0 0 0.01px currentcolor',
                            }
                          : {}
                      }
                    >
                      {item.label}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 pr-6">
              <Button type="submit" disabled={isLoading || !hasChanges}>
                {isLoading && <Loader2Icon className="animate-spin" />}
                {__('Save', 'yay-reviews')}
              </Button>
            </div>
          </div>
          {/* </Tabs> */}
          <div className="flex items-center justify-center px-6 py-12 pt-25">
            {activeTab === 'dashboard' && (
              <DashboardTab
                defaultValues={defaultValues}
                setDefaultValues={setDefaultValues}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'review' && <ReviewTab />}
            {activeTab === 'reminder' && <ReminderTab setActiveTab={setActiveTab} />}
            {activeTab === 'reward' && <ReviewRewardTab />}
            {activeTab === 'emails' && <EmailsTab />}
          </div>
        </form>
      </Form>
    </QueryClientProvider>
  );
}
