import { useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Loader2Icon, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

import { sendTestMail } from '@/lib/queries';
import { cn, getEmailSampleValues } from '@/lib/utils';

import RichTextEditor from './editor/RichTextEditor';
import DesktopIcon from './icons/Desktop';
import MobileIcon from './icons/Mobile';
import UserIcon from './icons/UserIcon';
import PreviewTemplate from './PreviewTemplate';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { FormField, useFormContext } from './ui/form';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export default function EmailTemplateCard({
  templateId,
  device,
  setDevice,
}: {
  templateId: string;
  device: 'desktop' | 'mobile';
  setDevice: (device: 'desktop' | 'mobile') => void;
}) {
  const [testEmail, setTestEmail] = useState(window.yayReviews.admin_email || '');
  const [isSending, setIsSending] = useState(false);
  const [resetTemplateDialogOpen, setResetTemplateDialogOpen] = useState(false);

  const { watch, control, setValue } = useFormContext();
  const emailSubject = watch(`email.${templateId}.subject`);
  const emailHeading = watch(`email.${templateId}.heading`);
  const emailContent = watch(`email.${templateId}.content`);
  const emailFooter = watch(`email.${templateId}.footer`);

  const defaultSampleValues = getEmailSampleValues();

  const sampleValues = useMemo(() => {
    if (templateId === 'reward') {
      return {
        ...defaultSampleValues,
        '{products_table}': '{products_table}',
        '{site_title}': window.yayReviews.site_title,
      };
    }
    if (templateId === 'reminder') {
      return {
        ...defaultSampleValues,
        '{coupon_code}': '{coupon_code}',
        '{product_name}': '{product_name}',
        '{site_title}': window.yayReviews.site_title,
      };
    }

    return defaultSampleValues;
  }, [templateId]);

  const content = emailContent
    .replace(/\{customer_name\}/g, sampleValues['{customer_name}'])
    .replace(/\{site_title\}/g, sampleValues['{site_title}'])
    .replace(/\{products_table\}/g, sampleValues['{products_table}'])
    .replace(/\{coupon_code\}/g, sampleValues['{coupon_code}'])
    .replace(/\{product_name\}/g, sampleValues['{product_name}']);

  const subject = emailSubject.replace(/\{site_title\}/g, sampleValues['{site_title}']);
  const heading = emailHeading.replace(/\{site_title\}/g, sampleValues['{site_title}']);
  const footer = emailFooter.replace(/\{site_title\}/g, sampleValues['{site_title}']);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleResetTemplate = () => {
    const resetKeys = ['subject', 'heading', 'content', 'footer'];
    resetKeys.forEach((key) => {
      if (!window.yayReviews?.default_email_templates?.[templateId]?.[key]) {
        return;
      }
      if (key === 'content') {
        const editor = window.tinymce?.get(`yay-reviews-email-content-${templateId}`);
        if (editor) {
          editor.setContent(window.yayReviews.default_email_templates[templateId].content);
        }
      }
      setValue(
        `email.${templateId}.${key}`,
        window.yayReviews.default_email_templates[templateId][key],
      );
    });
  };

  return (
    <Card>
      <CardContent className="w-full">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
            {/* Email subject */}
            <div className="flex flex-col gap-2">
              <span className="w-max">
                <Label htmlFor={`email.${templateId}.subject`} className="font-normal">
                  {__('Email subject', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`email.${templateId}.subject`}
                render={({ field: { value, onChange } }) => (
                  <Input id={`email.${templateId}.subject`} value={value} onChange={onChange} />
                )}
              />
            </div>
            {/* Email heading */}
            <div className="flex flex-col gap-2">
              <span className="w-max">
                <Label htmlFor={`email.${templateId}.heading`} className="font-normal">
                  {__('Email heading', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`email.${templateId}.heading`}
                render={({ field: { value, onChange } }) => (
                  <Input id={`email.${templateId}.heading`} value={value} onChange={onChange} />
                )}
              />
            </div>

            {/* Email content */}
            <div>
              <div className="flex flex-col gap-2">
                <span className="w-max">
                  <Label htmlFor={`email.${templateId}.content`} className="font-normal">
                    {__('Email content', 'yay-reviews')}
                  </Label>
                </span>
                <FormField
                  control={control}
                  name={`email.${templateId}.content`}
                  render={({ field: { value, onChange } }) => (
                    <RichTextEditor
                      ID={`yay-reviews-email-content-${templateId}`}
                      value={value}
                      handleOnChange={onChange}
                    />
                  )}
                />
              </div>
              <div className="text-muted-foreground mt-2 flex flex-col text-sm">
                <span>{__("{customer_name} - Customer's name", 'yay-reviews')}</span>
                <span>{__('{site_title} - Your site title', 'yay-reviews')}</span>
                {templateId === 'reminder' && (
                  <span>
                    {__('{products_table} - Table of products need review', 'yay-reviews')}
                  </span>
                )}
                {templateId === 'reward' && (
                  <span>{__('{coupon_code} - Coupon code', 'yay-reviews')}</span>
                )}
                {templateId === 'reward' && (
                  <span>{__('{product_name} - Product name', 'yay-reviews')}</span>
                )}
              </div>
            </div>

            {/* Email footer */}
            <div className="flex flex-col gap-2">
              <span className="w-max">
                <Label htmlFor={`email.${templateId}.footer`} className="font-normal">
                  {__('Email footer', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`email.${templateId}.footer`}
                render={({ field: { value, onChange } }) => (
                  <Input id={`email.${templateId}.footer`} value={value} onChange={onChange} />
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Dialog open={resetTemplateDialogOpen} onOpenChange={setResetTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-fit">
                    <RefreshCcw className="size-4" />
                    {__('Reset template', 'yay-reviews')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{__('Reset template', 'yay-reviews')}</DialogTitle>
                  </DialogHeader>
                  <div>{__('Reset the template to the default values.', 'yay-reviews')}</div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      className=""
                      onClick={(e) => {
                        e.preventDefault();
                        setResetTemplateDialogOpen(false);
                      }}
                    >
                      {__('Cancel', 'yay-reviews')}
                    </Button>
                    <Button
                      variant="default"
                      className=""
                      disabled={isSending}
                      onClick={(e) => {
                        e.preventDefault();
                        handleResetTemplate();
                        setResetTemplateDialogOpen(false);
                      }}
                    >
                      {__('Reset template', 'yay-reviews')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <h3 className="yay-reviews-email-preview-title">{__('Preview', 'yay-reviews')}</h3>
            <div className="flex flex-col gap-4 rounded-sm border border-solid border-[#e0e0e0] bg-[#f0f0f0] p-4">
              <div className="flex items-center justify-end gap-2">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 rounded-sm border border-solid border-[#e5e7eb] bg-white p-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant={device === 'desktop' ? 'default' : 'ghost'}
                            className="h-[26px] w-[26px] has-[>svg]:px-3 has-[>svg]:py-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setDevice('desktop');
                            }}
                          >
                            <DesktopIcon className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{__('Desktop preview', 'yay-reviews')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant={device === 'mobile' ? 'default' : 'ghost'}
                            className="h-[26px] w-[26px] has-[>svg]:px-3 has-[>svg]:py-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setDevice('mobile');
                            }}
                          >
                            <MobileIcon className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{__('Mobile preview', 'yay-reviews')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-fit">
                        {__('Send test mail', 'yay-reviews')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{__('Send a test email', 'yay-reviews')}</DialogTitle>
                      </DialogHeader>

                      <div className="flex flex-col gap-4">
                        <span>
                          {__(
                            'Send yourself a test email to check how your email looks in different email apps.',
                            'yay-reviews',
                          )}
                        </span>
                        <div className="flex flex-col gap-2">
                          <span className="uppercase">{__('Send to', 'yay-reviews')}</span>
                          <Input
                            value={testEmail}
                            onChange={(e) => {
                              e.preventDefault();
                              setTestEmail(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          className=""
                          onClick={(e) => {
                            e.preventDefault();
                            setIsDialogOpen(false);
                          }}
                        >
                          {__('Cancel', 'yay-reviews')}
                        </Button>
                        <Button
                          variant="default"
                          className=""
                          disabled={isSending}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsSending(true);
                            sendTestMail(testEmail, subject, heading, content, footer)
                              .then((res: any) => {
                                if (res.message === 'Email sent successfully') {
                                  toast.success(__('Email sent successfully', 'yay-reviews'));
                                } else {
                                  toast.error(__('Email sending failed', 'yay-reviews'));
                                }
                              })
                              .catch((err: any) => {
                                console.log(err);
                                toast.error(__('Email sending failed', 'yay-reviews'));
                              })
                              .finally(() => {
                                setIsSending(false);
                              });
                          }}
                        >
                          {__('Send test mail', 'yay-reviews')}
                          {isSending && <Loader2Icon className="animate-spin" />}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Card
                className={cn(
                  device === 'mobile' && 'yay-reviews-email-preview-mobile',
                  'm-auto rounded-sm border border-solid border-[#e0e0e0] p-0 shadow-none',
                )}
              >
                <CardHeader className="border-border block border-b p-4 [.border-b]:pb-4">
                  <CardTitle>
                    <h2 className="yay-reviews-email-preview-subject mt-0 text-base">{subject}</h2>
                    <div className="flex items-center gap-2 text-sm font-normal">
                      <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#cbbeff4d]">
                        <UserIcon />
                      </div>
                      <p className="flex flex-wrap items-center" style={{ margin: 0 }}>
                        <span className="mr-1 font-bold">{window.yayReviews.site_title}</span>
                        <span>{`<${testEmail}>`}</span>
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className={cn('px-8 py-2', device === 'mobile' && 'px-4 py-2')}>
                  <PreviewTemplate heading={heading} content={content} footer={footer} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
