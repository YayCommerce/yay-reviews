import { __ } from '@/lib/utils';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export default function EmailsTab() {
  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="text-foreground text-3xl font-bold">{__('emails_settings')}</div>
      <div className="flex flex-col gap-4">
        {/* Email template */}
        <div className="flex flex-col gap-2">
          <div className="text-foreground text-lg font-semibold">{__('email_template')}</div>
          <Card>
            <CardContent className="w-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                  {/* Email heading */}
                  <div className="flex flex-col gap-2">
                    <span>{__('email_heading')}</span>
                    <Input />
                  </div>

                  {/* Email subject */}
                  <div className="flex flex-col gap-2">
                    <span>{__('email_subject')}</span>
                    <Input />
                  </div>

                  {/* Email content */}
                  <div className="flex flex-col gap-2">
                    <span>{__('email_content')}</span>
                    <Textarea rows={7} />
                    <div className="text-muted-foreground flex flex-col text-sm">
                      <span>{__('customer_name_vars')}</span>
                      <span>{__('site_title_vars')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 rounded-md border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span>{__('preview')}</span>
                    <Button variant="outline">
                      <span>{__('send_test_mail')}</span>
                    </Button>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>{'<Email Subject>'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center gap-2">
                        <span>{'<Email Heading>'}</span>
                        <span>
                          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                          Lorem Ipsum has been the industry's standard dummy text ever since the
                          1500s, when an unknown printer took a galley of type and scrambled it to
                          make a type specimen book. It has survived not only five centuries, but
                          also the leap into electronic typesetting, remaining essentially unchanged
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
