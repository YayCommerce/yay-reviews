import type {
  AttributeSettings,
  ButtonCustomizeSettings,
  CollectionCustomizeSettings,
  SoldOutCustomizeSettings,
  SwatchCustomizeSettings,
} from "./settings.type";

declare global {
  interface Window {
    yaySwatches: {
      admin_url: string;
      admin_post_url: string;
      admin_product_attributes_url: string;
      ajaxurl: string;
      single_product_url: string;
      nonce: string;
      rest_url: string;
      rest_base: string;
      rest_nonce: string;
      i18n: Record<string, string>;
      data_settings: {
        attributes_custom_data: AttributeSettings;
        swatch_customize_settings: SwatchCustomizeSettings;
        button_customize_settings: ButtonCustomizeSettings;
        sold_out_customize_settings: SoldOutCustomizeSettings;
        collection_customize_settings: CollectionCustomizeSettings;
      };
    };
    wp: AnyObject;
  }
}

export {};
