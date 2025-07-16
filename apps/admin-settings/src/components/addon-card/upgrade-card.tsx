import { Addon } from '@/pages/lite/dashboard';
import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import SettingIcon from '@/components/icons/Setting';

const opacity = 'opacity-30';

export default function UpgradeCard({ title, description, icon }: Addon) {
  return (
    <Card className="gap-0 p-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between px-0">
          <div className={cn('flex h-8 w-8 items-center justify-center', opacity)}>{icon}</div>
          <Badge variant="default" className="transition-none">
            {__('Pro only', 'yay-reviews')}
          </Badge>
        </div>
        <div className={cn('pt-4', opacity)}>
          <div className="text-base font-semibold">{title}</div>
          <div className="text-muted-foreground text-sm">{description}</div>
        </div>
      </CardContent>
      <CardFooter className={cn('flex items-center justify-between border-t p-4 pt-4!', opacity)}>
        <Button variant="outline" size="sm" disabled>
          <SettingIcon />
          {__('Settings', 'yay-reviews')}
        </Button>
        <Switch disabled />
      </CardFooter>
    </Card>
  );
}
