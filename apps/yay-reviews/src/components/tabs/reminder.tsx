import { __ } from '@wordpress/i18n';
import { CircleHelpIcon } from 'lucide-react';

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
      <div className="text-foreground text-3xl font-bold">
        {__('Reminder Settings', 'yay-reviews')}
      </div>
      <div className="flex flex-col gap-6">
        {/* Send reminder when */}
        <div className="flex flex-col gap-2">
          <div className="text-foreground text-lg font-semibold">
            {__('Send reminder when', 'yay-reviews')}
          </div>
          <Card>
            <CardContent className="w-full">
              <div className="flex flex-col gap-4">
                <div className="w-full max-w-[500px]">
                  {/* Send a reminder email */}
                  <div className="flex flex-col gap-2">
                    <span className="w-max">
                      <Label htmlFor="reminder.send_after_value" className="font-normal">
                        {__('Send a reminder email', 'yay-reviews')}
                      </Label>
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <FormField
                        control={control}
                        name={`reminder.send_after_value`}
                        render={({ field: { value, onChange } }) => (
                          <Input
                            id="reminder.send_after_value"
                            type="number"
                            value={value}
                            onChange={(e) => onChange(Number(e.target.value))}
                            className="max-w-[60px]"
                            min={1}
                          />
                        )}
                      />
                      <div className="flex flex-row flex-wrap items-center gap-2">
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
                                <SelectValue placeholder={__('Select filter', 'yay-reviews')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minutes">
                                  {__('Minutes', 'yay-reviews')}
                                </SelectItem>
                                <SelectItem value="hours">{__('Hours', 'yay-reviews')}</SelectItem>
                                <SelectItem value="days">{__('Days', 'yay-reviews')}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <div className="min-w-[150px] lowercase">
                          {__('After order completed', 'yay-reviews')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full max-w-[500px]">
                  {/* Max products  */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reminder.max_products" className="font-normal">
                      {__('Maximum products ( in order ) need to remind reviewing', 'yay-reviews')}
                    </Label>
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
                            className="max-w-[60px]"
                            min={1}
                          />
                        )}
                      />
                      <FormField
                        control={control}
                        name={`reminder.products_type`}
                        render={({ field: { value, onChange } }) => (
                          <Select
                            id="reminder.products_type"
                            value={value}
                            onValueChange={onChange}
                          >
                            <SelectTrigger className="w-full max-w-[300px]">
                              <SelectValue placeholder={__('Select filter', 'yay-reviews')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {__('All products', 'yay-reviews')}
                              </SelectItem>
                              <SelectItem value="normal">
                                {__('Normal products', 'yay-reviews')}
                              </SelectItem>
                              <SelectItem value="featured">
                                {__('Featured products', 'yay-reviews')}
                              </SelectItem>
                              <SelectItem value="on_sale">
                                {__('On-sale products', 'yay-reviews')}
                              </SelectItem>
                              <SelectItem value="newest">
                                {__('Newest products', 'yay-reviews')}
                              </SelectItem>
                              <SelectItem value="high_rated">
                                {__('High-rated products', 'yay-reviews')}
                              </SelectItem>
                              <SelectItem value="low_rated">
                                {__('Low-rated products', 'yay-reviews')}
                              </SelectItem>
                              <SelectItem value="best_selling">
                                {__('Best selling products', 'yay-reviews')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Send to */}
        <div className="flex flex-col gap-2">
          <div className="text-foreground text-lg font-semibold">
            {__('Send to', 'yay-reviews')}
          </div>
          <Card>
            <CardContent className="w-full">
              <div className="flex flex-col gap-4">
                {/* Send to customers */}
                <div className="flex items-center gap-2">
                  <FormField
                    control={control}
                    name={`reminder.send_to`}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        defaultValue="registered_customers"
                        id="reminder.send_to"
                        value={value}
                        onValueChange={onChange}
                      >
                        <SelectTrigger className="w-full max-w-[500px]">
                          <SelectValue placeholder={__('Select filter', 'yay-reviews')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="registered_customers">
                            {__('Only registered customers', 'yay-reviews')}
                          </SelectItem>
                          <SelectItem value="all_customers">
                            {__('Customers ( include guest users )', 'yay-reviews')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {/* Except emails */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="reminder.except_emails" className="font-normal">
                      {__("Don't send to", 'yay-reviews')}
                    </Label>
                    <span className="cursor-pointer">
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger className="cursor-pointer" asChild>
                            <CircleHelpIcon size={16} />
                          </TooltipTrigger>
                          <TooltipContent align="center">
                            {__('Enter email addresses, one per line.', 'yay-reviews')}
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
                        placeholder={__('Enter email addresses, one per line.', 'yay-reviews')}
                        rows={7}
                        className="max-w-[500px]"
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="text-xs">
          <span className="text-slate-500">{__('Change', 'yay-reviews')}</span>
          {` `}
          <span
            className="text-foreground cursor-pointer lowercase underline decoration-solid"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('emails');
            }}
          >
            {__('email template', 'yay-reviews')}
          </span>
        </div>
      </div>
    </div>
  );
}
