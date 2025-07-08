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
		$order = wc_get_order( $order_id );

		if ( get_post_meta( $order_id, '_yay_reviews_reminder_email_scheduled_sent', true ) || ! $order ) {
			return;
		}

		$settings = Helpers::get_all_settings();

		if ( ! isset( $settings['addons']['reminder'] ) || ! $settings['addons']['reminder'] ) {
			return;
		}

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

		$products_type = isset( $reminder_settings['products_type'] ) ? $reminder_settings['products_type'] : 'featured';
		$max_products  = isset( $reminder_settings['max_products'] ) ? $reminder_settings['max_products'] : 3;

		$email_id = 0;
		// Check if products type different from featured or on sale or max products is 0. If so, schedule reminder email.
		if ( ! in_array( $products_type, array( 'featured', 'on_sale' ) ) || 0 === $max_products ) {
			// save email log

			$email_id = Helpers::modify_email_queue(
				true,
				array(
					'type'            => 'reminder',
					'status'          => 0,
					'customer_email'  => $order->get_billing_email(),
					'created_at'      => current_time( 'mysql' ),
					'scheduled_event' => maybe_serialize(
						array(
							'timestamp' => $time,
							'hook'      => 'yay_reviews_reminder_email',
							'order_id'  => $order_id,
						)
					),
					'email_data'      => maybe_serialize(
						array(
							'send_after_value' => $reminder_settings['send_after_value'],
							'send_after_unit'  => $reminder_settings['send_after_unit'],
							'products_type'    => $reminder_settings['products_type'],
							'max_products'     => $reminder_settings['max_products'],
						)
					),
				)
			);
			if ( $email_id ) {
				wp_schedule_single_event( $time, 'yay_reviews_reminder_email', array( $order_id, $email_id ) );
				update_post_meta( $order_id, '_yay_reviews_reminder_email_scheduled_sent', 'pending' );
			}
			return;
		}

		// Get list product ids from order
		$items       = wc_get_order( $order_id )->get_items();
		$product_ids = array();
		foreach ( $items as $item ) {
			$product_id = $item->get_data()['product_id'];
			if ( $product_id ) {
				$product_ids[] = $product_id;
			}
		}

		$product_ids = array_unique( $product_ids );
		if ( empty( $product_ids ) ) {
			return;
		}

		// Check condition before create schedule reminder email
		if ( 'featured' === $products_type ) {
			$featured_product_ids = Products::get_featured_products();
			$product_ids          = array_intersect( $product_ids, $featured_product_ids );
		} elseif ( 'on_sale' === $products_type ) {
			$on_sale_product_ids = Products::get_on_sale_products();
			$product_ids         = array_intersect( $product_ids, $on_sale_product_ids );
		}

		if ( empty( $product_ids ) ) {
			return;
		}

		// save email log
		$email_id = Helpers::modify_email_queue(
			true,
			array(
				'type'            => 'reminder',
				'status'          => 0,
				'customer_email'  => $order->get_billing_email(),
				'created_at'      => current_time( 'mysql' ),
				'scheduled_event' => maybe_serialize(
					array(
						'timestamp' => $time,
						'hook'      => 'yay_reviews_reminder_email',
						'order_id'  => $order_id,
					)
				),
				'email_data'      => maybe_serialize(
					array(
						'send_after_value' => $reminder_settings['send_after_value'],
						'send_after_unit'  => $reminder_settings['send_after_unit'],
						'products_type'    => $reminder_settings['products_type'],
						'max_products'     => $reminder_settings['max_products'],
					)
				),
			)
		);

		if ( $email_id ) {
			wp_schedule_single_event( $time, 'yay_reviews_reminder_email', array( $order_id, $email_id ) );
			update_post_meta( $order_id, '_yay_reviews_reminder_email_scheduled_sent', 'pending' );
		}
	}

	public function send_reminder_email( $order_id, $email_id ) {

		if ( ! $order_id || ! $email_id ) {
			return;
		}

		if ( 'sent' === get_post_meta( $order_id, '_yay_reviews_reminder_email_scheduled_sent', true ) ) {
			return;
		}

		// Ensure WooCommerce email classes are loaded
		if ( ! class_exists( 'WC_Email' ) ) {
			WC()->mailer();
		}

		$order = wc_get_order( $order_id );

		if ( ! $order || ! is_a( $order, 'WC_Order' ) ) {
			return;
		}

		// Trigger reminder email notification
		do_action( 'yay_reviews_reminder_email_notification', $order_id, $order, $email_id );
	}
}
