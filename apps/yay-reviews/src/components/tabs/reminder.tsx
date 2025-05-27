import { __ } from '@/lib/utils';

import { Card, CardContent } from '../ui/card';
import { FormField, useFormContext } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

export default function ReminderTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { control } = useFormContext();

  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="text-foreground text-3xl font-bold">{__('reminder_settings')}</div>
      <div className="flex flex-col gap-6">
        {/* Send reminder when */}
        <div className="flex flex-col gap-2">
          <div className="text-foreground text-lg font-semibold">{__('send_reminder_when')}</div>
          <Card>
            <CardContent className="w-full">
              <div className="flex flex-col gap-4">
                <div className="w-full sm:w-1/2 md:w-1/2">
                  {/* Send a reminder email */}
                  <div className="flex flex-col gap-2">
                    <span>{__('send_a_reminder_email')}</span>
                    <div className="xs:flex-col flex w-full flex-row items-center gap-2">
                      <FormField
                        control={control}
                        name={`reminder.send_after_value`}
                        render={({ field: { value, onChange } }) => (
                          <Input
                            type="number"
                            value={value}
                            onChange={onChange}
                            className="w-1/4"
                          />
                        )}
                      />
                      <div className="flex w-3/4 flex-row items-center gap-2">
                        <FormField
                          control={control}
                          name={`reminder.send_after_unit`}
                          render={({ field: { value, onChange } }) => (
                            <Select value={value} onValueChange={onChange}>
                              <SelectTrigger className="min-w-40">
                                <SelectValue placeholder={__('select_filter')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minutes">{__('minutes')}</SelectItem>
                                <SelectItem value="hours">{__('hours')}</SelectItem>
                                <SelectItem value="days">{__('days')}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <div className="min-w-[150px] lowercase">{__('after_order_completed')}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-1/2">
                  {/* Max products  */}
                  <div className="flex flex-col gap-2">
                    <span>{__('max_products_label')}</span>
                    <div className="flex w-full items-center gap-2">
                      <FormField
                        control={control}
                        name={`reminder.max_products`}
                        render={({ field: { value, onChange } }) => (
                          <Input
                            type="number"
                            value={value}
                            onChange={onChange}
                            className="w-1/4"
                          />
                        )}
                      />
                      <div className="w-3/4">
                        <FormField
                          control={control}
                          name={`reminder.products_type`}
                          render={({ field: { value, onChange } }) => (
                            <Select value={value} onValueChange={onChange}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={__('select_filter')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="featured">{__('featured_products')}</SelectItem>
                                <SelectItem value="on_sale">{__('on_sale_products')}</SelectItem>
                                <SelectItem value="newest">{__('newest_products')}</SelectItem>
                                <SelectItem value="high_rated">
                                  {__('high_rated_products')}
                                </SelectItem>
                                <SelectItem value="low_rated">
                                  {__('low_rated_products')}
                                </SelectItem>
                                <SelectItem value="best_selling">
                                  {__('best_selling_products')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {__('leave_empty_to_remind_all')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Send to */}
        <div className="flex flex-col gap-2">
          <div className="text-foreground text-lg font-semibold">{__('send_to')}</div>
          <Card>
            <CardContent className="w-full">
              <div className="flex flex-col gap-4">
                {/* Except emails */}
                <div className="flex flex-col gap-2">
                  <span>{__('except_emails')}</span>
                  <FormField
                    control={control}
                    name={`reminder.except_emails`}
                    render={({ field: { value, onChange } }) => (
                      <Textarea rows={7} className="w-1/2" value={value} onChange={onChange} />
                    )}
                  />
                </div>

                {/* Send to guest */}
                <div className="flex items-center gap-2">
                  <FormField
                    control={control}
                    name={`reminder.send_to_guests`}
                    render={({ field: { value, onChange } }) => (
                      <Switch checked={value} onCheckedChange={onChange} />
                    )}
                  />
                  <span>{__('send_to_guests')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="text-xs">
          <span className="text-slate-500">{__('change')}</span>
          {` `}
          <span
            className="cursor-pointer lowercase underline decoration-solid"
            onClick={(e) => {
              setActiveTab('emails');
            }}
          >
            {__('email_template')}
          </span>
        </div>
      </div>
    </div>
  );
}
