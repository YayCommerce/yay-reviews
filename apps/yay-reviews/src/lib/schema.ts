import { z } from 'zod';

const addonsSchema = z.array(
    z.object({
      id: z.string(),
      status: z.string(),
    }),
  );


export const settingsSchema = z.object({
  addons: addonsSchema,
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

export type Addons = z.infer<typeof addonsSchema>;

