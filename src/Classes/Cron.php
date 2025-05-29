<?php
namespace YayReviews\Classes;

use YayReviews\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Cron {
	use SingletonTrait;

	public function __construct() {
		add_action( 'yay_reviews_reminder_email', array( $this, 'send_reminder_email' ), 10, 2 );
		add_action( 'woocommerce_order_status_completed', array( $this, 'schedule_reminder_email' ), 10, 1 );
	}

	public function schedule_reminder_email( $order_id ) {
		if ( get_post_meta( $order_id, '_yay_reviews_scheduled', true ) ) {
			return;
		}

		update_post_meta( $order_id, '_yay_reviews_scheduled', 'yes' );

		$settings          = Helpers::get_all_settings_from_db();
		$reminder_settings = $settings['reminder'];
		$time              = time();

		if ( isset( $reminder_settings['send_after_value'] ) && $reminder_settings['send_after_value'] > 0 ) {
			$unit = isset( $reminder_settings['send_after_unit'] ) ? $reminder_settings['send_after_unit'] : 'days';

			switch ( $unit ) {
				case 'minutes':
					$time += $reminder_settings['send_after_value'] * 60;
					break;
				case 'hours':
					$time += $reminder_settings['send_after_value'] * 3600;
					break;
				case 'days':
				default:
					$time += $reminder_settings['send_after_value'] * 86400;
					break;
			}
		}

		wp_schedule_single_event( $time, 'yay_reviews_reminder_email', array( $order_id ) );
	}

	public function send_reminder_email( $order_id ) {
		if ( ! $order_id ) {
			return;
		}

		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}

		$settings          = Helpers::get_all_settings_from_db();
		$reminder_settings = $settings['reminder'];
		$addons_settings   = $settings['addons'];

		// Check if reminder is enabled
		if ( ! $addons_settings['reminder'] ) {
			return;
		}

		// Check if sending to guests is allowed
		if ( $reminder_settings['send_to_guests'] ) {
			if ( ! $order->get_user_id() ) {
				return;
			}
		}

		// Check excluded emails
		$excluded_emails = isset( $reminder_settings['except_emails'] ) ? $reminder_settings['except_emails'] : '';
		if ( ! empty( $excluded_emails ) ) {
			$excluded_emails = array_map( 'trim', explode( ',', $excluded_emails ) );
			if ( in_array( $order->get_billing_email(), $excluded_emails ) ) {
				return;
			}
		}

		// Get products that need review
		$items       = $order->get_items();
		$product_ids = array();
		foreach ( $items as $item ) {
			$product_id = $item->get_data()['product_id'];
			if ( $product_id ) {
				$product_ids[] = $product_id;
			}
		}
		$product_ids = array_unique( $product_ids );

		// Check if user has already reviewed these products
		// $user_id = $order->get_user_id();
		// if ( $user_id ) {
		//  $reviewed_products = get_user_meta( $user_id, '_yay_reviews_reviewed_product', true );
		//  if ( ! is_array( $reviewed_products ) ) {
		//      $reviewed_products = array();
		//  }
		//  $reviewed_products = array_map( 'intval', $reviewed_products );
		//  $product_ids       = array_diff( $product_ids, $reviewed_products );
		// }

		if ( empty( $product_ids ) ) {
			return;
		}

		// // Limit number of products to remind about
		// $max_products = isset( $settings['max_products'] ) ? intval( $settings['max_products'] ) : 3;
		// if ( $max_products > 0 ) {
		//  $product_ids = array_slice( $product_ids, 0, $max_products );
		// }

		// Trigger the email
		do_action( 'yay_reviews_reminder_email_notification', $order_id, $order );
	}
}
