import { __ } from '@/lib/utils';

import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

export default function ReminderTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
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
                <div className="grid w-1/2 grid-cols-2 gap-2">
                  {/* Send a reminder email */}
                  <div className="flex flex-col gap-2">
                    <span>{__('send_a_reminder_email')}</span>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue={5} className="w-1/4" />
                      <Select>
                        <SelectTrigger className="w-3/4">
                          <SelectValue placeholder="Minutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">{__('minutes')}</SelectItem>
                          <SelectItem value="hours">{__('hours')}</SelectItem>
                          <SelectItem value="days">{__('days')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* After order status is */}
                  <div className="flex flex-col gap-2">
                    <span>{__('after_order_status_is')}</span>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Map your statuses here */}
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Order products in */}
                <div className="flex flex-col gap-2">
                  <span>{__('order_products_in')}</span>
                  <div>
                    <Select>
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder={__('select_filter')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{__('all_products')}</SelectItem>
                        <SelectItem value="categories">{__('specific_categories')}</SelectItem>
                        <SelectItem value="products">{__('specific_products')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span>{__('select_categories')}</span>
                    <Select>
                      <SelectTrigger className="w-1/2" disabled>
                        <SelectValue placeholder={__('select_categories')} />
                      </SelectTrigger>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span>{__('select_products')}</span>
                    <Select>
                      <SelectTrigger className="w-1/2" disabled>
                        <SelectValue placeholder={__('select_products')} />
                      </SelectTrigger>
                    </Select>
                  </div>
                </div>

                {/* Exclude categories */}
                <div className="flex flex-col gap-2">
                  <span>{__('exclude_categories')}</span>
                  <Select>
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder={__('select_categories')} />
                    </SelectTrigger>
                    <SelectContent>{/* Map your categories here */}</SelectContent>
                  </Select>
                </div>

                {/* Exclude products */}
                <div className="flex flex-col gap-2">
                  <span>{__('exclude_products')}</span>
                  <Select>
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder={__('select_products')} />
                    </SelectTrigger>
                    <SelectContent>{/* Map your products here */}</SelectContent>
                  </Select>
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
                    <Select>
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder={__('select_user_roles')} />
                      </SelectTrigger>
                      <SelectContent>{/* Map your user roles here */}</SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Except emails */}
                <div className="flex flex-col gap-2">
                  <span>{__('except_emails')}</span>
                  <Textarea rows={7} className="w-1/2" />
                </div>

                {/* Send to guest */}
                <div className="flex items-center gap-2">
                  <Switch checked={true} />
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
