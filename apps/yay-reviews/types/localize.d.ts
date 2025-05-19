import { SettingsFormData } from '../lib/schema';
import { ComboboxOption } from '../components/ui/combobox';
declare global {
  interface Window {
    yayReviews: {
      admin_url: string;
      image_url: string;
      admin_post_url: string;
      ajaxurl: string;
      site_title: string;
      nonce: string;
      rest_url: string;
      rest_base: string;
      rest_nonce: string;
      i18n: Record<string, string>;
      data_settings: SettingsFormData;
      upload_max_size: number;
      upload_max_qty: number;
      user_roles: ComboboxOption[];
    };
    wp: AnyObject;
  }
}

export {};
