import { __ } from '@wordpress/i18n';
import { toast } from 'sonner';

import { changeAddonStatus } from '@/lib/ajax';
import { SettingsFormData } from '@/lib/schema';
import { useFormContext } from '@/components/ui/form';

import AddonCard from '../AddonCard';

export default function DashboardTab({
  defaultValues,
  setDefaultValues,
  setActiveTab,
}: {
  defaultValues: SettingsFormData;
  setDefaultValues: (values: SettingsFormData) => void;
  setActiveTab: (tab: string) => void;
}) {
  const { watch, setValue } = useFormContext<SettingsFormData>();
  const addons = watch('addons');

  const handleChangeAddonStatus = async (
    addon_id: 'reminder' | 'reward' | 'optional_fields',
    status: string,
  ) => {
    try {
      const response = await changeAddonStatus(addon_id, status);
      if (!response.success) {
        toast.error(response.data.message);
      } else {
        setValue(`addons.${addon_id}`, status === 'active' ? true : false);
        setDefaultValues({
          ...defaultValues,
          addons: { ...defaultValues.addons, [addon_id]: status === 'active' ? true : false },
        });
      }
    } catch (error) {
      toast.error(__('Something went wrong', 'yay-reviews'));
    }
  };

  return (
    <div className="flex w-[1100px] max-w-[90%] flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="text-foreground text-3xl font-bold">
          {__('Welcome to Yay Reviews', 'yay-reviews')}
        </div>
        <div className="text-base leading-relaxed text-slate-600">
          <span>
            {__(
              'Your central hub for managing review forms, reminders, and coupons, providing an intuitive interface to monitor and optimize customer feedback.',
              'yay-reviews',
            )}
          </span>
          <br />
          <span>{__('Go to', 'yay-reviews')} </span>
          <span
            className="cursor-pointer lowercase underline decoration-solid"
            onClick={() => setActiveTab('review')}
          >
            {__('Review Settings', 'yay-reviews')}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-foreground text-xl font-semibold">
          {__('Addon Settings', 'yay-reviews')}
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          {Object.entries(addons)
            .filter(([key, value]) => key !== 'optional_fields')
            .map(([key, value]) => (
              <AddonCard
                key={key}
                id={key as 'reminder' | 'reward' | 'optional_fields'}
                status={value as boolean}
                onClick={() => setActiveTab(key)}
                onChangeStatus={handleChangeAddonStatus}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
