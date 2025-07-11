import { api } from './api';
import { CouponFormData, SettingsFormData } from './schema';
import { Coupon } from 'types/coupon';
import { EmailQueue } from 'types/email-queue';

export async function postSettings(data: SettingsFormData) {
  const response = await api.post('settings', { json: data });
  return response.json();
}

export async function postCoupon(data: CouponFormData) {
  const response = await api.post('coupons', { json: data });
  return response.json() as Promise<{
    is_exists: boolean;
    coupon: Coupon | null;
    message: string;
  }>;
}

export async function sendTestMail(
  email: string,
  subject: string,
  heading: string,
  content: string,
) {
  const response = await api.post('send-test-mail', {
    json: {
      email,
      subject,
      heading,
      content,
    },
  });
  return response.json();
}

export async function getEmailsQueue(page: number = 1, perPage: number = 10) {
  const response = await api.get('emails-queue', {
    searchParams: {
      page,
      per_page: perPage,
    },
  });
  return response.json() as Promise<{
    emails: EmailQueue[];
    pagination: {
      current_page: number;
      per_page: number;
      total_items: number;
      total_pages: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  }>;
}
