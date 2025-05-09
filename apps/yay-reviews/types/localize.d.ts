import type {
  AttributeSettings,
  ButtonCustomizeSettings,
  CollectionCustomizeSettings,
  SoldOutCustomizeSettings,
  SwatchCustomizeSettings,
} from './settings.type';

declare global {
  interface Window {
    yayReviews: {
      admin_url: string;
      admin_post_url: string;
      admin_product_attributes_url: string;
      ajaxurl: string;
      single_product_url: string;
      nonce: string;
      rest_url: string;
      rest_base: string;
      rest_nonce: string;
      i18n: Record;
      data_settings: SettingsFormData;
    };
    wp: AnyObject;
  }
}

export {};
