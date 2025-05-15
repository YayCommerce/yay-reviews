import { SettingsFormData } from '@/lib/schema';
import { __ } from '@/lib/utils';
import { useFormContext } from '@/components/ui/form';

import AddonCard from '../AddonCard';

export default function DashboardTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { watch } = useFormContext<SettingsFormData>();
  const addons = watch('addons');

  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="flex flex-col gap-4 p-8">
        <div className="text-foreground text-3xl font-bold">{__('welcome_to_yay_reviews')}</div>
        <div className="text-base leading-relaxed text-slate-600">
          <span>{__('welcome_to_yay_reviews_description')}</span>
          <br />
          <span>{__('Go to')} </span>
          <span
            className="cursor-pointer lowercase underline decoration-solid"
            onClick={() => setActiveTab('review')}
          >
            {__('review_settings')}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-8">
        <div className="text-foreground text-xl font-semibold">{__('addon_settings')}</div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          {addons.map((addon, index) => (
            <AddonCard
              key={index}
              id={addon.id}
              index={index}
              status={addon.status as 'active' | 'inactive'}
              onClick={() => setActiveTab(addon.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
