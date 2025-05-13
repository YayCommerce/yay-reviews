import { __ } from '@/lib/utils';

import AddonCard from '../AddonCard';
import OptionalFieldsIcon from '../icons/Note';
import ReminderIcon from '../icons/Reminder';
import ReviewRewardIcon from '../icons/Review';

export default function DashboardTab() {
  const handleClick = () => {
    const reviewTab = document.querySelector('[data-value="review"]') as HTMLElement;
    console.log(reviewTab);
    if (reviewTab) {
      reviewTab.click();
    }
  };

  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="flex flex-col gap-4 p-8">
        <div className="text-foreground text-3xl font-bold">{__('welcome_to_yay_reviews')}</div>
        <div className="text-base leading-relaxed text-slate-600">
          <span>{__('welcome_to_yay_reviews_description')}</span>
          <br />
          <span>{__('Go to')} </span>
          <span className="cursor-pointer lowercase underline decoration-solid">
            {__('review_settings')}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-8">
        <div className="text-foreground text-xl font-semibold">{__('addon_settings')}</div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          <AddonCard
            icon={<ReminderIcon size={30} strokeWidth={2} />}
            title={__('reminder')}
            description={__('addon_reminder_description')}
            status="active"
          />
          <AddonCard
            icon={<ReviewRewardIcon size={30} strokeWidth={2} />}
            title={__('review_reward')}
            description={__('addon_review_reward_description')}
            status="inactive"
          />
          <AddonCard
            icon={<OptionalFieldsIcon size={30} strokeWidth={2} />}
            title={__('optional_fields')}
            description={__('addon_optional_fields_description')}
            status="active"
          />
        </div>
      </div>
    </div>
  );
}
