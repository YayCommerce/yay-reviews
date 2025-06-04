import { api } from './api';
import { SettingsFormData } from './schema';
import { Coupon } from 'types/coupon';

export async function postSettings(data: SettingsFormData) {
  const response = await api.post('settings', { json: data });
  return response.json();
}

export async function getCoupons(search: string, limit: number) {
  const response = await api.get(`coupons`, {
    searchParams: {
      search,
      limit,
    },
  });
  return response.json() as Promise<Coupon[]>;
}