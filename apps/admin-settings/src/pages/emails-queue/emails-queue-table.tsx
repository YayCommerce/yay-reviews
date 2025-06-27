import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { EmailQueue } from 'types/email-queue';

import { dismissEmail, sendEmail } from '@/lib/ajax';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SendIcon from '@/components/icons/SendIcon';
import XIcon from '@/components/icons/XIcon';

export default function EmailsQueueTable({ emails }: { emails: EmailQueue[] }) {
  const queryClient = useQueryClient();

  const [loadingStates, setLoadingStates] = useState<{
    send: { [key: string]: boolean };
    dismiss: { [key: string]: boolean };
  }>({
    send: {},
    dismiss: {},
  });

  const handleSendEmail = (emailId: string) => {
    // delete all toast
    toast.dismiss();
    setLoadingStates((prev) => ({
      ...prev,
      send: { ...prev.send, [emailId]: true },
    }));

    sendEmail(emailId)
      .then((res) => {
        if (res.success) {
          toast.success(res.data.mess);
          queryClient.setQueryData(['emails'], res.data.emails);
        } else {
          toast.error(res.data.mess);
        }
      })
      .finally(() => {
        setLoadingStates((prev) => ({
          ...prev,
          send: { ...prev.send, [emailId]: false },
        }));
      });
  };

  const handleDismissEmail = (emailId: string) => {
    // delete all toast
    toast.dismiss();
    setLoadingStates((prev) => ({
      ...prev,
      dismiss: { ...prev.dismiss, [emailId]: true },
    }));

    dismissEmail(emailId)
      .then((res) => {
        if (res.success) {
          toast.success(res.data.mess);
          queryClient.setQueryData(['emails'], res.data.emails);
        } else {
          toast.error(res.data.mess);
        }
      })
      .finally(() => {
        setLoadingStates((prev) => ({
          ...prev,
          dismiss: { ...prev.dismiss, [emailId]: false },
        }));
      });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{__('ID', 'yay-reviews')}</TableHead>
          <TableHead>{__('Email type', 'yay-reviews')}</TableHead>
          <TableHead>{__('Status', 'yay-reviews')}</TableHead>
          <TableHead>{__('Customer email', 'yay-reviews')}</TableHead>
          <TableHead>{__('Date created', 'yay-reviews')}</TableHead>
          <TableHead>{__('Actions', 'yay-reviews')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emails.map((email) => (
          <TableRow key={email.id}>
            <TableCell>{email.id}</TableCell>
            <TableCell className="capitalize">{email.type}</TableCell>
            <TableCell>
              {email.status === '0'
                ? __('Queue', 'yay-reviews')
                : email.status === '1'
                  ? __('Sent', 'yay-reviews')
                  : __('Error', 'yay-reviews')}
            </TableCell>
            <TableCell>{email.customer_email}</TableCell>
            <TableCell>{email.created_at}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={loadingStates.send[email.id] || loadingStates.dismiss[email.id]}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSendEmail(email.id);
                        }}
                      >
                        {loadingStates.send[email.id] ? (
                          <Loader2Icon className="animate-spin" />
                        ) : (
                          <SendIcon />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{__('Send', 'yay-reviews')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={loadingStates.send[email.id] || loadingStates.dismiss[email.id]}
                        onClick={(e) => {
                          e.preventDefault();
                          handleDismissEmail(email.id);
                        }}
                      >
                        {loadingStates.dismiss[email.id] ? (
                          <Loader2Icon className="animate-spin" />
                        ) : (
                          <XIcon />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{__('Dismiss', 'yay-reviews')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
