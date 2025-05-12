import { __ } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function DashboardTab() {
  const handleClick = () => {
    const reviewTab = document.querySelector('[data-value="review"]') as HTMLElement;
    console.log(reviewTab);
    if (reviewTab) {
      reviewTab.click();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-3xl font-semibold">{__('welcome_to_yay_reviews')}</div>
      <div className="text-md text-gray-500">{__('welcome_to_yay_reviews_description')}</div>
      <div className="text-md text-gray-500">
        <span>{__('Go to')} </span>
        <span className="underline decoration-solid" onClick={handleClick}>
          <a className="" href="#">
            {__('review_settings')}
          </a>
        </span>
      </div>
    </div>
  );
}
