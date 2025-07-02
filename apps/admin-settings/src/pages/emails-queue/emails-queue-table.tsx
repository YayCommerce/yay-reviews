import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { toast } from 'sonner';
import { EmailQueue } from 'types/email-queue';

import { dismissEmail, sendEmail } from '@/lib/ajax';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import Loading from '@/components/ui/loading';
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import EyeIcon from '@/components/icons/EyeIcon';
import XIcon from '@/components/icons/XIcon';

import EmailInformation from './email-information';

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
  isFetching: boolean;
  onDismissEmail: (email: EmailQueue) => void;
}

export default function EmailsQueueTable({
  emails,
  pagination,
  currentPage,
  onPageChange,
  itemsPerPage,
  isFetching,
  onDismissEmail,
}: EmailsQueueTableProps) {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissDialogOpen, setIsDismissDialogOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<EmailQueue | null>(null);

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

    sendEmail(emailId).then((res) => {
      if (res.success) {
        toast.success(res.data.mess);
        // Invalidate the query to refetch data
        queryClient.invalidateQueries({ queryKey: ['emails-queue'] });
      } else {
        toast.error(res.data.mess);
      }
    });
  };

  const handleViewEmail = (emailId: string) => {
    // Open a modal with the email content
    const email = emails.find((email) => email.id === emailId);
    if (email) {
      setCurrentEmail(email);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <Table>
            {!isFetching && emails.length === 0 && (
              <TableCaption>{__('No email found.', 'yay-reviews')}</TableCaption>
            )}
            <TableHeader>
              <TableRow>
                <TableHead>{__('ID', 'yay-reviews')}</TableHead>
                <TableHead>{__('Email type', 'yay-reviews')}</TableHead>
                <TableHead>{__('Status', 'yay-reviews')}</TableHead>
                <TableHead>{__('Customer email', 'yay-reviews')}</TableHead>
                <TableHead>{__('Delivery time', 'yay-reviews')}</TableHead>
                <TableHead>{__('Actions', 'yay-reviews')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Loading size="lg" />
                  </TableCell>
                </TableRow>
              ) : (
                emails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell>{email.id}</TableCell>
                    <TableCell className="capitalize">{email.type}</TableCell>
                    <TableCell>
                      {email.status === '0'
                        ? __('Pending', 'yay-reviews')
                        : email.status === '1'
                          ? __('Sent', 'yay-reviews')
                          : __('Cancelled', 'yay-reviews')}
                    </TableCell>
                    <TableCell>{email.customer_email}</TableCell>
                    <TableCell>{email.delivery_time}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Drawer open={isModalOpen} onOpenChange={setIsModalOpen} direction="right">
                          <DrawerTrigger asChild>
                            <Button variant="outline" size="icon">
                              <EyeIcon />
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent className="yay-reviews-coupon-form mt-[32px]">
                            <DrawerHeader className="border-b text-left">
                              <DrawerTitle className="m-0">
                                {__('Create new coupon', 'yay-reviews')}
                              </DrawerTitle>
                              <DrawerDescription className="hidden"></DrawerDescription>
                            </DrawerHeader>
                          </DrawerContent>
                        </Drawer>

                        <Dialog
                          open={isDismissDialogOpen}
                          onOpenChange={(open) => {
                            setCurrentEmail(email);
                            setIsDismissDialogOpen(open);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <XIcon />
                            </Button>
                          </DialogTrigger>
                          <DialogContent
                            className="max-w-md"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <DialogHeader>
                              <DialogTitle>{__('Dismiss email', 'yay-reviews')}</DialogTitle>
                            </DialogHeader>
                            <div>
                              {__('Are you sure you want to dismiss this email?', 'yay-reviews')}
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                className=""
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsDismissDialogOpen(false);
                                }}
                              >
                                {__('Cancel', 'yay-reviews')}
                              </Button>
                              <Button
                                variant="default"
                                className=""
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentEmail) {
                                    onDismissEmail(currentEmail);
                                  }
                                  setIsDismissDialogOpen(false);
                                }}
                              >
                                {__('Dismiss', 'yay-reviews')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!isFetching && emails.length > 0 && totalPages > 1 && (
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
                        !pagination?.has_prev_page
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
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
                        !pagination?.has_next_page
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
