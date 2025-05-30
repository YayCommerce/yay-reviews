import { __, getEmailSampleValues } from '@/lib/utils';

import DesktopIcon from './icons/Desktop';
import MobileIcon from './icons/Mobile';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FormField, useFormContext } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

export default function EmailTemplateCard({
  templateId,
  device,
  setDevice,
}: {
  templateId: string;
  device: 'desktop' | 'mobile';
  setDevice: (device: 'desktop' | 'mobile') => void;
}) {
  const { watch, control } = useFormContext();
  const emailSubject = watch(`email.${templateId}.subject`);
  const emailHeading = watch(`email.${templateId}.heading`);
  const emailContent = watch(`email.${templateId}.content`);
  const emailFooter = watch(`email.${templateId}.footer`);

  const sampleValues = getEmailSampleValues();

  const content = emailContent
    .replace(/\{customer_name\}/g, sampleValues['{customer_name}'])
    .replace(/\{site_title\}/g, sampleValues['{site_title}'])
    .replace(/\{product_table\}/g, sampleValues['{product_table}']);

  const subject = emailSubject.replace(/\{site_title\}/g, sampleValues['{site_title}']);
  const heading = emailHeading.replace(/\{site_title\}/g, sampleValues['{site_title}']);
  const footer = emailFooter.replace(/\{site_title\}/g, sampleValues['{site_title}']);

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
            <div className="flex flex-col gap-2">
              <span>{__('email_content')}</span>
              <FormField
                control={control}
                name={`email.${templateId}.content`}
                render={({ field: { value, onChange } }) => (
                  <Textarea rows={7} value={value} onChange={onChange} />
                )}
              />
              <div className="text-muted-foreground flex flex-col text-sm">
                <span>{__('customer_name_vars')}</span>
                <span>{__('site_title_vars')}</span>
                <span>{__('product_table_vars')}</span>
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
                <Button
                  variant={device === 'desktop' ? 'default' : 'ghost'}
                  onClick={(e) => {
                    e.preventDefault();
                    setDevice('desktop');
                  }}
                >
                  <DesktopIcon />
                </Button>
                <Button
                  variant={device === 'mobile' ? 'default' : 'ghost'}
                  onClick={(e) => {
                    e.preventDefault();
                    setDevice('mobile');
                  }}
                >
                  <MobileIcon />
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    setDevice('desktop');
                  }}
                >
                  <span>{__('send_test_mail')}</span>
                </Button>
              </div>
            </div>
            <Card>
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
                <div className="text-foreground flex flex-col items-center gap-5 text-center">
                  <div className="text-base font-semibold">{heading}</div>
                  <div className="text-sm" dangerouslySetInnerHTML={{ __html: content }} />
                  <div className="text-base font-semibold">{footer}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
