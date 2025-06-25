import { z } from 'zod';

const addonsSchema = z.object({
  reminder: z.boolean(),
  reward: z.boolean(),
  optional_fields: z.boolean(),
  overview: z.boolean(),
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
  send_to: z.string(),
});

const rewardSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  coupon_id: z.string(),
  only_send_to_purchased_customers: z.boolean(),
  send_to_guests: z.boolean(),
  minimum_required_rating: z.number(),
  minimum_media_files_uploaded: z.number(),
  minimum_required_reviews_since_last_reward: z.number(),
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
  code: z.string().min(1, { message: "Coupon code is required" }),
  description: z.string(),
  discount_type: z.string(),
  amount: z.number(),
  free_shipping: z.boolean(),
  expiry_date: z.date().optional(),
  minimum_spend: z.number().optional(),
  maximum_spend: z.number().optional(),
  individual_use: z.boolean(),
  exclude_sale_items: z.boolean(),
  products: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })),
  exclude_products: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })),
  product_categories: z.array(z.object({
    value: z.number(),
    label: z.string(),
  })),
  exclude_product_categories: z.array(z.object({
    value: z.number(),
    label: z.string(),
  })),
  allowed_emails: z.string(),
  product_brands: z.array(z.object({
    value: z.number(),
    label: z.string(),
  })),
  exclude_product_brands: z.array(z.object({
    value: z.number(),
    label: z.string(),
  })),
  usage_limit_per_coupon: z.number().optional(),
  usage_limit_per_user: z.number().optional(),
  limit_usage_to_x_items: z.number().optional(),
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

