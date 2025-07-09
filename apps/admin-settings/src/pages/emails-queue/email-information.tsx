import { useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { EmailQueue } from 'types/email-queue';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

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
      case 'less_than_5_stars':
        return __('Less than 5★', 'yay-reviews');
      case '5_stars':
        return __('5★ only', 'yay-reviews');
      default:
        return __('Any rating', 'yay-reviews');
    }
  }, [email.email_data?.rating_requirement]);

  const mediaRequirement = useMemo(() => {
    switch (email.email_data?.media_requirement) {
      case 'none':
        return __('No requirement', 'yay-reviews');
      case 'at_least_1_media':
        return __('Photo or video required', 'yay-reviews');
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
      default:
        return __('No requirement', 'yay-reviews');
    }
  }, [email.email_data?.minimum_required_reviews_since_last_reward]);

  return (
    <div className="space-y-6 px-4 pt-6">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-semibold">{__('Type', 'yay-reviews')}:</TableCell>
            <TableCell className="capitalize">{email.type}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold">{__('To', 'yay-reviews')}:</TableCell>
            <TableCell className="break-all">{email.customer_email}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold">{__('Status', 'yay-reviews')}:</TableCell>
            <TableCell>
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
            </TableCell>
          </TableRow>

          {/* Section: Reward Details */}
          {email.type === 'reward' && (
            <>
              <TableRow>
                <TableCell className="font-semibold">{__('Coupon', 'yay-reviews')}:</TableCell>
                <TableCell>{email.email_data?.coupon_code}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{__('Product', 'yay-reviews')}:</TableCell>
                <TableCell>{email.email_data?.product_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{__('Rating', 'yay-reviews')}:</TableCell>
                <TableCell>{ratingRequirement}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{__('Media', 'yay-reviews')}:</TableCell>
                <TableCell>{mediaRequirement}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{__('Frequency', 'yay-reviews')}:</TableCell>
                <TableCell>{minimumRequiredReviewsSinceLastReward}</TableCell>
              </TableRow>
            </>
          )}
          {/* Section: Reminder Details */}
          {email.type === 'reminder' && (
            <>
              <TableRow>
                <TableCell className="font-semibold">{__('Sent after', 'yay-reviews')}:</TableCell>
                <TableCell>
                  {email.email_data?.send_after_value} {email.email_data?.send_after_unit}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">
                  {__('Remind products', 'yay-reviews')}:
                </TableCell>
                <TableCell>
                  {email.email_data?.products_type !== 'all' &&
                    email.email_data?.max_products &&
                    `${email.email_data?.max_products} `}
                  {productType}
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
