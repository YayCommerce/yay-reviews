import { useState } from 'react';
import { Addon } from '@/pages/lite/dashboard';
import { __ } from '@wordpress/i18n';
import { toast } from 'sonner';

import { changeAddonStatus } from '@/lib/ajax';
import { SettingsFormData } from '@/lib/schema';
import { cn } from '@/lib/utils';
import useAppContext from '@/hooks/use-app-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useFormContext } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import SettingIcon from '@/components/icons/Setting';

export default function NormalCard({ id, title, description, icon, enabled, settingsPath }: Addon) {
  const { changeTab } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);

  const { setValue } = useFormContext<SettingsFormData>();

  const handleChangeStatus = async () => {
    try {
      toast.dismiss();
      setIsLoading(true);
      const currentStatus = enabled ? 'active' : 'inactive';
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await changeAddonStatus(`${id}_enabled`, newStatus);
      if (!response.success) {
        toast.error(response.data.message);
      } else {
        setValue(`addons.${id}_enabled`, newStatus === 'active' ? true : false);
        toast.success(
          __('Addon ', 'yay-customer-reviews-woocommerce') +
            title +
            ': ' +
            (newStatus === 'active' ? __('ON', 'yay-customer-reviews-woocommerce') : __('OFF', 'yay-customer-reviews-woocommerce')),
        );
      }
    } catch (error) {
      toast.error(__('Something went wrong', 'yay-customer-reviews-woocommerce'));
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
            {enabled ? __('Active', 'yay-customer-reviews-woocommerce') : __('Inactive', 'yay-customer-reviews-woocommerce')}
          </Badge>
        </div>
        <div className="pt-4">
          <div className="text-base font-semibold">{title}</div>
          <div className="text-muted-foreground text-sm">{description}</div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4 pt-4!">
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
          {__('Settings', 'yay-customer-reviews-woocommerce')}
        </Button>
        <Switch checked={enabled} onCheckedChange={handleChangeStatus} loading={isLoading} />
      </CardFooter>
    </Card>
  );
}
