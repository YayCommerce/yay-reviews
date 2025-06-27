import PageLayout from '@/layouts/page-layout';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

import { getEmailsQueue } from '@/lib/queries';
import { Card, CardContent } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import EmailIcon from '@/components/icons/Email';
import PageTitle from '@/components/page-title';

import EmailsQueueTable from './emails-queue-table';

export default function EmailsQueuePage() {
  const { data: emails = [], isFetching } = useQuery({
    queryKey: ['emails-queue'],
    queryFn: () => getEmailsQueue(),
    staleTime: 5 * 60 * 1000,
  });
  return (
    <PageLayout>
      <PageTitle title={__('Emails Queue', 'yay-reviews')} />
      <div className="container mx-auto space-y-8 px-7 py-0">
        {isFetching ? (
          <div className="flex flex-col items-center gap-2 pb-4">
            <Loading size="lg" text={__('Loading emails queue...', 'yay-reviews')} />
          </div>
        ) : !isFetching && emails.length === 0 ? (
          <Card className="items-center gap-2 pt-6 pb-4 text-center">
            <CardContent className="p-0">
              <div className="flex flex-col items-center gap-2 pb-4">
                <EmailIcon strokeWidth={1} size={100} />
                <div className="px-6 text-lg font-semibold">
                  {__('No emails in queue', 'yay-reviews')}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmailsQueueTable emails={emails} />
        )}
      </div>
    </PageLayout>
  );
}
