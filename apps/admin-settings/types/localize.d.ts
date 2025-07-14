import jQuery from '@types/jquery';

import { SettingsFormData } from '../lib/schema';
import { Coupon } from './coupon';

declare global {
  interface Window {
    jQuery: typeof jQuery;
    yayReviews: {
      admin_url: string;
      currency_symbol: string;
      admin_email: string;
      wc_settings_url: string;
      wc_reviews_settings: Record<string, boolean>;
      image_url: string;
      site_title: string;
      nonce: string;
      rest_url: string;
      ajax_url: string;
      rest_base: string;
      rest_nonce: string;
      data_settings: SettingsFormData;
      upload_max_filesize: number;
      sample_email_placeholders: {
        reminder: Record<string, Record<string, string>>;
        reward: Record<string, Record<string, string>>;
      };
      wc_email_settings: Record<string, string>;
      default_email_templates: Record<string, Record<string, string>>;
      coupons: Coupon[];
    };
    wp: AnyObject;
    tinymce: any;
  }
}

export {};
