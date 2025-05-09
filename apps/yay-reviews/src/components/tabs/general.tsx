import { __ } from '@/lib/utils';

import { Input } from '../ui/input';

export default function GeneralTab() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{__('general')}</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="general-title">{__('title')}</label>
          <Input id="general-title" />
        </div>
      </div>
    </div>
  );
}
