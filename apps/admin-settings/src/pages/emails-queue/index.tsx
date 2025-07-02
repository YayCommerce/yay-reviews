import { useEffect, useState } from 'react';
import PageLayout from '@/layouts/page-layout';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { toast } from 'sonner';
import { EmailQueue } from 'types/email-queue';

import { dismissEmail } from '@/lib/ajax';
import { getEmailsQueue } from '@/lib/queries';
import PageTitle from '@/components/page-title';

import EmailsQueueTable from './emails-queue-table';

export default function EmailsQueuePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [emails, setEmails] = useState<EmailQueue[]>([]);
  const itemsPerPage = 10;

  const { data, isFetching } = useQuery({
    queryKey: ['emails-queue', currentPage, itemsPerPage],
    queryFn: () => {
      return getEmailsQueue(currentPage, itemsPerPage);
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setEmails(data.emails);
    }
  }, [data]);

  const pagination = data?.pagination;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDismissEmail = (email: EmailQueue) => {
    toast.dismiss();
    dismissEmail(email.id).then((res) => {
      if (res.success) {
        const index = emails.findIndex((e) => e.id === email.id);
        const updatedEmails = [...emails];
        updatedEmails[index].status = '2';
        setEmails(updatedEmails);
        toast.success(res.data.mess);
      } else {
        toast.error(res.data.mess);
      }
    });
  };

  return (
    <PageLayout className="w-[90%]">
      <PageTitle title={__('Emails Queue', 'yay-reviews')} />
      <div className="container mx-auto space-y-8 px-7 py-0">
        <EmailsQueueTable
          isFetching={isFetching}
          emails={emails}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          onDismissEmail={handleDismissEmail}
        />
      </div>
    </PageLayout>
  );
}
