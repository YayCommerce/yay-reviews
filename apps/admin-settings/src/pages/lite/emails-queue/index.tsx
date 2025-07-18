import { useState } from 'react';
import PageLayout from '@/layouts/page-layout';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

import { getEmailsQueue } from '@/lib/queries';
import PageTitle from '@/components/page-title';

import EmailsQueueTable from './emails-queue-table';

export default function EmailsQueuePage() {
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const { data, isFetching } = useQuery({
    queryKey: ['emails-queue', currentPage, itemsPerPage],
    queryFn: () => {
      return getEmailsQueue(currentPage, itemsPerPage);
    },
  });

  const pagination = data?.pagination;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <PageLayout className="w-[90%]">
      <PageTitle title={__('Emails Queue', 'yay-reviews')} />
      <div className="container mx-auto space-y-8 px-7 py-0">
        <EmailsQueueTable
          isFetching={isFetching}
          emails={data?.emails || []}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </PageLayout>
  );
}
