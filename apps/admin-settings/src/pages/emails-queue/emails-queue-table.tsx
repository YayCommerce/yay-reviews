import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { EmailQueue } from 'types/email-queue';

import { dismissEmail, sendEmail } from '@/lib/ajax';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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

interface EmailsQueueTableProps {
  emails: EmailQueue[];
  pagination?: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export default function EmailsQueueTable({
  emails,
  pagination,
  currentPage,
  onPageChange,
  itemsPerPage,
}: EmailsQueueTableProps) {
  const queryClient = useQueryClient();

  const [loadingStates, setLoadingStates] = useState<{
    send: { [key: string]: boolean };
    dismiss: { [key: string]: boolean };
  }>({
    send: {},
    dismiss: {},
  });

  // Calculate pagination info
  const totalItems = pagination?.total_items || emails.length;
  const totalPages = pagination?.total_pages || Math.ceil(emails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + emails.length;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
          // Invalidate the query to refetch data
          queryClient.invalidateQueries({ queryKey: ['emails-queue'] });
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
          // Invalidate the query to refetch data
          queryClient.invalidateQueries({ queryKey: ['emails-queue'] });
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
    <div className="space-y-4">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground w-1/4 text-sm">
            {__('Showing', 'yay-reviews')} {startIndex + 1}-{endIndex} {__('of', 'yay-reviews')}{' '}
            {totalItems} {__('emails', 'yay-reviews')}
          </div>
          <Pagination className="yay-reviews-pagination-table w-3/4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination?.has_prev_page) {
                      onPageChange(currentPage - 1);
                    }
                  }}
                  className={
                    !pagination?.has_prev_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(page as number);
                      }}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination?.has_next_page) {
                      onPageChange(currentPage + 1);
                    }
                  }}
                  className={
                    !pagination?.has_next_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
