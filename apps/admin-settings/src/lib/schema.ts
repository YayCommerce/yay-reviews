import { z } from 'zod';

const addonsSchema = z.object({
  reminder_enabled: z.boolean().or(z.null()),
  reward_enabled: z.boolean().or(z.null()),
});

const reviewsSchema = z.object({
  enable_media_upload: z.boolean(),
  require_media_upload: z.boolean(),
  allowed_media_types: z.string(),
  max_upload_filesize: z.number(),
  max_upload_files: z.number().or(z.string()),
  media_upload_label: z.string(),
  media_upload_description: z.string(),
  enable_gdpr_consent: z.boolean(),
  gdpr_consent_message: z.string(),
  pre_gdpr_message: z.string(),
});

const reminderSchema = z.object({
  delay_amount: z.number(),
  delay_unit: z.string(),
  max_products_per_email: z.number().or(z.string()),
  product_scope: z.string(),
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
    subject: z.string().optional(),
    heading: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  reward: z.object({
    subject: z.string().optional(),
    heading: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
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
