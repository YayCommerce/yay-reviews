import { zodResolver } from '@hookform/resolvers/zod';
import { __ } from '@wordpress/i18n';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { postCoupon } from '@/lib/queries';
import { CouponFormData, couponSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';
import useRewardsContext from '@/hooks/use-rewards-context';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormField, useForm } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import InputNumberWithSuffix from './input-numper-with-suffix';

export const CouponForm = ({
  className,
  onCreated,
  handleUpdateCouponId,
}: {
  className: string;
  onCreated: () => void;
  handleUpdateCouponId: (couponId: string) => void;
}) => {
  const { coupons, addCoupon } = useRewardsContext();

  const generateCouponCode = () => {
    const code = Math.random().toString(36).substring(2, 15);
    // Check if code is already
    const isExists = coupons.some((coupon) => coupon.code === code);
    if (isExists) {
      generateCouponCode();
    } else {
      return code;
    }
  };

  const onSuffixChange = (suffix: string) => {
    form.setValue('amount_suffix', suffix);
  };

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: generateCouponCode(),
      amount: 100,
      amount_suffix: 'currency',
      expiry_date: undefined,
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
        // update context coupons
        addCoupon(response.coupon);
        handleUpdateCouponId(response.coupon.id);
        toast.success(response.message);
        form.reset(data); // Reset form with new values after successful save
        // close drawer
        onCreated();
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
          <div className="relative flex items-end gap-2.5">
            <div className="relative flex flex-1 grow flex-col items-start gap-2">
              <Label className="font-text-sm-leading-none-medium text-foreground relative mt-[-1.00px] self-stretch text-sm leading-none font-medium tracking-normal">
                {__('Coupon code', 'yay-reviews')}
              </Label>

              <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-2 self-stretch">
                <FormField
                  control={control}
                  name={`code`}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      placeholder={__('Placeholder', 'yay-reviews')}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
            </div>

            <Button
              onClick={(e) => {
                e.preventDefault();
                const code = generateCouponCode();
                if (code) {
                  form.setValue('code', code);
                }
              }}
            >
              {__('Generate', 'yay-reviews')}
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <span className="w-max">
            <Label htmlFor="amount" className="font-normal">
              <span>{__('Coupon amount', 'yay-reviews')}</span>
              <span className="text-[#D50719]">*</span>
            </Label>
          </span>
          <FormField
            control={control}
            name={`amount`}
            render={({ field: { value, onChange } }) => (
              <InputNumberWithSuffix
                name={`amount`}
                value={Number(value)}
                onChange={onChange}
                suffix={form.watch('amount_suffix')}
                onSuffixChange={onSuffixChange}
              />
            )}
          />
        </div>
        <div className="grid gap-2">
          <span className="w-max">
            <Label htmlFor="expiry_date" className="font-normal">
              {__('Expiry date', 'yay-reviews')}
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
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
