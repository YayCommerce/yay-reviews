import jQuery from '@types/jquery';

import { SettingsFormData } from '../lib/schema';
import { ComboboxOption } from '../src/components/ui/combobox';
import { Coupon } from './coupon';

declare global {
  interface Window {
    jQuery: typeof jQuery;
    yayReviews: {
      admin_url: string;
      admin_email: string;
      image_url: string;
      site_title: string;
      nonce: string;
      rest_url: string;
      ajax_url: string;
      rest_base: string;
      rest_nonce: string;
      data_settings: SettingsFormData;
      upload_max_size: number;
      sample_values: Record<string, string>;
      coupon_types: Record<string, string>;
      product_categories: ComboboxOption[];
      product_brands: ComboboxOption[];
      wc_email_settings: Record<string, string>;
      default_email_templates: Record<string, Record<string, string>>;
      coupons: Coupon[];
    };
    wp: AnyObject;
    tinymce: any;
  }
}

export {};
