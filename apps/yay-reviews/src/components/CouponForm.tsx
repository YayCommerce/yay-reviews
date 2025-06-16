import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { CircleHelpIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { getProducts, postCoupon } from '@/lib/queries';
import { CouponFormData, couponSchema } from '@/lib/schema';
import { __, cn, updateQueryCache } from '@/lib/utils';

import { SectionHorizontal } from './SectionHorizontal';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import Combobox, { ComboboxOption } from './ui/combobox';
import { DatePicker } from './ui/date-picker';
import { Form, FormField, useForm } from './ui/form';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export const CouponForm = ({
  className,
  setOpen,
  handleUpdateCouponId,
}: {
  className: string;
  setOpen: (open: boolean) => void;
  handleUpdateCouponId: (couponId: string) => void;
}) => {
  const [productOptions, setProductOptions] = useState<ComboboxOption[]>([]);
  const [excludeProductOptions, setExcludeProductOptions] = useState<ComboboxOption[]>([]);

  const queryClient = useQueryClient();

  const couponTypes = Object.entries(window.yayReviews.coupon_types).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  const handleProductSearch = async (
    search: string,
    setOptions: (options: ComboboxOption[]) => void,
  ) => {
    try {
      const products = await getProducts(search, 10);
      setOptions(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      setOptions([]);
    }
  };

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      description: '',
      discount_type: couponTypes.length > 0 ? couponTypes[0].value : '',
      amount: 0,
      free_shipping: false,
      expiry_date: undefined,
      minimum_spend: undefined,
      maximum_spend: undefined,
      individual_use: false,
      exclude_sale_items: false,
      products: [],
      exclude_products: [],
      product_categories: [],
      exclude_product_categories: [],
      allowed_emails: '',
      product_brands: [],
      exclude_product_brands: [],
      usage_limit_per_coupon: undefined,
      limit_usage_to_x_items: undefined,
      usage_limit_per_user: undefined,
    },
    mode: 'onChange',
  });

  async function onSubmit(data: CouponFormData) {
    try {
      // delete all toast
      toast.dismiss();
      const response = await postCoupon(data);
      if (response.is_exists) {
        toast.error(response.message);
        return;
      } else if (response.coupon !== null) {
        // update query cache
        updateQueryCache(queryClient, ['coupons'], response.coupon);
        handleUpdateCouponId(response.coupon.id.toString());

        toast.success(response.message);
        form.reset(data); // Reset form with new values after successful save
        // close drawer
        setOpen(false);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to create coupon');
      console.error(error);
    }
  }

  const { control } = form;

  return (
    <Form {...form}>
      <form
        id="coupon-form"
        className={cn('grid items-start gap-4 overflow-y-auto pb-21', className)}
        // ref={ref}
        onSubmit={form.handleSubmit(onSubmit, (errors, e) => {
          console.log(errors, e);
        })}
      >
        <div className="grid gap-2">
          <Label htmlFor="code">{__('coupon_code')}</Label>
          <FormField
            control={control}
            name={`code`}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <div className="space-y-1">
                <Input name="code" value={value} onChange={onChange} />
                {error && <span className="text-sm text-red-500">{error.message}</span>}
              </div>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">
            {__('description')} ({__('optional')})
          </Label>
          <FormField
            control={control}
            name={`description`}
            render={({ field: { value, onChange } }) => (
              <Input name="description" value={value} onChange={onChange} />
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="discount_type">{__('discount_type')}</Label>
          <FormField
            control={control}
            name={`discount_type`}
            render={({ field: { value, onChange } }) => (
              <Select name="discount_type" value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder={__('select_type')} />
                </SelectTrigger>
                <SelectContent>
                  {couponTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amount">{__('coupon_amount')}</Label>
          <FormField
            control={control}
            name={`amount`}
            render={({ field: { value, onChange } }) => (
              <Input
                name="amount"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                type="number"
                min={0}
              />
            )}
          />
        </div>
        <div className="grid gap-2">
          <FormField
            control={control}
            name={`free_shipping`}
            render={({ field: { value, onChange } }) => (
              <div className="flex items-center gap-2">
                <Checkbox name="free_shipping" checked={value} onCheckedChange={onChange} />
                <Label htmlFor="free_shipping">
                  {__('allow_free_shipping')}{' '}
                  <span>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <CircleHelpIcon size={16} />
                        </TooltipTrigger>
                        <TooltipContent align="center">
                          {__('allow_free_shipping_description')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </Label>
              </div>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expiry_date">{__('coupon_expiry_date')}</Label>
          <FormField
            control={control}
            name={`expiry_date`}
            render={({ field: { value, onChange } }) => (
              <DatePicker date={value} setDate={onChange} placeholder={__('no_expiry')} />
            )}
          />
        </div>
        <div className="grid gap-2">
          <Tabs defaultValue="" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="usage_restriction" className="w-1/2">
                {__('usage_restriction')}
              </TabsTrigger>
              <TabsTrigger value="usage_limits" className="w-1/2">
                {__('usage_limits')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="usage_restriction" className="grid items-start gap-4 px-0">
              <div className="grid gap-2">
                <Label htmlFor="minimum_spend">{__('minimum_spend')}</Label>
                <FormField
                  control={control}
                  name={`minimum_spend`}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      name="minimum_spend"
                      placeholder={__('no_minimum')}
                      value={value}
                      onChange={(e) => onChange(Number(e.target.value))}
                      type="number"
                      min={0}
                    />
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maximum_spend">{__('maximum_spend')}</Label>
                <FormField
                  control={control}
                  name={`maximum_spend`}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      name="maximum_spend"
                      placeholder={__('no_maximum')}
                      value={value}
                      onChange={(e) => onChange(Number(e.target.value))}
                      type="number"
                      min={0}
                    />
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={control}
                  name={`individual_use`}
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox name="individual_use" checked={value} onCheckedChange={onChange} />
                      <Label htmlFor="individual_use">
                        {__('individual_use')}
                        <span>
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <CircleHelpIcon size={16} />
                              </TooltipTrigger>
                              <TooltipContent align="center">
                                {__('individual_use_description')}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                      </Label>
                    </div>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={control}
                  name={`exclude_sale_items`}
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        name="exclude_sale_items"
                        checked={value}
                        onCheckedChange={onChange}
                      />
                      <Label htmlFor="exclude_sale_items">
                        {__('exclude_sale_items')}
                        <span>
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <CircleHelpIcon size={16} />
                              </TooltipTrigger>
                              <TooltipContent align="center">
                                {__('exclude_sale_items_description')}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                      </Label>
                    </div>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <SectionHorizontal label={__('and')} />
                <Label htmlFor="products">{__('products')}</Label>
                <FormField
                  control={control}
                  name={`products`}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      className="w-full"
                      options={productOptions}
                      value={value}
                      onChange={onChange}
                      onSearch={(search) => handleProductSearch(search, setProductOptions)}
                      placeholder={__('select_products')}
                    />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="exclude_products">{__('exclude_products')}</Label>
                <FormField
                  control={control}
                  name={`exclude_products`}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      className="w-full"
                      options={excludeProductOptions}
                      value={value}
                      onChange={onChange}
                      onSearch={(search) => handleProductSearch(search, setExcludeProductOptions)}
                      placeholder={__('select_products')}
                    />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <SectionHorizontal label={__('and')} />
                <Label htmlFor="product_categories">{__('product_categories')}</Label>
                <FormField
                  control={control}
                  name={`product_categories`}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      className="w-full"
                      options={window.yayReviews.product_categories}
                      value={value}
                      onChange={onChange}
                      placeholder={__('any_category')}
                    />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="exclude_product_categories">
                  {__('exclude_product_categories')}
                </Label>
                <FormField
                  control={control}
                  name={`exclude_product_categories`}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      className="w-full"
                      options={window.yayReviews.product_categories}
                      value={value}
                      onChange={onChange}
                      placeholder={__('no_categories')}
                    />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <SectionHorizontal label={__('and')} />
                <Label htmlFor="allowed_emails">{__('allowed_emails')}</Label>
                <FormField
                  control={control}
                  name={`allowed_emails`}
                  render={({ field: { value, onChange } }) => (
                    <Input name="allowed_emails" value={value} onChange={onChange} />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <SectionHorizontal label={__('and')} />
                <Label htmlFor="product_brands">{__('product_brands')}</Label>
                <FormField
                  control={control}
                  name={`product_brands`}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      className="w-full"
                      options={window.yayReviews.product_brands}
                      value={value}
                      onChange={onChange}
                      placeholder={__('any_brand')}
                    />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="exclude_product_brands">{__('exclude_product_brands')}</Label>
                <FormField
                  control={control}
                  name={`exclude_product_brands`}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      className="w-full"
                      options={window.yayReviews.product_brands}
                      value={value}
                      onChange={onChange}
                      placeholder={__('no_brands')}
                    />
                  )}
                />
              </div>
            </TabsContent>
            <TabsContent value="usage_limits" className="grid items-start gap-4 px-0">
              <div className="grid gap-2">
                <Label htmlFor="usage_limit_per_coupon">{__('usage_limit_per_coupon')}</Label>
                <FormField
                  control={control}
                  name={`usage_limit_per_coupon`}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      name="usage_limit_per_coupon"
                      placeholder={__('unlimited_usage')}
                      value={value}
                      onChange={(e) => onChange(Number(e.target.value))}
                      type="number"
                      min={0}
                    />
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="limit_usage_to_x_items">{__('limit_usage_to_x_items')}</Label>
                <FormField
                  control={control}
                  name={`limit_usage_to_x_items`}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      name="limit_usage_to_x_items"
                      placeholder={__('limit_usage_to_x_items_placeholder')}
                      value={value}
                      onChange={(e) => onChange(Number(e.target.value))}
                      type="number"
                      min={0}
                    />
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usage_limit_per_user">{__('usage_limit_per_user')}</Label>
                <FormField
                  control={control}
                  name={`usage_limit_per_user`}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      name="usage_limit_per_user"
                      placeholder={__('unlimited_usage')}
                      value={value}
                      onChange={(e) => onChange(Number(e.target.value))}
                      type="number"
                      min={0}
                    />
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div
          data-slot="drawer-footer"
          className="fixed right-0 bottom-0 left-0 flex flex-col gap-2 bg-white p-4"
        >
          <Button
            type="submit"
            form="coupon-form"
            onClick={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit, (errors, e) => {
                console.log(errors, e);
              })();
            }}
          >
            {__('add_coupon')}
            {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CouponForm;
