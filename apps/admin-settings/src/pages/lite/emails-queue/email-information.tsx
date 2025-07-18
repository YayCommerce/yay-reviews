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
    switch (email.email_data?.product_scope) {
      case 'normal':
        return __('Normal products', 'yay-customer-reviews-woocommerce');
      case 'featured':
        return __('Featured products', 'yay-customer-reviews-woocommerce');
      case 'on_sale':
        return __('On sale products', 'yay-customer-reviews-woocommerce');
      case 'newest':
        return __('Newest products', 'yay-customer-reviews-woocommerce');
      case 'high_rated':
        return __('High rated products', 'yay-customer-reviews-woocommerce');
      case 'low_rated':
        return __('Low rated products', 'yay-customer-reviews-woocommerce');
      case 'best_selling':
        return __('Best selling products', 'yay-customer-reviews-woocommerce');
      default:
        return __('All products', 'yay-customer-reviews-woocommerce');
    }
  }, [email.email_data?.product_scope]);

  const ratingRequirement = useMemo(() => {
    switch (email.email_data?.rating_requirement) {
      case 'none':
      case 'any':
        return __('Any rating', 'yay-customer-reviews-woocommerce');
      case 'less_than_5_stars':
        return __('Less than 5★', 'yay-customer-reviews-woocommerce');
      case '5_stars':
        return __('5★ only', 'yay-customer-reviews-woocommerce');
      default:
        return __('Any rating', 'yay-customer-reviews-woocommerce');
    }
  }, [email.email_data?.rating_requirement]);

  const mediaRequirement = useMemo(() => {
    switch (email.email_data?.media_requirement) {
      case 'none':
        return __('No requirement', 'yay-customer-reviews-woocommerce');
      case 'at_least_1_media':
        return __('Photo or video required', 'yay-customer-reviews-woocommerce');
      default:
        return __('No requirement', 'yay-customer-reviews-woocommerce');
    }
  }, [email.email_data?.media_requirement]);

  const minimumRequiredReviewsSinceLastReward = useMemo(() => {
    switch (email.email_data?.minimum_required_reviews_since_last_reward) {
      case 'none':
      case 'every_review':
        return __('After every review', 'yay-customer-reviews-woocommerce');
      case 'every_2_reviews':
        return __('After every 2 reviews', 'yay-customer-reviews-woocommerce');
      case 'every_3_reviews':
        return __('After every 3 reviews', 'yay-customer-reviews-woocommerce');
      default:
        return __('No requirement', 'yay-customer-reviews-woocommerce');
    }
  }, [email.email_data?.minimum_required_reviews_since_last_reward]);

  return (
    <div className="space-y-6 px-4 pt-6">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-semibold">{__('Type', 'yay-customer-reviews-woocommerce')}:</TableCell>
            <TableCell className="capitalize">{email.type}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold">{__('To', 'yay-customer-reviews-woocommerce')}:</TableCell>
            <TableCell className="break-all">{email.customer_email}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold">{__('Status', 'yay-customer-reviews-woocommerce')}:</TableCell>
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
                  ? __('Pending', 'yay-customer-reviews-woocommerce')
                  : email.status === '1'
                    ? __('Sent', 'yay-customer-reviews-woocommerce')
                    : __('Cancelled', 'yay-customer-reviews-woocommerce')}
              </Badge>
            </TableCell>
          </TableRow>

          {/* Section: Reward Details */}
          {email.type === 'reward' && (
            <>
              <TableRow>
                <TableCell className="font-semibold">{__('Coupon', 'yay-customer-reviews-woocommerce')}:</TableCell>
                <TableCell>{email.email_data?.coupon_code}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{__('Product', 'yay-customer-reviews-woocommerce')}:</TableCell>
                <TableCell>{email.email_data?.product_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{__('Rating', 'yay-customer-reviews-woocommerce')}:</TableCell>
                <TableCell>{ratingRequirement}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{__('Media', 'yay-customer-reviews-woocommerce')}:</TableCell>
                <TableCell>{mediaRequirement}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">{__('Frequency', 'yay-customer-reviews-woocommerce')}:</TableCell>
                <TableCell>{minimumRequiredReviewsSinceLastReward}</TableCell>
              </TableRow>
            </>
          )}
          {/* Section: Reminder Details */}
          {email.type === 'reminder' && (
            <>
              <TableRow>
                <TableCell className="font-semibold">{__('Sent after', 'yay-customer-reviews-woocommerce')}:</TableCell>
                <TableCell>
                  {email.email_data?.delay_amount} {email.email_data?.delay_unit}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">
                  {__('Remind products', 'yay-customer-reviews-woocommerce')}:
                </TableCell>
                <TableCell>
                  {email.email_data?.product_scope !== 'all' &&
                    email.email_data?.max_products_per_email &&
                    `${email.email_data?.max_products_per_email} `}
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
