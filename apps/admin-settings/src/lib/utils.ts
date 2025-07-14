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

export const getSampleEmailPlaceholders = (type: 'reminder' | 'reward') => {
  return (
    window.yayReviews.sample_email_placeholders[type] ??
    window.yayReviews.sample_email_placeholders['reminder']
  );
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
    let samplePlaceholders = getSampleEmailPlaceholders(templateId as 'reminder' | 'reward') as any;

    content = content
      .replace(/\{customer_name\}/g, samplePlaceholders['{customer_name}'] ?? '')
      .replace(/\{site_title\}/g, samplePlaceholders['{site_title}'] ?? '')
      .replace(/\{review_products\}/g, samplePlaceholders['{review_products}'] ?? '')
      .replace(/\{coupon_code\}/g, samplePlaceholders['{coupon_code}'] ?? '')
      .replace(/\{product_name\}/g, samplePlaceholders['{product_name}'] ?? '');
    previewEmail.contents().find('#body_content_inner .email-introduction').html(content);
  }
};
