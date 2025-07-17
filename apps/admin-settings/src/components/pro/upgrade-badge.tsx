import { __ } from '@wordpress/i18n';

import { Badge } from '@/components/ui/badge';

export default function UpgradeBadge() {
  return (
    <Badge variant="default" className="transition-none">
      {__('Pro only', 'yay-reviews')}
    </Badge>
  );
}
