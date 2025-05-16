import { SettingsFormData } from '../lib/schema';
declare global {
  interface Window {
    yayReviews: {
      admin_url: string;
      image_url: string;
      admin_post_url: string;
      admin_product_attributes_url: string;
      ajaxurl: string;
      single_product_url: string;
      nonce: string;
      rest_url: string;
      rest_base: string;
      rest_nonce: string;
      i18n: Record<string, string>;
      data_settings: SettingsFormData;
      upload_max_size: number;
      upload_max_qty: number;
    };
    wp: AnyObject;
  }
}

export {};
