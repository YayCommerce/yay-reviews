import { useContext } from 'react';
import { EmailsContext } from '@/providers/emails-provider';

export default function useEmailsContext() {
  const context = useContext(EmailsContext);
  if (!context) {
    throw new Error('useEmailsContext must be used within an EmailsProvider');
  }
  return context;
}
