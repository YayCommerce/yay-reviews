import { useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { EmailQueue } from 'types/email-queue';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function EmailInformation({ email }: { email: EmailQueue | null }) {
  if (!email) {
    return null;
  }

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
      case 'any':
        return __('Any rating', 'yay-reviews');
      case '4_stars':
        return __('4-star review', 'yay-reviews');
      case '5_stars':
        return __('5-star review', 'yay-reviews');
      case 'at_least_3_stars':
        return __('Review with 3+ stars', 'yay-reviews');
      case 'at_least_4_stars':
        return __('Review with 4+ stars', 'yay-reviews');
      default:
        return __('Any rating', 'yay-reviews');
    }
  }, [email.email_data?.rating_requirement]);

  const mediaRequirement = useMemo(() => {
    switch (email.email_data?.media_requirement) {
      case 'none':
        return __('No requirement', 'yay-reviews');
      case 'at_least_1_media':
        return __('At least 1 media file in review', 'yay-reviews');
      case 'at_least_2_media':
        return __('At least 2 media files in review', 'yay-reviews');
      case 'at_least_1_image':
        return __('At least 1 image in review', 'yay-reviews');
      case 'at_least_2_images':
        return __('At least 2 images in review', 'yay-reviews');
      case 'at_least_1_video':
        return __('At least 1 video in review', 'yay-reviews');
      case 'at_least_2_videos':
        return __('At least 2 videos in review', 'yay-reviews');
      default:
        return __('No requirement', 'yay-reviews');
    }
  }, [email.email_data?.media_requirement]);

  const minimumRequiredReviewsSinceLastReward = useMemo(() => {
    switch (email.email_data?.minimum_required_reviews_since_last_reward) {
      case 'none':
      case 'every_review':
        return __('After every review', 'yay-reviews');
      case 'every_2_reviews':
        return __('After every 2 reviews', 'yay-reviews');
      case 'every_3_reviews':
        return __('After every 3 reviews', 'yay-reviews');
      case 'after_2_reviews':
        return __('After submitting 2 reviews (one-time reward)', 'yay-reviews');
      case 'after_3_reviews':
        return __('After submitting 3 reviews (one-time reward)', 'yay-reviews');
      default:
        return __('No requirement', 'yay-reviews');
    }
  }, [email.email_data?.minimum_required_reviews_since_last_reward]);

  return (
    <div className="space-y-6 px-4 pt-6">
      <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        <dt className="text-sm font-semibold">{__('Type', 'yay-reviews')}:</dt>
        <dd className="pl-2 text-sm capitalize">{email.type}</dd>
        <dt className="text-sm font-semibold">{__('To', 'yay-reviews')}:</dt>
        <dd className="pl-2 text-sm break-all">{email.customer_email}</dd>
        <dt className="text-sm font-semibold">{__('Status', 'yay-reviews')}:</dt>
        <dd className="pl-2 text-sm font-semibold capitalize">
          <Badge
            variant="default"
            className={cn('transition-none', {
              'bg-[#1668dc]': email.status === '0',
              'bg-[#49aa19]': email.status === '1',
              'bg-[#404040]': email.status === '2',
            })}
          >
            {email.status === '0'
              ? __('Pending', 'yay-reviews')
              : email.status === '1'
                ? __('Sent', 'yay-reviews')
                : __('Cancelled', 'yay-reviews')}
          </Badge>
        </dd>

        {/* Section: Reward Details */}
        {email.type === 'reward' && (
          <>
            <dt className="text-sm font-semibold">{__('Coupon', 'yay-reviews')}:</dt>
            <dd className="pl-2 text-sm">{email.email_data?.coupon_code}</dd>
            <dt className="text-sm font-semibold">{__('Product', 'yay-reviews')}:</dt>
            <dd className="pl-2 text-sm">{email.email_data?.product_name}</dd>
            <dt className="text-sm font-semibold">{__('Rating', 'yay-reviews')}:</dt>
            <dd className="pl-2 text-sm">{ratingRequirement}</dd>
            <dt className="text-sm font-semibold">{__('Media files', 'yay-reviews')}:</dt>
            <dd className="pl-2 text-sm">{mediaRequirement}</dd>
            <dt className="text-sm font-semibold">{__('Reward trigger', 'yay-reviews')}:</dt>
            <dd className="pl-2 text-sm">{minimumRequiredReviewsSinceLastReward}</dd>
          </>
        )}
        {/* Section: Reminder Details */}
        {email.type === 'reminder' && (
          <>
            <dt className="text-sm font-semibold">{__('Sent after', 'yay-reviews')}:</dt>
            <dd className="pl-2 text-sm">
              {email.email_data?.send_after_value} {email.email_data?.send_after_unit}
            </dd>
            <dt className="text-sm font-semibold">
              {__('Remind products', 'yay-reviews')}:
            </dt>
            <dd className="pl-2 text-sm">
              {email.email_data?.max_products} {productType}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}
