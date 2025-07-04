import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { toast } from 'sonner';

import { changeAddonStatus } from '@/lib/ajax';
import { SettingsFormData } from '@/lib/schema';
import { cn } from '@/lib/utils';
import useAppContext from '@/hooks/use-app-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useFormContext } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import SettingIcon from '@/components/icons/Setting';

export type Addon = {
  id: 'reminder' | 'reward';
  title: string;
  description: string;
  icon: React.ReactNode;
  settingsPath: string;
  enabled: boolean;
};

export default function AddonCard({ id, title, description, icon, enabled, settingsPath }: Addon) {
  const { changeTab } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);

  const { setValue } = useFormContext<SettingsFormData>();

  const handleChangeStatus = async () => {
    try {
      setIsLoading(true);
      const currentStatus = enabled ? 'active' : 'inactive';
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await changeAddonStatus(id, newStatus);
      if (!response.success) {
        toast.error(response.data.message);
      } else {
        setValue(`addons.${id}`, newStatus === 'active' ? true : false);
      }
    } catch (error) {
      toast.error(__('Something went wrong', 'yay-reviews'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="gap-0 p-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex h-8 w-8 items-center justify-center">{icon}</div>
          <Badge
            variant={enabled ? 'default' : 'outline'}
            className={cn('transition-none', enabled && 'bg-green-600')}
          >
            {enabled ? __('Active', 'yay-reviews') : __('Inactive', 'yay-reviews')}
          </Badge>
        </div>
        <CardHeader className="px-0 pt-4">
          <div className="text-base font-semibold">{title}</div>
          <div className="text-muted-foreground text-sm">{description}</div>
        </CardHeader>
      </CardContent>
      <CardContent className="flex items-center justify-between border-t p-4">
        <Button
          variant="outline"
          size="sm"
          disabled={!enabled}
          onClick={(e) => {
            e.preventDefault();
            changeTab(id);
          }}
          style={settingsPath ? {} : { opacity: 0, visibility: 'hidden' }}
        >
          <SettingIcon />
          {__('Settings', 'yay-reviews')}
        </Button>
        <Switch checked={enabled} onCheckedChange={handleChangeStatus} loading={isLoading} />
      </CardContent>
    </Card>
  );
}
