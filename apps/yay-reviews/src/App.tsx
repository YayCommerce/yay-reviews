import { useState } from 'react';
// import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
// import { Form, useForm } from '@/components/ui/form';
import { toast, Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import DownloadIcon from './components/icons/Download';
import GiftIcon from './components/icons/Gift';
import HomeIcon from './components/icons/Home';
import NoteIcon from './components/icons/Note';
import ReminderIcon from './components/icons/Reminder';
import ReviewIcon from './components/icons/Review';
import DashboardTab from './components/tabs/dashboard';
import { __ } from './lib/utils';

const queryClient = new QueryClient();

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  // const form = useForm<SettingsFormData>({
  //   resolver: zodResolver(settingsSchema),
  //   defaultValues: [],
  // });

  // async function onSubmit(data: SettingsFormData) {
  //   try {
  //     setIsLoading(true);
  //     // await postSettings(data);
  //     toast.success('Settings saved successfully');
  //   } catch (error) {
  //     toast.error('Failed to save settings');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      {/* <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors, e) => {
            console.log(errors, e);
          })}
        > */}
      <Tabs defaultValue="dashboard">
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
                <HomeIcon fill="currentColor" />
                {__('dashboard')}
              </TabsTrigger>
              <TabsTrigger value="review">
                <ReviewIcon fill="currentColor" />
                {__('review')}
              </TabsTrigger>
              <TabsTrigger value="reminder">
                <ReminderIcon fill="currentColor" />
                {__('reminder')}
              </TabsTrigger>
              <TabsTrigger value="reward">
                <GiftIcon fill="currentColor" />
                {__('review_reward')}
              </TabsTrigger>
              <TabsTrigger value="optional-fields">
                <NoteIcon fill="currentColor" />
                {__('optional_fields')}
              </TabsTrigger>
              <TabsTrigger value="export-import">
                <DownloadIcon fill="currentColor" />
                {__('import_export_reviews')}
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex items-center gap-2 p-2.5">
            <Button type="button" variant="outline">
              {__('preview_form')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {__('save')}
            </Button>
          </div>
        </div>
        <div className="bg-gray-50 p-6">
          <TabsContent value="dashboard" className="data-[state=inactive]:hidden" forceMount>
            <DashboardTab />
          </TabsContent>
          {/* <TabsContent value="review" className="data-[state=inactive]:hidden" forceMount>
            <ReviewTab />
          </TabsContent>
          <TabsContent value="coupon" className="data-[state=inactive]:hidden" forceMount>
            <CouponTab />
          </TabsContent> */}
        </div>
      </Tabs>
      {/* </form>
      </Form> */}
    </QueryClientProvider>
  );
}
