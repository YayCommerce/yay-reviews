import { useMemo, useState } from 'react';
import { Loader2Icon, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

import { sendTestMail } from '@/lib/queries';
import { __, cn, getEmailSampleValues } from '@/lib/utils';

import RichTextEditor from './editor/RichTextEditor';
import DesktopIcon from './icons/Desktop';
import MobileIcon from './icons/Mobile';
import PreviewTemplate from './PreviewTemplate';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
      return { ...defaultSampleValues, '{products_table}': '{products_table}' };
    }
    if (templateId === 'reminder') {
      return {
        ...defaultSampleValues,
        '{coupon_code}': '{coupon_code}',
        '{product_name}': '{product_name}',
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
                  {__('email_subject')}
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
                  {__('email_heading')}
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
                    {__('email_content')}
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
                <span>{__('customer_name_vars')}</span>
                <span>{__('site_title_vars')}</span>
                {templateId === 'reminder' && <span>{__('products_table_vars')}</span>}
                {templateId === 'reward' && <span>{__('coupon_code_vars')}</span>}
                {templateId === 'reward' && <span>{__('product_name_vars')}</span>}
              </div>
            </div>

            {/* Email footer */}
            <div className="flex flex-col gap-2">
              <span className="w-max">
                <Label htmlFor={`email.${templateId}.footer`} className="font-normal">
                  {__('email_footer')}
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
                    {__('reset_template')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{__('reset_template')}</DialogTitle>
                  </DialogHeader>
                  <div>{__('reset_template_description')}</div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      className=""
                      onClick={(e) => {
                        e.preventDefault();
                        setResetTemplateDialogOpen(false);
                      }}
                    >
                      {__('cancel')}
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
                      {__('reset_template')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="col-span-12 flex flex-col gap-4 rounded-md border p-4 lg:col-span-7">
            <div className="flex items-center justify-between gap-2">
              <span>{__('preview')}</span>
              <div className="flex gap-2">
                <div className="flex gap-1">
                  <Button
                    variant={device === 'desktop' ? 'default' : 'ghost'}
                    className="size-9 has-[>svg]:py-0"
                    onClick={(e) => {
                      e.preventDefault();
                      setDevice('desktop');
                    }}
                  >
                    <DesktopIcon className="size-5" />
                  </Button>
                  <Button
                    variant={device === 'mobile' ? 'default' : 'ghost'}
                    className="size-9 has-[>svg]:px-1 has-[>svg]:py-0"
                    onClick={(e) => {
                      e.preventDefault();
                      setDevice('mobile');
                    }}
                  >
                    <MobileIcon className="size-5" />
                  </Button>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="">
                      {__('send_test_mail')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{__('send_test_mail_title')}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                      <span>{__('send_test_mail_description')}</span>
                      <div className="flex flex-col gap-2">
                        <span className="uppercase">{__('send_to')}</span>
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
                        {__('cancel')}
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
                                toast.success(__('email_sent_successfully'));
                              } else {
                                toast.error(__('email_sending_failed'));
                              }
                            })
                            .catch((err: any) => {
                              console.log(err);
                              toast.error(__('email_sending_failed'));
                            })
                            .finally(() => {
                              setIsSending(false);
                            });
                        }}
                      >
                        {__('send_test_mail')}
                        {isSending && <Loader2Icon className="animate-spin" />}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <Card className={cn(device === 'mobile' && 'yay-reviews-email-preview-mobile')}>
              <CardHeader className="border-border border-b">
                <CardTitle className="text-foreground flex flex-col gap-2">
                  <div className="text-base">{subject}</div>
                  <div className="flex items-center gap-2 text-sm font-normal">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {window.yayReviews.site_title}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-1">
                <PreviewTemplate heading={heading} content={content} footer={footer} />
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
