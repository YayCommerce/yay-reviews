import { useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Loader2Icon, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

import { sendTestMail } from '@/lib/queries';
import { cn, getSampleEmailPlaceholders, updateEmailPreview } from '@/lib/utils';
import useEmailsContext from '@/hooks/use-emails-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormField, useFormContext } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import RichTextEditor from '@/components/editor/rich-text-editor';
import DesktopIcon from '@/components/icons/Desktop';
import MobileIcon from '@/components/icons/Mobile';
import UserIcon from '@/components/icons/UserIcon';

import EmailPreviewer from './email-previewer';

export default function TemplateCard({ templateId }: { templateId: string }) {
  const { currentDevice, setCurrentDevice } = useEmailsContext();
  const [testEmail, setTestEmail] = useState(window.yayReviews.admin_email || '');
  const [isSending, setIsSending] = useState(false);
  const [resetTemplateDialogOpen, setResetTemplateDialogOpen] = useState(false);

  const { watch, control, setValue, getValues } = useFormContext();
  const emailSubject = watch(`email.${templateId}.subject`);
  const emailHeading = watch(`email.${templateId}.heading`);
  const emailContent = watch(`email.${templateId}.content`);

  const samplePlaceholders = useMemo(() => {
    return getSampleEmailPlaceholders(templateId as 'reminder' | 'reward');
  }, [templateId]);

  const defaultEmailSettings = window.yayReviews.wc_email_settings[templateId].default;

  const content = (emailContent || defaultEmailSettings.content)
    .replace(/\{customer_name\}/g, samplePlaceholders['{customer_name}'] ?? '')
    .replace(/\{site_title\}/g, samplePlaceholders['{site_title}'] ?? '')
    .replace(/\{review_products\}/g, samplePlaceholders['{review_products}'] ?? '')
    .replace(/\{coupon_code\}/g, samplePlaceholders['{coupon_code}'] ?? '')
    .replace(/\{product_name\}/g, samplePlaceholders['{product_name}'] ?? '');
    
  const subject = (emailSubject || defaultEmailSettings.subject).replace(
    /\{site_title\}/g,
    samplePlaceholders['{site_title}'] ?? '',
  );
  const heading = (emailHeading || defaultEmailSettings.heading).replace(
    /\{site_title\}/g,
    samplePlaceholders['{site_title}'] ?? '',
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleResetTemplate = () => {
    const resetKeys = ['subject', 'heading', 'content'];
    resetKeys.forEach((key) => {
      const defaultValue = window.yayReviews?.wc_email_settings?.[templateId]?.[key]?.default;
      if (!defaultValue) {
        return;
      }
      const currentValues = getValues(`email.${templateId}.${key}`);
      if (key === 'content') {
        const editor = window.tinymce?.get(`yay-reviews-email-content-${templateId}`);
        if (editor) {
          editor.setContent(defaultValue);
        }
      }

      setValue(`email.${templateId}.${key}`, defaultValue, {
        shouldDirty: currentValues != defaultValue ? true : false,
      });
      if (key !== 'subject') {
        updateEmailPreview(defaultValue, key as 'heading' | 'content', templateId);
      }
    });
  };

  return (
    <Card>
      <CardContent className="w-full">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
            {/* Email subject */}
            <div>
              <Label htmlFor={`email.${templateId}.subject`} className="mb-2 w-max font-normal">
                {__('Email subject', 'yay-reviews')}
              </Label>
              <FormField
                control={control}
                name={`email.${templateId}.subject`}
                render={({ field: { onChange } }) => (
                  <Input
                    id={`email.${templateId}.subject`}
                    value={emailSubject || defaultEmailSettings.subject}
                    onChange={onChange}
                  />
                )}
              />
            </div>
            {/* Email heading */}
            <div>
              <Label htmlFor={`email.${templateId}.heading`} className="mb-2 w-max font-normal">
                {__('Email heading', 'yay-reviews')}
              </Label>
              <FormField
                control={control}
                name={`email.${templateId}.heading`}
                render={({ field: { onChange } }) => (
                  <Input
                    id={`email.${templateId}.heading`}
                    value={emailHeading || defaultEmailSettings.heading}
                    onChange={(e) => {
                      e.preventDefault();
                      updateEmailPreview(e.target.value, 'heading', templateId);
                      onChange(e);
                    }}
                  />
                )}
              />
            </div>

            {/* Email content */}
            <div>
              <Label htmlFor={`email.${templateId}.content`} className="mb-2 w-max font-normal">
                {__('Email content', 'yay-reviews')}
              </Label>
              <div>
                <FormField
                  control={control}
                  name={`email.${templateId}.content`}
                  render={({ field: { onChange } }) => (
                    <RichTextEditor
                      ID={`yay-reviews-email-content-${templateId}`}
                      value={emailContent || defaultEmailSettings.content}
                      handleOnChange={onChange}
                    />
                  )}
                />
              </div>
              <div className="text-muted-foreground mt-2 flex flex-col text-sm">
                <span>{__("{customer_name} - Customer's name", 'yay-reviews')}</span>
                <span>{__('{site_title} - Your site title', 'yay-reviews')}</span>
                {templateId === 'reminder' && (
                  <span>{__('{review_products} - List products need review', 'yay-reviews')}</span>
                )}
                {templateId === 'reward' && (
                  <span>{__('{coupon_code} - Coupon code', 'yay-reviews')}</span>
                )}
                {templateId === 'reward' && (
                  <span>{__('{product_name} - Product name', 'yay-reviews')}</span>
                )}
              </div>
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
                  <div className="flex items-center gap-[3px] rounded-sm border border-solid border-[#e5e7eb] bg-white p-[3px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant={currentDevice === 'desktop' ? 'default' : 'ghost'}
                            className="yay-reviews-email-preview-device-button h-[28px] w-[26px] py-0 has-[>svg]:px-4"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentDevice('desktop');
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
                            variant={currentDevice === 'mobile' ? 'default' : 'ghost'}
                            className="yay-reviews-email-preview-device-button h-[26px] w-[26px] has-[>svg]:px-4 has-[>svg]:py-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentDevice('mobile');
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
                          <Input
                            value={testEmail}
                            placeholder={__('Enter your email address', 'yay-reviews')}
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
                            const jQuery = window.jQuery;
                            const previewEmail = jQuery('#yay-reviews-email-preview-iframe');
                            if (!previewEmail) return;
                            // get all html of iframe
                            const iframeHtml = previewEmail.contents().find('html').html();
                            // get language of iframe
                            const iframeLanguage = previewEmail
                              .contents()
                              .find('html')
                              .attr('lang');
                            const previewContent =
                              '<!DOCTYPE html><html lang="' +
                              iframeLanguage +
                              '">' +
                              iframeHtml +
                              '</html>';
                            sendTestMail(testEmail, subject, previewContent)
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
                  currentDevice === 'mobile' && 'yay-reviews-email-preview-mobile',
                  'm-auto w-full gap-0 rounded-sm border border-solid border-[#e0e0e0] p-0 shadow-none',
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
                <CardContent className="p-0">
                  <EmailPreviewer heading={heading} content={content} templateId={templateId} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
