import { __ } from '@wordpress/i18n';

import { __IS_PRO__ } from '@/config/version';
import { getImageUrl } from '@/lib/utils';
import { FormField, useFormContext } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { WizardContent } from '.';

const requestReviewTimingOptions = [
  {
    value: '3',
    label: __('3 days', 'yay-customer-reviews-woocommerce') + (!__IS_PRO__ ? ' (Pro)' : ''),
    disabled: !__IS_PRO__,
  },
  {
    value: '5',
    label: __('5 days', 'yay-customer-reviews-woocommerce'),
  },
  {
    value: '7',
    label: __('7 days', 'yay-customer-reviews-woocommerce') + (!__IS_PRO__ ? ' (Pro)' : ''),
    disabled: !__IS_PRO__,
  },
  {
    value: '14',
    label: __('14 days', 'yay-customer-reviews-woocommerce') + (!__IS_PRO__ ? ' (Pro)' : ''),
    disabled: !__IS_PRO__,
  },
];

export default function RequestReviewStep() {
  const { control } = useFormContext();
  return (
    <WizardContent>
      <img
        src={getImageUrl('yayrev-request-img.webp')}
        alt={__('Yay Reviews', 'yay-customer-reviews-woocommerce')}
        className="rounded-md"
      />
      <div className="flex flex-col gap-2">
        <div className="text-foreground font-medium">
          {__('Send request to customers', 'yay-customer-reviews-woocommerce')}
        </div>
        <div className="flex items-center gap-2">
          <FormField
            control={control}
            name="request_review_timing"
            render={({ field: { value, onChange } }) => (
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder={__('Select timing', 'yay-customer-reviews-woocommerce')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {requestReviewTimingOptions.map((option) => (
                      <SelectItem value={option.value} disabled={option.disabled}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />

          <div>{__('after order completed', 'yay-customer-reviews-woocommerce')}</div>
        </div>
      </div>
    </WizardContent>
  );
}
