import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { EmailQueue } from 'types/email-queue';

import { sendEmail } from '@/lib/ajax';
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
  DrawerFooter,
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
  const [isSending, setIsSending] = useState(false);

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

  const handleSendEmail = (email: EmailQueue) => {
    setIsSending(true);
    // delete all toast
    toast.dismiss();
    sendEmail(email.id)
      .then((res) => {
        if (res.success) {
          toast.success(res.data.mess);
        } else {
          toast.error(res.data.mess);
        }
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="w-full overflow-x-auto">
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
                <Drawer
                  open={isModalOpen}
                  onOpenChange={(open) => {
                    setIsModalOpen(open);
                  }}
                  direction="right"
                >
                  <Dialog
                    open={isDismissDialogOpen}
                    onOpenChange={(open) => {
                      setIsDismissDialogOpen(open);
                    }}
                  >
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
                              <DrawerTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentEmail(email);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <EyeIcon />
                                </Button>
                              </DrawerTrigger>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentEmail(email);
                                    setIsDismissDialogOpen(true);
                                  }}
                                >
                                  <XIcon />
                                </Button>
                              </DialogTrigger>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    <DialogContent
                      className="max-w-md data-[vaul-drawer-direction=right]:sm:max-w-md"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle>{__('Dismiss email', 'yay-reviews')}</DialogTitle>
                      </DialogHeader>
                      <div>{__('Are you sure you want to dismiss this email?', 'yay-reviews')}</div>
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
                  <DrawerContent className="yay-reviews-view-email-drawer mt-[32px]">
                    <DrawerHeader className="border-b text-left">
                      <DrawerTitle className="m-0">{__('Information', 'yay-reviews')}</DrawerTitle>
                      <DrawerDescription className="hidden"></DrawerDescription>
                    </DrawerHeader>
                    <EmailInformation email={currentEmail} />
                    <DrawerFooter
                      className="flex flex-row gap-2"
                      style={{
                        boxShadow: '0 0 #0000, 0 0 #0000, 0 -1px 0 #edf3f9, 0 -5px 12px #00000008',
                      }}
                    >
                      <Button
                        variant="outline"
                        className="w-1/2"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsDismissDialogOpen(true);
                        }}
                      >
                        {__('Dismiss', 'yay-reviews')}
                      </Button>
                      <Button
                        className="w-1/2"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentEmail) {
                            handleSendEmail(currentEmail);
                          }
                        }}
                      >
                        {isSending ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : currentEmail?.type === 'reminder' && currentEmail?.status === '0' ? (
                          __('Send', 'yay-reviews')
                        ) : (
                          __('Re-send', 'yay-reviews')
                        )}
                      </Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </TableBody>
            </Table>
          </div>

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
