import { toast } from 'sonner';

import { changeAddonStatus } from '@/lib/ajax';
import { SettingsFormData } from '@/lib/schema';
import { __ } from '@/lib/utils';
import { useFormContext } from '@/components/ui/form';

import AddonCard from '../AddonCard';

export default function DashboardTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { watch } = useFormContext<SettingsFormData>();
  const addons = watch('addons');

  const handleChangeAddonStatus = async (addon_id: string, status: string) => {
    try {
      const response = await changeAddonStatus(addon_id, status);
      if (!response.success) {
        toast.error(response.data.mess);
      }
    } catch (error) {
      console.error(error);
      toast.error(__('Something went wrong'));
    }
  };

  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="flex flex-col gap-4">
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
      <div className="flex flex-col gap-4">
        <div className="text-foreground text-xl font-semibold">{__('addon_settings')}</div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          {Object.entries(addons)
            .filter(([key, value]) => key !== 'optional_fields')
            .map(([key, value]) => (
              <AddonCard
                key={key}
                id={key}
                status={value}
                onClick={() => setActiveTab(key)}
                onChangeStatus={handleChangeAddonStatus}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
