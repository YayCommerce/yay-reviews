import { useEffect, useState } from 'react';

import { previewEmail } from '@/lib/ajax';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';

const EmailPreviewer = ({ templateId }: { templateId: string }) => {
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    previewEmail(templateId)
      .then((res) => {
        if (res.success) {
          setHtml(res.data.content);
        } else {
          toast.error(res.data.message);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [templateId]);

  return (
    <div className="h-[600px] w-full">
      {isLoading ? (
        <div className="flex flex-col space-y-4 p-10">
          <Skeleton className="h-[50px] w-full" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[50px] w-full" />
        </div>
      ) : (
        <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
};

export default EmailPreviewer;
