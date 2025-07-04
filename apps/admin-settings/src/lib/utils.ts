import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SettingsFormData } from './schema';
import { QueryClient } from '@tanstack/react-query';

export const usePro = true;

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
