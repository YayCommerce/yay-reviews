import { z } from 'zod';

const addonsSchema = z.object({
  reminder: z.boolean(),
  reward: z.boolean(),
  optional_fields: z.boolean(),
});

const reviewsSchema = z.object({
  upload_media: z.boolean(),
  upload_required: z.boolean(),
  media_type: z.string(),
  max_upload_file_size: z.number(),
  max_upload_file_qty: z.number(),
  upload_file_label: z.string(),
  upload_file_description: z.string(),
  enable_gdpr: z.boolean(),
  gdpr_message: z.string(),
  before_message: z.string(),
  after_message: z.string(),
});

const reminderSchema = z.object({
  send_after_value: z.number(),
  send_after_unit: z.string(),
  except_emails: z.string(),
  max_products: z.number(),
  products_type: z.string(),
  send_to_guests: z.boolean(),
});

const rewardSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  coupon_id: z.string(),
  only_send_to_purchased_customers: z.boolean(),
  send_to_guests: z.boolean(),
  minimum_rating: z.number(),
  minimum_upload_file_qty: z.number(),
  minimum_required_reviews: z.number(),
  minimum_required_reviews_since_last_reward: z.number(),
});

const rewardsSchema = z.array(rewardSchema);

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

export const settingsSchema = z.object({
  addons: addonsSchema,
  reviews: reviewsSchema,
  reminder: reminderSchema,
  rewards: rewardsSchema,
  optional_fields: optionalFieldsSchema,
  email: emailSchema,
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

export type Addons = z.infer<typeof addonsSchema>;
export type Reviews = z.infer<typeof reviewsSchema>;
export type Reminder = z.infer<typeof reminderSchema>;
export type Reward = z.infer<typeof rewardSchema>;
export type Rewards = z.infer<typeof rewardsSchema>;
export type OptionalField = z.infer<typeof optionalFieldSchema>;
export type OptionalFields = z.infer<typeof optionalFieldsSchema>;
export type Email = z.infer<typeof emailSchema>;

