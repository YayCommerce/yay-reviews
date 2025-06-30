import PageLayout from '@/layouts/page-layout';
import { __ } from '@wordpress/i18n';

import useAppContext from '@/hooks/use-app-context';
import { Card } from '@/components/ui/card';
import { FormField, useFormContext } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PageTitle from '@/components/page-title';

export default function ReminderPage() {
  return (
    <PageLayout>
      <PageTitle title={__('Reminder Settings', 'yay-reviews')} />
      <div className="container mx-auto space-y-8 px-7 py-0">
        <ReminderInformation />
        <ReminderRecipients />
      </div>
    </PageLayout>
  );
}

function ReminderInformation() {
  const { control, watch } = useFormContext();
  const productsType = watch('reminder.products_type');

  return (
    <div className="space-y-4">
      <div className="text-foreground text-xl font-semibold">
        {__('Send reminder when', 'yay-reviews')}
      </div>
      <Card className="gap-0 space-y-6 p-6">
        <div>
          <Label htmlFor="reminder.send_after_value" className="mb-2">
            {__('Send a reminder email', 'yay-reviews')}
          </Label>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div>
              <FormField
                control={control}
                name="reminder.send_after_value"
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="reminder.send_after_value"
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
                    className="max-w-[60px]"
                    min={1}
                  />
                )}
              />
            </div>
            <FormField
              control={control}
              name="reminder.send_after_unit"
              render={({ field: { value, onChange } }) => (
                <Select id="reminder.send_after_unit" value={value} onValueChange={onChange}>
                  <SelectTrigger className="min-w-40">
                    <SelectValue placeholder={__('Select filter', 'yay-reviews')} />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      {
                        value: 'minutes',
                        label: __('Minutes', 'yay-reviews'),
                      },
                      {
                        value: 'hours',
                        label: __('Hours', 'yay-reviews'),
                      },
                      {
                        value: 'days',
                        label: __('Days', 'yay-reviews'),
                      },
                    ].map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <span className="text-sm font-medium">
              {__('after order completed', 'yay-reviews')}
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="reminder.max_products" className="mb-2">
            {__('Maximum products ( in order ) need to remind reviewing', 'yay-reviews')}
          </Label>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div>
              <FormField
                control={control}
                name={`reminder.max_products`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="reminder.max_products"
                    disabled={productsType === 'all'}
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
                    className="max-w-[60px]"
                    min={1}
                  />
                )}
              />
            </div>
            <FormField
              control={control}
              name="reminder.products_type"
              render={({ field: { value, onChange } }) => (
                <Select id="reminder.products_type" value={value} onValueChange={onChange}>
                  <SelectTrigger className="w-full max-w-[300px]">
                    <SelectValue placeholder={__('Select filter', 'yay-reviews')} />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      {
                        value: 'all',
                        label: __('All products', 'yay-reviews'),
                      },
                      {
                        value: 'normal',
                        label: __('Normal products', 'yay-reviews'),
                      },
                      {
                        value: 'featured',
                        label: __('Featured products', 'yay-reviews'),
                      },
                      {
                        value: 'on_sale',
                        label: __('On-sale products', 'yay-reviews'),
                      },
                      {
                        value: 'newest',
                        label: __('Newest products', 'yay-reviews'),
                      },
                      {
                        value: 'high_rated',
                        label: __('High-rated products', 'yay-reviews'),
                      },
                      {
                        value: 'low_rated',
                        label: __('Low-rated products', 'yay-reviews'),
                      },
                      {
                        value: 'best_selling',
                        label: __('Best selling products', 'yay-reviews'),
                      },
                    ].map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="text-muted-foreground mt-2 text-sm">
            {__('Leave empty to remind all', 'yay-reviews')}
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReminderRecipients() {
  const { control } = useFormContext();
  const { changeTab } = useAppContext();
  return (
    <div className="space-y-4">
      <div className="text-foreground text-xl font-semibold">{__('Send to', 'yay-reviews')}</div>
      <Card className="gap-0 space-y-6 p-6">
        <FormField
          control={control}
          name="reminder.send_to"
          render={({ field: { value, onChange } }) => (
            <Select
              defaultValue="registered_customers"
              id="reminder.send_to"
              value={value}
              onValueChange={onChange}
            >
              <SelectTrigger className="w-full max-w-[500px]">
                <SelectValue placeholder={__('Select value', 'yay-reviews')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registered_customers">
                  {__('Only registered customers', 'yay-reviews')}
                </SelectItem>
                <SelectItem value="all_customers">
                  {__('Customers (include guest users)', 'yay-reviews')}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <div className="space-y-2">
          <Label htmlFor="reminder.except_emails">{__("Don't send to", 'yay-reviews')}</Label>
          <FormField
            control={control}
            name="reminder.except_emails"
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
      </Card>
      <div className="text-xs">
        <span className="text-slate-500">{__('Change', 'yay-reviews')}</span>
        {` `}
        <span
          className="text-foreground cursor-pointer lowercase underline decoration-solid"
          onClick={(e) => {
            e.preventDefault();
            changeTab('emails');
          }}
        >
          {__('email template', 'yay-reviews')}
        </span>
      </div>
    </div>
  );
}
