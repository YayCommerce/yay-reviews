import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { CircleHelpIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { getProducts, postCoupon } from '@/lib/queries';
import { CouponFormData, couponSchema } from '@/lib/schema';
import { cn, updateQueryCache } from '@/lib/utils';

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
      console.error(__('Error fetching products:', 'yay-reviews'), error);
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
      toast.error(__('Failed to create coupon', 'yay-reviews'));
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
          <span className="w-max">
            <Label htmlFor="code" className="font-normal">
              {__('Coupon code', 'yay-reviews')}
            </Label>
          </span>
          <FormField
            control={control}
            name={`code`}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <div className="space-y-1">
                <Input id="code" name="code" value={value} onChange={onChange} />
                {error && <span className="text-sm text-red-500">{error.message}</span>}
              </div>
            )}
          />
        </div>
        <div className="grid gap-2">
          <span className="w-max">
            <Label htmlFor="description" className="font-normal">
              {__('Description ( optional )', 'yay-reviews')}
            </Label>
          </span>
          <FormField
            control={control}
            name={`description`}
            render={({ field: { value, onChange } }) => (
              <Input id="description" name="description" value={value} onChange={onChange} />
            )}
          />
        </div>
        <div className="grid gap-2">
          <span className="w-max">
            <Label htmlFor="discount_type" className="font-normal">
              {__('Discount type', 'yay-reviews')}
            </Label>
          </span>
          <FormField
            control={control}
            name={`discount_type`}
            render={({ field: { value, onChange } }) => (
              <Select
                id="discount_type"
                name="discount_type"
                value={value}
                onValueChange={onChange}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder={__('Select type', 'yay-reviews')} />
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
          <span className="w-max">
            <Label htmlFor="amount" className="font-normal">
              {__('Coupon amount', 'yay-reviews')}
            </Label>
          </span>
          <FormField
            control={control}
            name={`amount`}
            render={({ field: { value, onChange } }) => (
              <Input
                id="amount"
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
                <Checkbox
                  id="free_shipping"
                  name="free_shipping"
                  checked={value}
                  onCheckedChange={onChange}
                />
                <Label htmlFor="free_shipping" className="font-normal">
                  {__('Allow free shipping', 'yay-reviews')}{' '}
                  <span>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <CircleHelpIcon size={16} />
                        </TooltipTrigger>
                        <TooltipContent align="center">
                          {__('Check this box if the coupon grants free shipping.', 'yay-reviews')}
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
          <span className="w-max">
            <Label htmlFor="expiry_date" className="font-normal">
              {__('Coupon expiry date', 'yay-reviews')}
            </Label>
          </span>
          <FormField
            control={control}
            name={`expiry_date`}
            render={({ field: { value, onChange } }) => (
              <DatePicker
                id="expiry_date"
                date={value}
                setDate={onChange}
                placeholder={__('No expiry', 'yay-reviews')}
              />
            )}
          />
        </div>
        <Tabs defaultValue="" className="w-full gap-4">
          <TabsList className="w-full">
            <TabsTrigger value="usage_restriction" className="w-1/2">
              {__('Usage restriction', 'yay-reviews')}
            </TabsTrigger>
            <TabsTrigger value="usage_limits" className="w-1/2">
              {__('Usage limits', 'yay-reviews')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="usage_restriction" className="grid items-start gap-4 px-0">
            <div className="grid gap-2">
              <span className="w-max">
                <Label htmlFor="minimum_spend" className="font-normal">
                  {__('Minimum spend', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`minimum_spend`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="minimum_spend"
                    name="minimum_spend"
                    placeholder={__('No minimum', 'yay-reviews')}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    type="number"
                    min={0}
                  />
                )}
              />
            </div>
            <div className="grid gap-2">
              <span className="w-max">
                <Label htmlFor="maximum_spend" className="font-normal">
                  {__('Maximum spend', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`maximum_spend`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="maximum_spend"
                    name="maximum_spend"
                    placeholder={__('No maximum', 'yay-reviews')}
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
                    <Checkbox
                      id="individual_use"
                      name="individual_use"
                      checked={value}
                      onCheckedChange={onChange}
                    />
                    <Label htmlFor="individual_use" className="font-normal">
                      {__('Individual use only', 'yay-reviews')}
                      <span>
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <CircleHelpIcon size={16} />
                            </TooltipTrigger>
                            <TooltipContent align="center">
                              {__(
                                'Check this box if the coupon cannot be used in conjunction with other coupons.',
                                'yay-reviews',
                              )}
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
                      id="exclude_sale_items"
                      name="exclude_sale_items"
                      checked={value}
                      onCheckedChange={onChange}
                    />
                    <Label htmlFor="exclude_sale_items" className="font-normal">
                      {__('Exclude sale items', 'yay-reviews')}
                      <span>
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <CircleHelpIcon size={16} />
                            </TooltipTrigger>
                            <TooltipContent align="center">
                              {__(
                                'Check this box if the coupon should not apply to items on sale.',
                                'yay-reviews',
                              )}
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
              <SectionHorizontal label={__('And', 'yay-reviews')} />
              <span className="w-max">
                <Label htmlFor="products" className="font-normal">
                  {__('Products', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`products`}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    id="products"
                    className="w-full"
                    options={productOptions}
                    value={value}
                    onChange={onChange}
                    onSearch={(search) => handleProductSearch(search, setProductOptions)}
                    placeholder={__('Select products', 'yay-reviews')}
                  />
                )}
              />
            </div>

            <div className="grid gap-2">
              <span className="w-max">
                <Label htmlFor="exclude_products" className="font-normal">
                  {__('Exclude products', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`exclude_products`}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    id="exclude_products"
                    className="w-full"
                    options={excludeProductOptions}
                    value={value}
                    onChange={onChange}
                    onSearch={(search) => handleProductSearch(search, setExcludeProductOptions)}
                    placeholder={__('Select products', 'yay-reviews')}
                  />
                )}
              />
            </div>

            <div className="grid gap-2">
              <SectionHorizontal label={__('And', 'yay-reviews')} />
              <span className="w-max">
                <Label htmlFor="product_categories" className="font-normal">
                  {__('Product categories', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`product_categories`}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    id="product_categories"
                    className="w-full"
                    options={window.yayReviews.product_categories}
                    value={value}
                    onChange={onChange}
                    placeholder={__('Any category', 'yay-reviews')}
                  />
                )}
              />
            </div>

            <div className="grid gap-2">
              <span className="w-max">
                <Label htmlFor="exclude_product_categories" className="font-normal">
                  {__('Exclude product categories', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`exclude_product_categories`}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    id="exclude_product_categories"
                    className="w-full"
                    options={window.yayReviews.product_categories}
                    value={value}
                    onChange={onChange}
                    placeholder={__('No categories', 'yay-reviews')}
                  />
                )}
              />
            </div>

            <div className="grid gap-2">
              <SectionHorizontal label={__('And', 'yay-reviews')} />
              <span className="w-max">
                <Label htmlFor="allowed_emails" className="font-normal">
                  {__('Allowed emails', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`allowed_emails`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="allowed_emails"
                    name="allowed_emails"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </div>

            <div className="grid gap-2">
              <SectionHorizontal label={__('And', 'yay-reviews')} />
              <span className="w-max">
                <Label htmlFor="product_brands" className="font-normal">
                  {__('Product brands', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`product_brands`}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    id="product_brands"
                    className="w-full"
                    options={window.yayReviews.product_brands}
                    value={value}
                    onChange={onChange}
                    placeholder={__('Any brand', 'yay-reviews')}
                  />
                )}
              />
            </div>

            <div className="grid gap-2">
              <span className="w-max">
                <Label htmlFor="exclude_product_brands" className="font-normal">
                  {__('Exclude product brands', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`exclude_product_brands`}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    id="exclude_product_brands"
                    className="w-full"
                    options={window.yayReviews.product_brands}
                    value={value}
                    onChange={onChange}
                    placeholder={__('No brands', 'yay-reviews')}
                  />
                )}
              />
            </div>
          </TabsContent>
          <TabsContent value="usage_limits" className="grid items-start gap-4 px-0">
            <div className="grid gap-2">
              <span className="w-max">
                <Label htmlFor="usage_limit_per_coupon" className="font-normal">
                  {__('Usage limit per coupon', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`usage_limit_per_coupon`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="usage_limit_per_coupon"
                    name="usage_limit_per_coupon"
                    placeholder={__('Unlimited usage', 'yay-reviews')}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    type="number"
                    min={0}
                  />
                )}
              />
            </div>
            <div className="grid gap-2">
              <span className="w-max">
                <Label htmlFor="limit_usage_to_x_items" className="font-normal">
                  {__('Limit usage to X items', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`limit_usage_to_x_items`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="limit_usage_to_x_items"
                    name="limit_usage_to_x_items"
                    placeholder={__('Apply to all qualifying items in cart', 'yay-reviews')}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    type="number"
                    min={0}
                  />
                )}
              />
            </div>
            <div className="grid gap-2">
              <span className="w-max">
                <Label htmlFor="usage_limit_per_user" className="font-normal">
                  {__('Usage limit per user', 'yay-reviews')}
                </Label>
              </span>
              <FormField
                control={control}
                name={`usage_limit_per_user`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="usage_limit_per_user"
                    name="usage_limit_per_user"
                    placeholder={__('Unlimited usage', 'yay-reviews')}
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
        <div
          data-slot="drawer-footer"
          className="fixed right-0 bottom-0 left-0 flex flex-col gap-2 bg-white p-4"
          style={{
            boxShadow: '0 0 #0000, 0 0 #0000, 0 -1px 0 #edf3f9, 0 -5px 12px #00000008',
          }}
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
            {__('Add coupon', 'yay-reviews')}
            {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CouponForm;
