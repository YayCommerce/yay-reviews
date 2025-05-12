import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// import { SettingsFormData } from './schema';

export const usePro = true;

export { type ClassValue, clsx } from 'clsx';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const __ = (text: string): string => {
  const translations = window.yayReviews.i18n || {};
  return translations[text] || text;
};

// export const getSettings = (): SettingsFormData => {
//   return window.yayReviews.data_settings;
// };
