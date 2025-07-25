import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { CircleCheckBig, Clock, Loader2Icon, MailX } from 'lucide-react';
import { toast } from 'sonner';
import { EmailQueue } from 'types/email-queue';

import { __IS_PRO__ } from '@/config/version';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import EyeIcon from '@/components/icons/EyeIcon';
import SendIcon from '@/components/icons/SendIcon';
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
}

export default function EmailsQueueTable({
  emails,
  pagination,
  currentPage,
  onPageChange,
  itemsPerPage,
  isFetching,
}: EmailsQueueTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<EmailQueue | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isDismissDialogOpen, setIsDismissDialogOpen] = useState(false);

  const queryClient = useQueryClient();

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
    setSendingEmailId(email.id);
    // delete all toast
    toast.dismiss();
    sendEmail(email.id)
      .then((res) => {
        if (res.success) {
          if (email.status === '0') {
            queryClient.setQueryData(['emails-queue', currentPage, itemsPerPage], (old: any) => {
              return {
                ...old,
                emails: old.emails.map((e: EmailQueue) =>
                  e.id === email.id
                    ? {
                        ...e,
                        status: '1',
                        delivery_time: res.data?.delivery_time ?? e.delivery_time,
                      }
                    : e,
                ),
              };
            });
          }
          toast.success(res.data.mess);
        } else {
          toast.error(res.data.mess);
        }
      })
      .finally(() => {
        setSendingEmailId(null);
      });
  };

  const handleDismissEmail = (email: EmailQueue) => {
    setIsDismissing(true);
    toast.dismiss();
    dismissEmail(email.id)
      .then((res) => {
        if (res.success) {
          queryClient.setQueryData(['emails-queue', currentPage, itemsPerPage], (old: any) => {
            return {
              ...old,
              emails: old.emails.map((e: EmailQueue) =>
                e.id === email.id ? { ...e, status: '2', delivery_time: '' } : e,
              ),
            };
          });
          toast.success(res.data.mess);
        } else {
          toast.error(res.data.mess);
        }
      })
      .finally(() => {
        setIsDismissing(false);
        setIsDismissDialogOpen(false);
      });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              {!isFetching && emails.length === 0 && (
                <TableCaption>{__('No email queue found.', 'yay-customer-reviews-woocommerce')}</TableCaption>
              )}
              <TableHeader>
                <TableRow>
                  <TableHead>{__('Email type', 'yay-customer-reviews-woocommerce')}</TableHead>
                  <TableHead>{__('Status', 'yay-customer-reviews-woocommerce')}</TableHead>
                  <TableHead>{__('Customer email', 'yay-customer-reviews-woocommerce')}</TableHead>
                  <TableHead>{__('Delivery time', 'yay-customer-reviews-woocommerce')}</TableHead>
                  <TableHead></TableHead>
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
                      emails.map((email) => {
                        let status = __('Cancelled', 'yay-customer-reviews-woocommerce');
                        if (email.status === '0') {
                          status = __('Pending', 'yay-customer-reviews-woocommerce');
                        } else if (email.status === '1') {
                          status = __('Sent', 'yay-customer-reviews-woocommerce');
                        }
                        return (
                          <TableRow key={email.id}>
                            <TableCell className="capitalize">{email.type}</TableCell>
                            <TableCell>
                              <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                  <TooltipTrigger asChild className="ml-3">
                                    {email.status === '0' ? (
                                      <Clock className="h-4 w-4 text-[#1668dc]" />
                                    ) : email.status === '1' ? (
                                      <CircleCheckBig className="h-4 w-4 text-[#49aa19]" />
                                    ) : (
                                      <MailX className="h-4 w-4 text-[#404040]" />
                                    )}
                                  </TooltipTrigger>
                                  <TooltipContent>{status}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>{email.customer_email}</TableCell>
                            <TableCell>{email.delivery_time}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <DrawerTrigger asChild>
                                  <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                      <TooltipTrigger>
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
                                      </TooltipTrigger>
                                      <TooltipContent>{__('View', 'yay-customer-reviews-woocommerce')}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </DrawerTrigger>
                                <TooltipProvider delayDuration={100}>
                                  <Tooltip>
                                    <TooltipTrigger onClick={(e) => e.preventDefault()}>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={!__IS_PRO__}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (__IS_PRO__) {
                                            handleSendEmail(email);
                                          }
                                        }}
                                      >
                                        {sendingEmailId === email.id ? (
                                          <Loader2Icon className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <SendIcon />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {email.status === '0'
                                        ? __('Send', 'yay-customer-reviews-woocommerce')
                                        : __('Re-send', 'yay-customer-reviews-woocommerce')}
                                      {__IS_PRO__ ? '' : ` (${__('Pro', 'yay-customer-reviews-woocommerce')})`}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                {email.status === '0' && (
                                  <DialogTrigger asChild>
                                    <TooltipProvider delayDuration={100}>
                                      <Tooltip>
                                        <TooltipTrigger onClick={(e) => e.preventDefault()}>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            disabled={!__IS_PRO__}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              if (__IS_PRO__) {
                                                setCurrentEmail(email);
                                                setIsDismissDialogOpen(true);
                                              }
                                            }}
                                          >
                                            <XIcon />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {__('Dismiss', 'yay-customer-reviews-woocommerce')}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </DialogTrigger>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                    <DialogContent
                      className="max-w-md data-[vaul-drawer-direction=right]:sm:max-w-md"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle>{__('Dismiss email', 'yay-customer-reviews-woocommerce')}</DialogTitle>
                      </DialogHeader>
                      <div>{__('Are you sure you want to dismiss this email?', 'yay-customer-reviews-woocommerce')}</div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          className=""
                          onClick={(e) => {
                            e.preventDefault();
                            setIsDismissDialogOpen(false);
                          }}
                        >
                          {__('Cancel', 'yay-customer-reviews-woocommerce')}
                        </Button>
                        <Button
                          variant="default"
                          className=""
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentEmail) {
                              handleDismissEmail(currentEmail);
                            }
                          }}
                        >
                          {isDismissing ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : (
                            __('Dismiss', 'yay-customer-reviews-woocommerce')
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <DrawerContent className="yayrev-view-email-drawer mt-[32px]">
                    <DrawerHeader className="border-b text-left">
                      <DrawerTitle className="m-0">{__('Information', 'yay-customer-reviews-woocommerce')}</DrawerTitle>
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
                        disabled={currentEmail?.status !== '0' || !__IS_PRO__}
                        onClick={(e) => {
                          e.preventDefault();
                          if (__IS_PRO__) {
                            setIsDismissDialogOpen(true);
                          }
                        }}
                      >
                        {__('Dismiss', 'yay-customer-reviews-woocommerce')}
                      </Button>
                      <Button
                        className="w-1/2"
                        disabled={!__IS_PRO__}
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentEmail && __IS_PRO__) {
                            handleSendEmail(currentEmail);
                          }
                        }}
                      >
                        {sendingEmailId === currentEmail?.id ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : currentEmail?.status === '1' ? (
                          __('Re-send', 'yay-customer-reviews-woocommerce')
                        ) : (
                          __('Send', 'yay-customer-reviews-woocommerce')
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
                {__('Showing', 'yay-customer-reviews-woocommerce')} {startIndex + 1}-{endIndex} {__('of', 'yay-customer-reviews-woocommerce')}{' '}
                {totalItems} {__('emails', 'yay-customer-reviews-woocommerce')}
              </div>
              <Pagination className="yayrev-pagination-table w-3/4">
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
