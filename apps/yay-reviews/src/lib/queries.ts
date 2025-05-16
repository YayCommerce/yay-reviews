import { api } from './api';
import { SettingsFormData } from './schema';

// export type ProductInfo = {
//   ID: number;
//   post_title: string;
//   view_url: string;
//   image_url: string;
// };

// export type AffectedProducts = {
//   affectedProductsQuantity: number;
//   listAffectedProducts: ProductInfo[];
// };

// export type PreloadAffectedProducts = {
//   [key: string]: AffectedProducts;
// };

export async function postSettings(data: SettingsFormData) {
  const response = await api.post('settings', { json: data });
  return response.json();
}

// export async function getPreloadAffectedProducts() {
//   const response = await api.get('affected-products/preload');
//   return response.json() as Promise<PreloadAffectedProducts>;
// }

// export async function getAffectedProducts(attrName: string, pageNo: number) {
//   const response = await api.get(`affected-products/${attrName}/${pageNo}`);
//   return response.json() as Promise<AffectedProducts>;
// }
