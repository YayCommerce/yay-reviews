import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SettingsFormData } from './schema';

export { type ClassValue, clsx } from 'clsx';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSettings = (): SettingsFormData => {
  let settings = window.yayReviews.data_settings;
  if (settings.rewards.length === 0) {
    settings.rewards = {};
  }
  return settings;
};

export const getEmailSampleValues = (): Record<string, string> => {
  return window.yayReviews.sample_values;
};

const jQuery = window.jQuery;

export const updateEmailPreview = (
  content: string,
  type: 'heading' | 'content',
  templateId: string,
) => {
  if (templateId === '') return;
  const previewEmail = jQuery('#yay-reviews-email-preview-iframe');
  if (!previewEmail) return;
  if (type === 'heading') {
    previewEmail.contents().find('#header_wrapper h1').html(content);
  } else if (type === 'content') {
    const defaultSampleValues = getEmailSampleValues();
    let sampleValues: Record<string, string> = {};
    if (templateId === 'reward') {
      sampleValues = {
        ...defaultSampleValues,
        '{review_products}': '{review_products}',
        '{site_title}': window.yayReviews.site_title,
      };
    }
    if (templateId === 'reminder') {
      sampleValues = {
        ...defaultSampleValues,
        '{coupon_code}': '{coupon_code}',
        '{product_name}': '{product_name}',
        '{site_title}': window.yayReviews.site_title,
      };
    }
    content = content
      .replace(/\{customer_name\}/g, sampleValues['{customer_name}'])
      .replace(/\{site_title\}/g, sampleValues['{site_title}'])
      .replace(/\{review_products\}/g, sampleValues['{review_products}'])
      .replace(/\{coupon_code\}/g, sampleValues['{coupon_code}'])
      .replace(/\{product_name\}/g, sampleValues['{product_name}']);
    previewEmail.contents().find('#body_content_inner .email-introduction').html(content);
  }
};
