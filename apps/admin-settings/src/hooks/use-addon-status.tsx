import { useFormContext } from 'react-hook-form';

import { __IS_PRO__ } from '@/config/version';

export default function useAddonStatus() {
  const { watch } = useFormContext();

  const isRewardEnabled = __IS_PRO__ && watch('addons.reward_enabled');
  const isReminderEnabled = watch('addons.reminder_enabled');

  return {
    isRewardEnabled,
    isReminderEnabled,
  };
}
