import { __ } from '@/lib/utils';

import { Card, CardContent } from '../ui/card';
import Combobox from '../ui/combobox';
import { FormField, useFormContext } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

export default function ReminderTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { watch, control } = useFormContext();
  const orderProductsIn = watch('reminder.order_products_in');
  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="text-foreground text-3xl font-bold">{__('reminder_settings')}</div>
      <div className="flex flex-col gap-4">
        {/* Send reminder when */}
        <div className="flex flex-col gap-2">
          <div className="text-foreground text-lg font-semibold">{__('send_reminder_when')}</div>
          <Card>
            <CardContent className="w-full">
              <div className="flex flex-col gap-4">
                <div className="flex w-1/2 flex-row gap-2">
                  {/* Send a reminder email */}
                  <div className="flex flex-col gap-2">
                    <span>{__('send_a_reminder_email')}</span>
                    <div className="flex items-center gap-2">
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
                      <FormField
                        control={control}
                        name={`reminder.send_after_unit`}
                        render={({ field: { value, onChange } }) => (
                          <Select value={value} onValueChange={onChange}>
                            <SelectTrigger className="w-3/4">
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
                    </div>
                  </div>

                  {/* After order status is */}
                  <div className="flex flex-col gap-2">
                    <span className="lowercase">{__('after_order_status_is')}</span>
                    <FormField
                      control={control}
                      name={`reminder.order_status`}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          className="w-1/2"
                          placeholder={__('select_statuses')}
                          options={[
                            { label: 'Completed', value: 'completed' },
                            { label: 'Processing', value: 'processing' },
                          ]}
                          value={value}
                          onChange={onChange}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Order products in */}
                <div className="flex flex-col gap-2">
                  <span>{__('order_products_in')}</span>
                  <div>
                    <FormField
                      control={control}
                      name={`reminder.order_products_in`}
                      render={({ field: { value, onChange } }) => (
                        <Select value={value} onValueChange={onChange}>
                          <SelectTrigger className="w-1/2">
                            <SelectValue placeholder={__('select_filter')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_products">{__('all_products')}</SelectItem>
                            <SelectItem value="specific_categories">
                              {__('specific_categories')}
                            </SelectItem>
                            <SelectItem value="specific_products">
                              {__('specific_products')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={
                        orderProductsIn === 'all_products' ||
                        orderProductsIn === 'specific_products'
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      }
                    >
                      {__('select_categories')}
                    </span>
                    <FormField
                      control={control}
                      name={`reminder.categories`}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          options={[]}
                          value={value}
                          onChange={onChange}
                          className="w-1/2"
                          disabled={
                            orderProductsIn === 'all_products' ||
                            orderProductsIn === 'specific_products'
                          }
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={
                        orderProductsIn === 'all_products' ||
                        orderProductsIn === 'specific_categories'
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      }
                    >
                      {__('select_products')}
                    </span>
                    <FormField
                      control={control}
                      name={`reminder.products`}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          disabled={
                            orderProductsIn === 'all_products' ||
                            orderProductsIn === 'specific_categories'
                          }
                          options={[]}
                          value={value}
                          onChange={onChange}
                          className="w-1/2"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Exclude categories */}
                <div className="flex flex-col gap-2">
                  <span>{__('exclude_categories')}</span>
                  <FormField
                    control={control}
                    name={`reminder.exclude_categories`}
                    render={({ field: { value, onChange } }) => (
                      <Combobox options={[]} value={value} onChange={onChange} className="w-1/2" />
                    )}
                  />
                </div>

                {/* Exclude products */}
                <div className="flex flex-col gap-2">
                  <span>{__('exclude_products')}</span>
                  <FormField
                    control={control}
                    name={`reminder.exclude_products`}
                    render={({ field: { value, onChange } }) => (
                      <Combobox options={[]} value={value} onChange={onChange} className="w-1/2" />
                    )}
                  />
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
                {/* User roles */}
                <div className="flex flex-col gap-2">
                  <span>{__('user_roles')}</span>
                  <div>
                    <FormField
                      control={control}
                      name={`reminder.user_roles`}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          options={[]}
                          value={value}
                          onChange={onChange}
                          className="w-1/2"
                        />
                      )}
                    />
                  </div>
                </div>

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
