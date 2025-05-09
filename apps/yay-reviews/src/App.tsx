import { useState } from 'react';
// import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
// import { Form, useForm } from '@/components/ui/form';
import { toast, Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import GeneralTab from './components/tabs/general';
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
      <Tabs defaultValue="general">
        <div className="flex items-center justify-between gap-4 bg-white p-4">
          <TabsList>
            <TabsTrigger value="general">{__('general')}</TabsTrigger>
            <TabsTrigger value="review">{__('review')}</TabsTrigger>
            <TabsTrigger value="coupon">{__('coupon')}</TabsTrigger>
          </TabsList>
          {/* <Button type="submit" disabled={isLoading}>
            {__('save_changes')}
          </Button> */}
        </div>
        <div className="bg-gray-50 p-6">
          <TabsContent value="general" className="data-[state=inactive]:hidden" forceMount>
            <GeneralTab />
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
