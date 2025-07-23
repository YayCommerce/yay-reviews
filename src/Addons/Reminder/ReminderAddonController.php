<?php

namespace YayRev\Addons\Reminder;

use YayRev\Classes\Products;
use YayRev\Models\SettingsModel;
use YayRev\SingletonTrait;

class ReminderAddonController {
	use SingletonTrait;

	/**
	 * Check if the reminder addon is enabled
	 *
	 * @return bool
	 */
	public static function is_addon_enabled() {
		$reminder_enabled = SettingsModel::get_settings( 'addons.reminder_enabled' );
		return $reminder_enabled;
	}

	/**
	 * Check if the reminder email can be sent
	 *
	 * @param int $order_id
	 * @return bool
	 */
	public static function can_send_reminder_email( $order_id ) {
		if ( ! self::is_addon_enabled() ) {
			return false;
		}

		try {

			$order = \wc_get_order( $order_id );
			if ( ! $order || ! ( $order instanceof \WC_Order ) ) {
				throw new \Exception( 'Order not found' );
			}

			$reminder_settings      = self::get_reminder_settings();
			$max_products_per_email = $reminder_settings['max_products_per_email'];
			$product_scope          = $reminder_settings['product_scope'];

			if ( ! in_array( $product_scope, array( 'featured', 'on_sale' ) ) ) {
				return true;
			}

			if ( empty( $max_products_per_email ) ) {
				return true;
			}

			// Get list product ids from order
			$items       = $order->get_items();
			$product_ids = array();
			foreach ( $items as $item ) {
				$product_id              = $item->get_data()['product_id'];
				$is_reviewed_by_customer = (bool) get_comments(
					array(
						'author_email' => $order->get_billing_email(),
						'post_id'      => $product_id,       // match the product
						'status'       => 'approve',         // only approved reviews
						'type'         => 'review',          // WooCommerce sets comment_type to 'review'
						'number'       => 1,                 // we only need to know if *one* exists
						'count'        => true,              // return an integer count, not objects
						'hierarchical' => 'threaded',     // speed: ignore pings/trackbacks
					)
				);
				if ( $product_id && ! $is_reviewed_by_customer ) {
					$product_ids[] = $product_id;
				}
			}

			$product_ids = array_unique( $product_ids );
			if ( empty( $product_ids ) ) {
				throw new \Exception( 'No product is eligible to send reminder email' );
			}

			// if ( ! in_array( $product_scope, array( 'featured', 'on_sale' ) ) ) {
			// 	return true;
			// }

			// if ( empty( $max_products_per_email ) ) {
			// 	return true;
			// }

			// Check condition before create schedule reminder email
			if ( 'featured' === $product_scope ) {
				$featured_product_ids = Products::get_featured_products();
				$product_ids          = array_intersect( $product_ids, $featured_product_ids );
			} elseif ( 'on_sale' === $product_scope ) {
				$on_sale_product_ids = Products::get_on_sale_products();
				$product_ids         = array_intersect( $product_ids, $on_sale_product_ids );
			}

			if ( empty( $product_ids ) ) {
				throw new \Exception( 'No featured/on-sale products found in order' );
			}
		} catch ( \Exception $e ) {
			return false;
		}

		return true;

	}

	public static function get_reminder_email_delay_time() {

		$reminder_settings = self::get_reminder_settings();
		$delay_amount      = $reminder_settings['delay_amount'];
		$delay_unit        = $reminder_settings['delay_unit'];
		$time              = time();

		if ( $delay_amount > 0 ) {
			switch ( $delay_unit ) {
				case 'minutes':
					$time += $delay_amount * 60;
					break;
				case 'hours':
					$time += $delay_amount * 3600;
					break;
				case 'days':
				default:
					$time += $delay_amount * 86400;
					break;
			}
		}

		return $time;
	}

	/**
	 * Get the reminder settings
	 * TODO: VERSIONING
	 *
	 * @return array
	 */
	public static function get_reminder_settings() {
		$reminder_settings      = SettingsModel::get_settings( 'reminder' );
		$delay_amount           = $reminder_settings['delay_amount'];
		$delay_unit             = $reminder_settings['delay_unit'];
		$max_products_per_email = $reminder_settings['max_products_per_email'];
		$product_scope          = $reminder_settings['product_scope'];

		return array(
			'delay_amount'           => $delay_amount,
			'delay_unit'             => $delay_unit,
			'product_scope'          => $product_scope,
			'max_products_per_email' => $max_products_per_email,
		);
	}

	/**
	 * Get the default reminder settings
	 *
	 * @return array
	 */
	public static function get_reminder_default_settings() {
		return array(
			'delay_amount'           => 5,
			'delay_unit'             => 'days',
			'max_products_per_email' => '',
			'product_scope'          => 'all',
		);
	}
}
