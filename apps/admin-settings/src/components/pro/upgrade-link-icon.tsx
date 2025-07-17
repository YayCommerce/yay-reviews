import { __ } from '@wordpress/i18n';
import { ExternalLinkIcon } from 'lucide-react';

import { __PRO_VERSION_URL__ } from '@/config/version';

export default function UpgradeLinkIcon() {
  return (
    <a href={__PRO_VERSION_URL__} target="_blank" className="text-foreground!">
      <ExternalLinkIcon size={20} />
    </a>
  );
}
