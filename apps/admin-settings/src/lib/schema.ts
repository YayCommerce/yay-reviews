import { z } from 'zod';

const addonsSchema = z.object({
  reminder: z.boolean(),
  reward: z.boolean(),
});

const reviewsSchema = z.object({
  upload_media: z.boolean(),
  upload_required: z.boolean(),
  media_type: z.string(),
  max_upload_file_size: z.number(),
  max_upload_file_qty: z.number().or(z.string()),
  upload_file_label: z.string(),
  upload_file_description: z.string(),
  enable_gdpr: z.boolean(),
  gdpr_message: z.string(),
  before_message: z.string(),
});

const reminderSchema = z.object({
  send_after_value: z.number(),
  send_after_unit: z.string(),
  max_products: z.number().or(z.string()),
  products_type: z.string(),
});

const rewardSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  coupon_type: z.string(),
  coupon_id: z.string().optional(),
  coupon_value: z.number().optional(),
  coupon_value_suffix: z.string().optional(),
  send_to: z.string(),
  rating_requirement: z.string(),
  media_requirement: z.string(),
  frequency: z.string(),
  is_open: z.boolean().optional(),
});

const rewardsSchema = z.record(z.string(), rewardSchema);

const optionalFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  label: z.string(),
  description: z.string(),
  is_required: z.boolean(),
  type: z.string(),
  values: z.string(),
});

const optionalFieldsSchema = z.array(optionalFieldSchema);

const emailSchema = z.object({
  reminder: z.object({
    subject: z.string(),
    heading: z.string(),
    content: z.string(),
    footer: z.string(),
  }),
  reward: z.object({
    subject: z.string(),
    heading: z.string(),
    content: z.string(),
    footer: z.string(),
  }),
});

export const couponSchema = z.object({
  code: z.string().min(1, { message: 'Coupon code is required' }),
  amount: z.number(),
  amount_suffix: z.string(),
  expiry_date: z.date().optional(),
});

export const settingsSchema = z.object({
  addons: addonsSchema,
  reviews: reviewsSchema,
  reminder: reminderSchema,
  rewards: rewardsSchema,
  optional_fields: optionalFieldsSchema,
  email: emailSchema,
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

export type CouponFormData = z.infer<typeof couponSchema>;

export type Addons = z.infer<typeof addonsSchema>;
export type Reviews = z.infer<typeof reviewsSchema>;
export type Reminder = z.infer<typeof reminderSchema>;
export type Reward = z.infer<typeof rewardSchema>;
export type Rewards = z.infer<typeof rewardsSchema>;
export type OptionalField = z.infer<typeof optionalFieldSchema>;
export type OptionalFields = z.infer<typeof optionalFieldsSchema>;
export type Email = z.infer<typeof emailSchema>;
