import { useMemo } from 'react';

import { SettingsFormData } from '@/lib/schema';
import { __ } from '@/lib/utils';

import GiftIcon from './icons/Gift';
import NoteIcon from './icons/Note';
import ReminderIcon from './icons/Reminder';
import SettingIcon from './icons/Setting';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FormField, useFormContext } from './ui/form';
import { Switch } from './ui/switch';

export default function AddonCard({
  id,
  index,
  status,
  onClick,
}: {
  id: string;
  index: number;
  status: string;
  onClick: (id: string) => void;
}) {
  const { control } = useFormContext<SettingsFormData>();
  const icon = useMemo(() => {
    switch (id) {
      case 'reminder':
        return <ReminderIcon size={30} />;
      case 'reward':
        return <GiftIcon size={30} />;
      case 'optional-fields':
        return <NoteIcon size={30} />;
    }
  }, [id]);

  const title = useMemo(() => {
    switch (id) {
      case 'reminder':
        return __('reminder');
      case 'reward':
        return __('review_reward');
      case 'optional-fields':
        return __('optional_fields');
    }
  }, [id]);

  const description = useMemo(() => {
    switch (id) {
      case 'reminder':
        return __('addon_reminder_description');
      case 'reward':
        return __('addon_review_reward_description');
      case 'optional-fields':
        return __('addon_optional_fields_description');
    }
  }, [id]);

  return (
    <Card className="gap-2 pt-6 pb-4">
      <CardHeader className="p-0">
        <CardTitle className="px-6">{icon}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col gap-2">
          <div className="px-6 text-base font-semibold">{title}</div>
          <div className="px-6 pb-4 text-sm font-normal">{description}</div>
          <div className="border-border flex items-center justify-between border-t px-6 pt-4">
            <Button
              variant="outline"
              className="gap-2"
              disabled={status === 'inactive'}
              onClick={(e) => {
                e.preventDefault();
                onClick(id);
              }}
            >
              <SettingIcon />
              {__('settings')}
            </Button>
            <FormField
              control={control}
              name={`addons.${index}.status`}
              render={({ field }) => (
                <Switch
                  checked={field.value === 'active'}
                  onCheckedChange={() =>
                    field.onChange(field.value === 'active' ? 'inactive' : 'active')
                  }
                />
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
