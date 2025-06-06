import { SettingsFormData } from '../lib/schema';
import jQuery from '@types/jquery';
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
      i18n: Record<string, string>;
      data_settings: SettingsFormData;
      upload_max_size: number;
      upload_max_qty: number;
      sample_values: Record<string, string>;
    };
    wp: AnyObject;
  }
}

export {};
