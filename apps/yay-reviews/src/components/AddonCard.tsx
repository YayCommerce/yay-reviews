import { useMemo, useState } from 'react';

import { SettingsFormData } from '@/lib/schema';
import { __, cn } from '@/lib/utils';

import GiftIcon from './icons/Gift';
import NoteIcon from './icons/Note';
import ReminderIcon from './icons/Reminder';
import SettingIcon from './icons/Setting';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FormField, useFormContext } from './ui/form';
import { Switch } from './ui/switch';

export default function AddonCard({
  id,
  status,
  onClick,
  onChangeStatus,
}: {
  id: 'reminder' | 'reward' | 'optional_fields';
  status: boolean;
  onClick: (id: string) => void;
  onChangeStatus: (addon_id: 'reminder' | 'reward' | 'optional_fields', status: string) => void;
}) {
  const { control, watch } = useFormContext<SettingsFormData>();
  const [isLoading, setIsLoading] = useState(false);

  const nameAddon = useMemo(() => {
    switch (id) {
      case 'reminder':
        return 'addons.reminder';
      case 'reward':
        return 'addons.reward';
      case 'optional_fields':
        return 'addons.optional_fields';
      default:
        return 'addons.reminder';
    }
  }, [id]);

  const value = watch(nameAddon);

  const icon = useMemo(() => {
    switch (id) {
      case 'reminder':
        return <ReminderIcon size={30} />;
      case 'reward':
        return <GiftIcon size={30} />;
      case 'optional_fields':
        return <NoteIcon size={30} />;
    }
  }, [id]);

  const title = useMemo(() => {
    switch (id) {
      case 'reminder':
        return __('reminder');
      case 'reward':
        return __('review_reward');
      case 'optional_fields':
        return __('optional_fields');
    }
  }, [id]);

  const description = useMemo(() => {
    switch (id) {
      case 'reminder':
        return __('addon_reminder_description');
      case 'reward':
        return __('addon_review_reward_description');
      case 'optional_fields':
        return __('addon_optional_fields_description');
    }
  }, [id]);

  const handleStatusChange = async () => {
    setIsLoading(true);
    try {
      await onChangeStatus(id, !value ? 'active' : 'inactive');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="gap-2 pt-6 pb-4">
      <CardHeader className="p-0">
        <CardTitle className="px-6">
          <div className="flex items-center justify-between">
            {icon}
            <Badge
              variant={status ? 'default' : 'outline'}
              className={cn('text-xs transition-none', status && 'bg-green-600')}
            >
              {status ? __('active') : __('inactive')}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col gap-2">
          <div className="px-6 text-base font-semibold">{title}</div>
          <div className="px-6 pb-4 text-sm font-normal">{description}</div>
          <div className="border-border flex items-center justify-between border-t px-6 pt-4">
            <Button
              variant="outline"
              className="cursor-pointer gap-2"
              disabled={!status}
              onClick={(e) => {
                e.preventDefault();
                onClick(id);
              }}
            >
              <SettingIcon />
              {__('settings')}
            </Button>
            <div className="relative">
              <Switch
                className="cursor-pointer"
                checked={Boolean(value)}
                disabled={isLoading}
                loading={isLoading}
                onCheckedChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
