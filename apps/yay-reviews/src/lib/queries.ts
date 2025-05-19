import { api } from './api';
import { SettingsFormData } from './schema';
import { ComboboxOption } from '../components/ui/combobox';

export async function postSettings(data: SettingsFormData) {
  const response = await api.post('settings', { json: data });
  return response.json();
}

export async function getProducts(search: string, limit: number) {
  const response = await api.get(`products`, {
    searchParams: {
      search,
      limit,
    },
  });
  return response.json() as Promise<ComboboxOption[]>;
}

export async function getCategories(search: string) {
  const response = await api.get(`categories`, {
    searchParams: {
      search,
    },
  });
  return response.json() as Promise<ComboboxOption[]>;
}

export async function getCoupons(search: string, limit: number) {
  const response = await api.get(`coupons`, {
    searchParams: {
      search,
      limit,
    },
  });
  return response.json() as Promise<ComboboxOption[]>;
}