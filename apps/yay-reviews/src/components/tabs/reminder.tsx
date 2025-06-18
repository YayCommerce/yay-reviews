import { CircleHelpIcon } from 'lucide-react';

import { __ } from '@/lib/utils';

import { Card, CardContent } from '../ui/card';
import { FormField, useFormContext } from '../ui/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export default function ReminderTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { control, watch } = useFormContext();
  const productsType = watch('reminder.products_type');

  return (
    <div className="flex w-[1100px] max-w-[90%] flex-col gap-8">
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
                    <span className="w-max">
                      <Label htmlFor="reminder.send_after_value" className="font-normal">
                        {__('send_a_reminder_email')}
                      </Label>
                    </span>

                    <div className="xs:flex-col flex w-full flex-row items-center gap-2 flex-wrap">
                      <FormField
                        control={control}
                        name={`reminder.send_after_value`}
                        render={({ field: { value, onChange } }) => (
                          <Input
                            id="reminder.send_after_value"
                            type="number"
                            value={value}
                            onChange={(e) => onChange(Number(e.target.value))}
                            className="w-1/4"
                            min={1}
                          />
                        )}
                      />
                      <div className="flex w-3/4 flex-row items-center gap-2">
                        <FormField
                          control={control}
                          name={`reminder.send_after_unit`}
                          render={({ field: { value, onChange } }) => (
                            <Select
                              id="reminder.send_after_unit"
                              value={value}
                              onValueChange={onChange}
                            >
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
                    <span className="w-max">
                      <Label htmlFor="reminder.max_products" className="font-normal">
                        {__('max_products_label')}
                      </Label>
                    </span>
                    <div className="flex w-full items-center gap-2">
                      <FormField
                        control={control}
                        name={`reminder.max_products`}
                        render={({ field: { value, onChange } }) => (
                          <Input
                            id="reminder.max_products"
                            disabled={productsType === 'all'}
                            type="number"
                            value={value}
                            onChange={(e) => onChange(Number(e.target.value))}
                            className="w-1/4"
                            min={1}
                          />
                        )}
                      />
                      <div className="w-3/4">
                        <FormField
                          control={control}
                          name={`reminder.products_type`}
                          render={({ field: { value, onChange } }) => (
                            <Select
                              id="reminder.products_type"
                              value={value}
                              onValueChange={onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={__('select_filter')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">{__('all_products')}</SelectItem>
                                <SelectItem value="normal">{__('normal_products')}</SelectItem>
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
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Send to */}
        <div className="flex flex-col gap-2">
          <div className="text-foreground text-lg font-semibold">{__('send_to_customers')}</div>
          <Card>
            <CardContent className="w-full">
              <div className="flex flex-col gap-4">
                {/* Except emails */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="reminder.except_emails" className="font-normal">
                      {__('except_emails')}
                    </Label>
                    <span className="cursor-pointer">
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger className="cursor-pointer" asChild>
                            <CircleHelpIcon size={16} />
                          </TooltipTrigger>
                          <TooltipContent align="center">
                            {__('except_emails_description')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  </div>
                  <FormField
                    control={control}
                    name={`reminder.except_emails`}
                    render={({ field: { value, onChange } }) => (
                      <Textarea
                        id="reminder.except_emails"
                        placeholder={__('except_emails_description')}
                        rows={7}
                        className="w-1/2"
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>

                {/* Send to guest */}
                <div className="flex items-center gap-2">
                  <FormField
                    control={control}
                    name={`reminder.send_to_guests`}
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        id="reminder.send_to_guests"
                        className="cursor-pointer"
                        checked={value}
                        onCheckedChange={onChange}
                      />
                    )}
                  />
                  <Label htmlFor="reminder.send_to_guests" className="font-normal">
                    {__('send_to_guests')}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="text-xs">
          <span className="text-slate-500">{__('change')}</span>
          {` `}
          <span
            className="text-foreground cursor-pointer lowercase underline decoration-solid"
            onClick={(e) => {
              e.preventDefault();
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
