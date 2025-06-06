import { SettingsFormData } from '../lib/schema';
import { ComboboxOption } from '../components/ui/combobox';
declare global {
  interface Window {
    yayReviews: {
      admin_url: string;
      admin_email: string;
      image_url: string;
      site_title: string;
      nonce: string;
      rest_url: string;
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
