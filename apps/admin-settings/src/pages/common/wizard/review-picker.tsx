import { __ } from '@wordpress/i18n';

import { getImageUrl } from '@/lib/utils';
import { FormField, useFormContext } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { WizardContent } from '.';

export default function ReviewPickerStep() {
  const { control } = useFormContext();
  return (
    <WizardContent>
      <img
        src={getImageUrl('yayrev-review-picker-img.webp')}
        alt={__('Yay Reviews', 'yay-customer-reviews-woocommerce')}
        className="rounded-md"
      />
      <FormField
        control={control}
        name="review_type"
        render={({ field: { value, onChange } }) => (
          <RadioGroup value={value} onValueChange={onChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="default" />
              <Label htmlFor="default">{__('Rating only', 'yay-customer-reviews-woocommerce')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="media" id="media" />
              <Label htmlFor="media">{__('Review with media (recommended)', 'yay-customer-reviews-woocommerce')}</Label>
            </div>
          </RadioGroup>
        )}
      />
    </WizardContent>
  );
}
