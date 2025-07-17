import { Addon } from '@/pages/lite/dashboard';

import { Card, CardContent, CardFooter } from '@/components/ui/card';

import UpgradeBadge from '../pro/upgrade-badge';
import UpgradeLinkIcon from '../pro/upgrade-link-icon';

export default function UpgradeCard({ title, description, icon }: Addon) {
  return (
    <Card className="gap-0 p-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between px-0">
          <div className="flex h-8 w-8 items-center justify-center">{icon}</div>
          <UpgradeBadge />
        </div>
        <div className="pt-4">
          <div className="text-base font-semibold">{title}</div>
          <div className="text-muted-foreground text-sm">{description}</div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4 pt-4! h-full">
        <div></div>
        <UpgradeLinkIcon />
      </CardFooter>
    </Card>
  );
}
