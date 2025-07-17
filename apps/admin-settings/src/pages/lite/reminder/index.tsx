import { useMemo } from 'react';
import PageLayout from '@/layouts/page-layout';
import { __ } from '@wordpress/i18n';

import { __IS_PRO__, __PLUGIN_URL__, __PRO_VERSION_URL__ } from '@/config/version';
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
import PageTitle from '@/components/page-title';

export default function ReminderPage() {
  const { changeTab } = useAppContext();

  return (
    <PageLayout>
      <PageTitle title={__('Review reminder', 'yay-reviews')} />
      <div className="container mx-auto space-y-8 px-7 py-0">
        <ReminderInformation />
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
    </PageLayout>
  );
}

const productFilterOptions = [
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
];

function ReminderInformation() {
  const { control, watch } = useFormContext();
  const productScope = watch('reminder.product_scope');
  const maxProductsPerEmail = watch('reminder.max_products_per_email');

  const summaryText = useMemo(() => {
    const leadingText = __('Remind customers to review', 'yay-reviews');
    const productFilterLabel = productFilterOptions.find(
      (item) => item.value === productScope,
    )?.label;
    let productsText = productFilterLabel || __('All products', 'yay-reviews');
    if (productScope !== 'all') {
      productsText = `${maxProductsPerEmail ? maxProductsPerEmail : 'All'} "${productsText}"`;
    }
    return `${leadingText}: ${productsText} ${__('from an order', 'yay-reviews')}`;
  }, [productScope, maxProductsPerEmail]);

  return (
    <>
      <div className="space-y-4">
        <div className="text-foreground text-xl font-semibold">
          {__('When should the reminder be sent?', 'yay-reviews')}
        </div>
        <Card className="gap-0 space-y-6 p-6">
          <Label htmlFor="reminder.send_after_value" className="mb-2 w-fit">
            {__('Send a reminder email to customers', 'yay-reviews')}
          </Label>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div>
              <FormField
                control={control}
                name="reminder.delay_amount"
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="reminder.delay_amount"
                    type="number"
                    value={__IS_PRO__ ? value : '5'}
                    onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
                    className="max-w-[60px]"
                    min={1}
                    disabled={!__IS_PRO__}
                  />
                )}
              />
            </div>
            <FormField
              control={control}
              name="reminder.delay_unit"
              render={({ field: { value, onChange } }) => (
                <Select
                  id="reminder.delay_unit"
                  value={__IS_PRO__ ? value : 'days'}
                  onValueChange={onChange}
                  disabled={!__IS_PRO__}
                >
                  <SelectTrigger className="w-full max-w-[130px]">
                    <SelectValue placeholder={__('Select filter', 'yay-reviews')} />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      {
                        value: 'minutes',
                        label: __('Minute(s)', 'yay-reviews'),
                      },
                      {
                        value: 'hours',
                        label: __('Hour(s)', 'yay-reviews'),
                      },
                      {
                        value: 'days',
                        label: __('Day(s)', 'yay-reviews'),
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
            <span className="text-sm">{__('after order completed', 'yay-reviews')}</span>
          </div>
          {!__IS_PRO__ && (
            <div
              className="text-muted-foreground text-sm"
              dangerouslySetInnerHTML={{
                __html: __('You can adjust the reminder timing in the %s.', 'yay-reviews').replace(
                  '%s',
                  `<a href="${__PRO_VERSION_URL__}" target="_blank">${__('Pro version', 'yay-reviews')}</a>`,
                ),
              }}
            ></div>
          )}
        </Card>
      </div>
      <div className="space-y-4">
        <div className="text-foreground text-xl font-semibold">
          {__('What products should be reminded?', 'yay-reviews')}
        </div>
        <Card className="gap-0 space-y-6 p-6">
          <div className="text-sm">{summaryText}</div>
          <Label htmlFor="reminder.max_products_per_email" className="mb-2 w-fit">
            {__('Product filter', 'yay-reviews')}
          </Label>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div>
              <FormField
                control={control}
                name={`reminder.max_products_per_email`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="reminder.max_products_per_email"
                    disabled={productScope === 'all' || !__IS_PRO__}
                    type="number"
                    value={value}
                    placeholder={__('All', 'yay-reviews')}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        onChange('');
                      } else {
                        onChange(Math.max(1, Number(e.target.value)));
                      }
                    }}
                    className="max-w-[60px]"
                    min={1}
                  />
                )}
              />
            </div>
            <FormField
              control={control}
              name="reminder.product_scope"
              render={({ field: { value, onChange } }) => (
                <Select
                  id="reminder.product_scope"
                  value={__IS_PRO__ ? value : 'all'}
                  onValueChange={onChange}
                  disabled={!__IS_PRO__}
                >
                  <SelectTrigger className="w-full max-w-[210px]">
                    <SelectValue placeholder={__('Select filter', 'yay-reviews')} />
                  </SelectTrigger>
                  <SelectContent>
                    {productFilterOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {!__IS_PRO__ && (
            <div
              className="text-muted-foreground text-sm"
              dangerouslySetInnerHTML={{
                __html: __('You can select reminder products in the %s.', 'yay-reviews').replace(
                  '%s',
                  `<a href="${__PRO_VERSION_URL__}" target="_blank">${__('Pro version', 'yay-reviews')}</a>`,
                ),
              }}
            ></div>
          )}
        </Card>
      </div>
    </>
  );
}
