import { __ } from '@/lib/utils';

import SettingIcon from './icons/Setting';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';

export default function AddonCard({
  icon,
  title,
  description,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'active' | 'inactive';
}) {
  return (
    <Card className="pt-6 pb-4">
      <CardHeader className="p-0">
        <CardTitle className="px-6">{icon}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col gap-2">
          <div className="px-6 text-base font-semibold">{title}</div>
          <div className="px-6 pb-4 text-sm font-normal">{description}</div>
          <div className="border-border flex items-center justify-between border-t px-6 pt-4">
            <Button variant="outline" size="sm" className="gap-2" disabled={status === 'inactive'}>
              <SettingIcon fill="currentColor" strokeWidth={1.5} />
              {__('settings')}
            </Button>
            <Switch checked={status === 'active'} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
