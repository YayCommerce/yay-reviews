import { useMemo, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { sendTestMail } from '@/lib/queries';
import { __, cn, getEmailSampleValues } from '@/lib/utils';

import RichTextEditor from './editor/RichTextEditor';
import DesktopIcon from './icons/Desktop';
import MobileIcon from './icons/Mobile';
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

  const { watch, control } = useFormContext();
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

  return (
    <Card>
      <CardContent className="w-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            {/* Email subject */}
            <div className="flex flex-col gap-2">
              <span>{__('email_subject')}</span>
              <FormField
                control={control}
                name={`email.${templateId}.subject`}
                render={({ field: { value, onChange } }) => (
                  <Input value={value} onChange={onChange} />
                )}
              />
            </div>
            {/* Email heading */}
            <div className="flex flex-col gap-2">
              <span>{__('email_heading')}</span>
              <FormField
                control={control}
                name={`email.${templateId}.heading`}
                render={({ field: { value, onChange } }) => (
                  <Input value={value} onChange={onChange} />
                )}
              />
            </div>

            {/* Email content */}
            <div>
              <div className="flex flex-col gap-2">
                <span>{__('email_content')}</span>
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
              <span>{__('email_footer')}</span>
              <FormField
                control={control}
                name={`email.${templateId}.footer`}
                render={({ field: { value, onChange } }) => (
                  <Input value={value} onChange={onChange} />
                )}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-md border p-4">
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
              <CardContent>
                <table
                  border={0}
                  cellPadding={0}
                  cellSpacing={0}
                  id="inner_wrapper"
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                  }}
                  bgcolor={window.yayReviews.wc_email_settings.bg}
                >
                  <tbody>
                    <tr>
                      <td align="center" valign="top">
                        <table
                          border={0}
                          cellPadding={0}
                          cellSpacing={0}
                          width={100}
                          style={{ width: '100%' }}
                        >
                          <tbody>
                            <tr>
                              <td id="template_header_image" style={{ padding: '32px 32px 0' }}>
                                <p
                                  className="email-logo-text"
                                  style={{
                                    color: window.yayReviews.wc_email_settings.text,
                                    fontFamily:
                                      '"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
                                    fontSize: 18,
                                    marginBottom: 0,
                                    textAlign: 'left',
                                  }}
                                >
                                  {window.yayReviews.site_title}
                                </p>{' '}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          border={0}
                          cellPadding={0}
                          cellSpacing={0}
                          id="template_container"
                          style={{
                            width: '100%',
                            boxShadow: 'none',
                            backgroundColor: '#fff',
                            border: 0,
                            borderRadius: '3px',
                          }}
                          bgcolor={window.yayReviews.wc_email_settings.bg}
                        >
                          <tbody>
                            <tr>
                              <td align="center" valign="top">
                                <table
                                  border={0}
                                  cellPadding={0}
                                  cellSpacing={0}
                                  width={100}
                                  id="template_header"
                                  style={{
                                    width: '100%',
                                    backgroundColor: window.yayReviews.wc_email_settings.bg,
                                    color: window.yayReviews.wc_email_settings.text,
                                    borderBottom: 0,
                                    fontWeight: 'bold',
                                    lineHeight: '100%',
                                    verticalAlign: 'middle',
                                    fontFamily:
                                      '"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
                                    borderRadius: '3px 3px 0 0',
                                  }}
                                  bgcolor={window.yayReviews.wc_email_settings.bg}
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        id="header_wrapper"
                                        style={{ padding: '20px 32px 0', display: 'block' }}
                                      >
                                        <h1
                                          style={{
                                            fontFamily:
                                              '"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
                                            fontSize: 32,
                                            fontWeight: 700,
                                            letterSpacing: '-1px',
                                            lineHeight: '120%',
                                            margin: 0,
                                            color: window.yayReviews.wc_email_settings.text,
                                            backgroundColor: 'inherit',
                                            textAlign: 'left',
                                          }}
                                        >
                                          {heading}
                                        </h1>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" valign="top">
                                <table
                                  border={0}
                                  cellPadding={0}
                                  cellSpacing={0}
                                  style={{ width: '100%' }}
                                  id="template_body"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        valign="top"
                                        id="body_content"
                                        style={{
                                          backgroundColor: window.yayReviews.wc_email_settings.bg,
                                        }}
                                      >
                                        <table
                                          border={0}
                                          cellPadding={20}
                                          cellSpacing={0}
                                          style={{ width: '100%' }}
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                valign="top"
                                                id="body_content_inner_cell"
                                                style={{ padding: '20px 32px 32px' }}
                                              >
                                                <div
                                                  id="body_content_inner"
                                                  style={{
                                                    color: window.yayReviews.wc_email_settings.text,
                                                    fontFamily:
                                                      '"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
                                                    fontSize: '16px',
                                                    lineHeight: '150%',
                                                    textAlign: 'left',
                                                  }}
                                                >
                                                  <div className="email-content">
                                                    <p
                                                      style={{
                                                        margin: '0 0 16px',
                                                        textAlign: 'center',
                                                        fontSize: '16px',
                                                        color:
                                                          window.yayReviews.wc_email_settings.text,
                                                      }}
                                                      dangerouslySetInnerHTML={{
                                                        __html: content,
                                                      }}
                                                    />
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" valign="top">
                        <table
                          border={0}
                          cellPadding={10}
                          cellSpacing={0}
                          style={{ width: '100%' }}
                          id="template_footer"
                        >
                          <tbody>
                            <tr>
                              <td valign="top" style={{ padding: 0, borderRadius: 0 }}>
                                <table
                                  border={0}
                                  cellPadding={10}
                                  cellSpacing={0}
                                  width={100}
                                  style={{ width: '100%' }}
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        colSpan={2}
                                        valign="middle"
                                        id="credit"
                                        style={{
                                          borderRadius: 0,
                                          border: 0,
                                          borderTop: '1px solid rgba(0,0,0,.2)',
                                          fontFamily:
                                            '"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
                                          fontSize: 12,
                                          lineHeight: '140%',
                                          textAlign: 'center',
                                          padding: 32,
                                          color: window.yayReviews.wc_email_settings.footer_text,
                                        }}
                                        align="center"
                                      >
                                        <p
                                          style={{
                                            margin: 0,
                                            color: window.yayReviews.wc_email_settings.footer_text,
                                          }}
                                        >
                                          {footer}
                                        </p>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
