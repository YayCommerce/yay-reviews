import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { __ } from '@wordpress/i18n';

import { Form, useForm } from '@/components/ui/form';
import { toast, Toaster } from '@/components/ui/sonner';

import Nav from './components/nav';
import useAppContext from './hooks/use-app-context';
import { postSettings } from './lib/queries';
import { SettingsFormData, settingsSchema } from './lib/schema';
import { getSettings } from './lib/utils';
import DashboardPage from './pages/lite/dashboard';
import EmailsPage from './pages/lite/emails';
import EmailsQueuePage from './pages/lite/emails-queue';
import ReminderPage from './pages/lite/reminder';
import ReviewPage from './pages/lite/review';
import RewardPage from './pages/pro/reward';
import RewardFallback from './pages/pro/reward/fallback';
import { withProFeature } from './utils/withProFeature';

export default function App() {
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: getSettings(),
    mode: 'onChange',
  });

  async function onSubmit(data: SettingsFormData) {
    try {
      // delete all toast
      toast.dismiss();
      await postSettings(data);
      toast.success(__('Settings saved successfully', 'yay-reviews'));
      form.reset(data); // Reset form with new values after successful save
    } catch (error) {
      toast.error(__('Failed to save settings', 'yay-reviews'));
    }
  }

  return (
    <>
      <Toaster />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors, e) => {
            console.log(errors, e);
          })}
        >
          <Nav />
          <PageContent />
        </form>
      </Form>
    </>
  );
}

const Reward = withProFeature(
  () => <RewardPage />,
  () => <RewardFallback />,
);

function PageContent() {
  const { activeTab } = useAppContext();
  const Comp = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'review':
        return <ReviewPage />;
      case 'reminder':
        return <ReminderPage />;
      case 'reward':
        return <Reward />;
      case 'emails':
        return <EmailsPage />;
      case 'emails-queue':
        return <EmailsQueuePage />;
      default:
        return <DashboardPage />;
    }
  }, [activeTab]);
  return Comp;
}
