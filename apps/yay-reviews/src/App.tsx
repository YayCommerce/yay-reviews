import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { toast, Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();

export default function App() {
  const [isLoading, setIsLoading] = useState(false);

  // async function onSubmit(data: SettingsFormData) {
  //   try {
  //     setIsLoading(true);
  //     await postSettings(data);
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
      Admin layout
    </QueryClientProvider>
  );
}
