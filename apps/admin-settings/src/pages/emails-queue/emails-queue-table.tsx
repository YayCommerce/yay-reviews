import { useCallback, useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { CircleCheckBig, Clock, Loader2Icon, MailX } from 'lucide-react';
import { toast } from 'sonner';
import { EmailQueue } from 'types/email-queue';

import { dismissEmail, getCurrentQueue, sendEmail } from '@/lib/ajax';
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
  emailData: EmailQueue[];
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
  emailData,
  pagination,
  currentPage,
  onPageChange,
  itemsPerPage,
  isFetching,
}: EmailsQueueTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<EmailQueue | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emails, setEmails] = useState<EmailQueue[]>([]);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isDismissDialogOpen, setIsDismissDialogOpen] = useState(false);

  // Helper function to calculate delivery time display
  const getDeliveryTimeDisplay = useCallback((email: EmailQueue) => {
    if (email.status === '0' && email.scheduled_event?.timestamp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const deliveryTime = email.scheduled_event.timestamp;

      if (currentTime > deliveryTime) {
        // Time has passed, should be marked as sent
        return '';
      } else {
        // Calculate time difference
        const timeDiff = deliveryTime - currentTime;
        const days = Math.floor(timeDiff / (24 * 60 * 60));
        const hours = Math.floor((timeDiff % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((timeDiff % (60 * 60)) / 60);

        if (days > 0) {
          return `Send in ${days} day${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
          return `Send in ${hours} hour${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
          return `Send in ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
          return 'Send in few seconds';
        }
      }
    } else if (email.status === '1') {
      return email.created_at;
    }
    return '';
  }, []);

  useEffect(() => {
    if (emailData) {
      // Process emails to check if any pending emails should be marked as sent
      const processEmails = async () => {
        const processedEmails = await Promise.all(
          emailData.map(async (email) => {
            if (email.status === '0' && email.scheduled_event?.timestamp) {
              const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
              const deliveryTime = email.scheduled_event.timestamp;

              // If current time > delivery time, mark as sent
              if (currentTime > deliveryTime) {
                try {
                  const res = await getCurrentQueue(email.id);
                  if (res.success) {
                    return {
                      ...email,
                      status: res.data.status || '1',
                      delivery_time: res.data.delivery_time || '',
                    };
                  } else {
                    return {
                      ...email,
                      status: '2',
                      delivery_time: '',
                    };
                  }
                } catch (error) {
                  console.error('Error fetching delivery time:', error);
                  return {
                    ...email,
                    status: '2',
                    delivery_time: '',
                  };
                }
              } else {
                // Update delivery time display
                return {
                  ...email,
                  delivery_time: getDeliveryTimeDisplay(email),
                };
              }
            }
            return email;
          }),
        );

        setEmails(processedEmails as EmailQueue[]);
      };

      processEmails();
    }
  }, [emailData, getDeliveryTimeDisplay]);

  // Real-time status update timer
  useEffect(() => {
    // Only run timer if there are pending emails
    const hasPendingEmails = emails.some(
      (email) => email.status === '0' && email.scheduled_event?.timestamp,
    );

    if (!hasPendingEmails) {
      return;
    }

    const interval = setInterval(async () => {
      const emailsToUpdate = emails.filter(
        (email) => email.status === '0' && email.scheduled_event?.timestamp,
      );

      for (const email of emailsToUpdate) {
        const currentTime = Math.floor(Date.now() / 1000);
        const deliveryTime = email.scheduled_event?.timestamp;

        if (deliveryTime && currentTime > deliveryTime) {
          try {
            const res = await getCurrentQueue(email.id);
            setEmails((currentEmails) => {
              const updatedEmails = currentEmails.map((e) => {
                if (e.id === email.id) {
                  return {
                    ...e,
                    status: res.success ? res.data.status || '1' : '1',
                    delivery_time: res.success ? res.data.delivery_time || '' : '',
                  };
                }
                return e;
              });
              return updatedEmails as EmailQueue[];
            });
          } catch (error) {
            console.error('Error updating email status:', error);
            setEmails((currentEmails) => {
              const updatedEmails = currentEmails.map((e) => {
                if (e.id === email.id) {
                  return {
                    ...e,
                    status: '2',
                    delivery_time: '',
                  };
                }
                return e;
              });
              return updatedEmails as EmailQueue[];
            });
          }
        } else {
          // Update delivery time display for emails that are still pending
          setEmails((currentEmails) => {
            const updatedEmails = currentEmails.map((e) => {
              if (e.id === email.id) {
                return {
                  ...e,
                  delivery_time: getDeliveryTimeDisplay(e),
                };
              }
              return e;
            });
            return updatedEmails as EmailQueue[];
          });
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [getDeliveryTimeDisplay, emails]);

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
            const index = emails.findIndex((e) => e.id === email.id);
            const updatedEmails = [...emails];
            updatedEmails[index].status = '1';
            updatedEmails[index].delivery_time = '';
            setEmails(updatedEmails);
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
          const index = emails.findIndex((e) => e.id === email.id);
          const updatedEmails = [...emails];
          updatedEmails[index].status = '2';
          updatedEmails[index].delivery_time = '';
          setEmails(updatedEmails);
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
                <TableCaption>{__('No email queue found.', 'yay-reviews')}</TableCaption>
              )}
              <TableHeader>
                <TableRow>
                  <TableHead>{__('Email type', 'yay-reviews')}</TableHead>
                  <TableHead>{__('Status', 'yay-reviews')}</TableHead>
                  <TableHead>{__('Customer email', 'yay-reviews')}</TableHead>
                  <TableHead>{__('Delivery time', 'yay-reviews')}</TableHead>
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
                      emails.map((email) => (
                        <TableRow key={email.id}>
                          <TableCell className="capitalize">{email.type}</TableCell>
                          <TableCell>
                            {email.status === '0' ? (
                              <Clock className="h-4 w-4 text-[#1668dc]" />
                            ) : email.status === '1' ? (
                              <CircleCheckBig className="h-4 w-4 text-[#49aa19]" />
                            ) : (
                              <MailX className="h-4 w-4 text-[#404040]" />
                            )}
                          </TableCell>
                          <TableCell>{email.customer_email}</TableCell>
                          <TableCell>{email.delivery_time}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <DrawerTrigger asChild>
                                <TooltipProvider>
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
                                    <TooltipContent>{__('View', 'yay-reviews')}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </DrawerTrigger>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleSendEmail(email);
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
                                      ? __('Send', 'yay-reviews')
                                      : __('Re-send', 'yay-reviews')}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {email.status === '0' && (
                                <DialogTrigger asChild>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
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
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {__('Dismiss', 'yay-reviews')}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </DialogTrigger>
                              )}
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
                              handleDismissEmail(currentEmail);
                            }
                          }}
                        >
                          {isDismissing ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : (
                            __('Dismiss', 'yay-reviews')
                          )}
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
                        disabled={currentEmail?.status !== '0'}
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
                        {sendingEmailId === currentEmail?.id ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : currentEmail?.status === '1' ? (
                          __('Re-send', 'yay-reviews')
                        ) : (
                          __('Send', 'yay-reviews')
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
