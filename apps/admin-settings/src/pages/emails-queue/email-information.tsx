import { useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Loader2Icon } from 'lucide-react';
import { EmailQueue } from 'types/email-queue';

import { Button } from '@/components/ui/button';

export default function EmailInformation({
  email,
  isSending,
  onDismiss,
  onSend,
}: {
  email: EmailQueue | null;
  isSending: boolean;
  onDismiss: (emailId: string) => void;
  onSend: (emailId: string) => void;
}) {
  if (!email) {
    return null;
  }

  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);

  const productType = useMemo(() => {
    switch (email.email_data?.products_type) {
      case 'normal':
        return __('Normal products', 'yay-reviews');
      case 'featured':
        return __('Featured products', 'yay-reviews');
      case 'on_sale':
        return __('On sale products', 'yay-reviews');
      case 'newest':
        return __('Newest products', 'yay-reviews');
      case 'high_rated':
        return __('High rated products', 'yay-reviews');
      case 'low_rated':
        return __('Low rated products', 'yay-reviews');
      case 'best_selling':
        return __('Best selling products', 'yay-reviews');
      default:
        return __('All products', 'yay-reviews');
    }
  }, [email.email_data?.products_type]);

  const ratingRequirement = useMemo(() => {
    switch (email.email_data?.rating_requirement) {
      case 'none':
        return __('Review with any rating', 'yay-reviews');
      case 'at_least_3_stars':
        return __('Review with 3+ stars', 'yay-reviews');
      case 'at_least_4_stars':
        return __('Review with 4+ stars', 'yay-reviews');
      case 'at_least_5_stars':
        return __('5-star review', 'yay-reviews');
      default:
        return __('Review with any rating', 'yay-reviews');
    }
  }, [email.email_data?.rating_requirement]);

  const mediaRequirement = useMemo(() => {
    switch (email.email_data?.media_requirement) {
      case 'none':
        return __('Review with any media', 'yay-reviews');
      case 'at_least_2_media':
        return __('Review contains at least 2 media files', 'yay-reviews');
      case 'at_least_3_media':
        return __('Review contains at least 3 media files', 'yay-reviews');
      default:
        return __('Review with any media', 'yay-reviews');
    }
  }, [email.email_data?.media_requirement]);

  const minimumRequiredReviewsSinceLastReward = useMemo(() => {
    switch (email.email_data?.minimum_required_reviews_since_last_reward) {
      case 'none':
        return __('Reward after every review', 'yay-reviews');
      case 'at_least_2_reviews':
        return __('Reward after at least 2 reviews', 'yay-reviews');
      case 'at_least_3_reviews':
        return __('Reward after at least 3 reviews', 'yay-reviews');
      default:
        return __('Reward after every review', 'yay-reviews');
    }
  }, [email.email_data?.minimum_required_reviews_since_last_reward]);

  return (
    <div className="space-y-6">
      {/* Section: Recipient Info */}
      <div>
        <h3 className="mb-2 border-b pb-1 text-base font-semibold">
          {__('Recipient', 'yay-reviews')}
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          <dt className="text-sm font-semibold">{__('Type', 'yay-reviews')}:</dt>
          <dd className="text-sm capitalize">{email.type}</dd>
          <dt className="text-sm font-semibold">{__('To', 'yay-reviews')}:</dt>
          <dd className="text-sm">{email.customer_email}</dd>
          <dt className="text-sm font-semibold">{__('Status', 'yay-reviews')}:</dt>
          <dd className="text-sm capitalize">
            {email.status === '0'
              ? __('Pending', 'yay-reviews')
              : email.status === '1'
                ? __('Sent', 'yay-reviews')
                : __('Cancelled', 'yay-reviews')}
          </dd>
        </dl>
      </div>

      {/* Section: Reward Details */}
      {email.type === 'reward' && (
        <div>
          <h3 className="mb-2 border-b pb-1 text-base font-semibold">
            {__('Reward Details', 'yay-reviews')}
          </h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <dt className="text-sm font-semibold">{__('Coupon', 'yay-reviews')}:</dt>
            <dd className="text-sm">{email.email_data?.coupon_code}</dd>
            <dt className="text-sm font-semibold">{__('Product review', 'yay-reviews')}:</dt>
            <dd className="text-sm">{email.email_data?.product_name}</dd>
            <dt className="text-sm font-semibold">{__('Rating requirement', 'yay-reviews')}:</dt>
            <dd className="text-sm">{ratingRequirement}</dd>
            <dt className="text-sm font-semibold">{__('Media requirement', 'yay-reviews')}:</dt>
            <dd className="text-sm">{mediaRequirement}</dd>
            <dt className="text-sm font-semibold">{__('Reviews requirement', 'yay-reviews')}:</dt>
            <dd className="text-sm">{minimumRequiredReviewsSinceLastReward}</dd>
          </dl>
        </div>
      )}

      {/* Section: Reminder Details */}
      {email.type === 'reminder' && (
        <div>
          <h3 className="mb-2 border-b pb-1 text-base font-semibold">
            {__('Reminder Details', 'yay-reviews')}
          </h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <dt className="text-sm font-semibold">{__('Sent after', 'yay-reviews')}:</dt>
            <dd className="text-sm">
              {email.email_data?.send_after_value} {email.email_data?.send_after_unit}
            </dd>
            <dt className="text-sm font-semibold">{__('Max products', 'yay-reviews')}:</dt>
            <dd className="text-sm">{email.email_data?.max_products}</dd>
            <dt className="text-sm font-semibold">{__('Products type', 'yay-reviews')}:</dt>
            <dd className="text-sm">{productType}</dd>
          </dl>
        </div>
      )}
    </div>
    // <DialogFooter>
    //   <Dialog open={dismissDialogOpen} onOpenChange={setDismissDialogOpen}>
    //     <DialogTrigger asChild>
    //       <Button
    //         variant="outline"
    //         onClick={(e) => {
    //           e.preventDefault();
    //           // onDismiss(email.id);
    //         }}
    //       >
    //         {__('Dismiss', 'yay-reviews')}
    //       </Button>
    //     </DialogTrigger>
    //     <DialogContent
    //       className="max-w-md"
    //       onClick={(e) => {
    //         e.stopPropagation();
    //       }}
    //     >
    //       <DialogHeader>
    //         <DialogTitle>{__('Dismiss email', 'yay-reviews')}</DialogTitle>
    //       </DialogHeader>
    //       <div>{__('Are you sure you want to dismiss this email?', 'yay-reviews')}</div>
    //       <DialogFooter>
    //         <Button
    //           variant="outline"
    //           className=""
    //           onClick={(e) => {
    //             e.preventDefault();
    //             setDismissDialogOpen(false);
    //           }}
    //         >
    //           {__('Cancel', 'yay-reviews')}
    //         </Button>
    //         <Button
    //           variant="default"
    //           className=""
    //           onClick={(e) => {
    //             e.preventDefault();
    //             // onDismiss(email.id);
    //             setDismissDialogOpen(false);
    //           }}
    //         >
    //           {__('Dismiss', 'yay-reviews')}
    //         </Button>
    //       </DialogFooter>
    //     </DialogContent>
    //   </Dialog>
    //   <DialogClose asChild></DialogClose>
    //   <Button
    //     disabled={isSending}
    //     type="submit"
    //     onClick={(e) => {
    //       e.preventDefault();
    //       onSend(email.id);
    //     }}
    //   >
    //     {isSending ? (
    //       <Loader2Icon className="h-4 w-4 animate-spin" />
    //     ) : email.type === 'reminder' && email.status === '0' ? (
    //       __('Send', 'yay-reviews')
    //     ) : (
    //       __('Re-send', 'yay-reviews')
    //     )}
    //   </Button>
    // </DialogFooter>
  );
}
