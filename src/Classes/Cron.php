<?php
namespace YayReviews\Classes;

use YayReviews\Constants\EmailConstants;
use YayReviews\Emails\ReminderEmail;
use YayReviews\Models\SettingsModel;
use YayReviews\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Cron {
	use SingletonTrait;

	public function __construct() {
		add_action( 'yayrev_reminder_email', array( $this, 'send_reminder_email' ), 10, 2 );
		add_action( 'woocommerce_order_status_completed', array( $this, 'schedule_reminder_email' ), 10, 1 );
	}

	public function schedule_reminder_email( $order_id ) {
		$order = wc_get_order( $order_id );

		if ( get_post_meta( $order_id, '_yayrev_reminder_email_scheduled_sent', true ) || ! $order ) {
			return;
		}

		$reminder_enabled = SettingsModel::get_settings( 'addons.reminder_enabled' );

		if ( ! $reminder_enabled ) {
			return;
		}

		//TODO: VERSIONING
		$reminder_settings      = SettingsModel::get_settings( 'reminder' );
		$delay_amount           = $reminder_settings['delay_amount'];
		$delay_unit             = $reminder_settings['delay_unit'];
		$max_products_per_email = $reminder_settings['max_products_per_email'];
		$product_scope          = $reminder_settings['product_scope'];
		$time                   = time();

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

		$email_id = 0;
		// Check if product scope different from featured or on sale or max products per email is 0. If so, schedule reminder email.
		if ( ! in_array( $product_scope, array( 'featured', 'on_sale' ) ) || 0 === $max_products_per_email ) {
			// save email log

			$email_id = EmailQueue::insert_queue(
				array(
					'type'            => 'reminder',
					'status'          => 0,
					'customer_email'  => $order->get_billing_email(),
					'created_at'      => current_time( 'mysql' ),
					'scheduled_event' => maybe_serialize(
						array(
							'timestamp' => $time,
							'hook'      => 'yayrev_reminder_email',
							'order_id'  => $order_id,
						)
					),
					'email_data'      => maybe_serialize(
						array(
							'delay_amount'           => $delay_amount,
							'delay_unit'             => $delay_unit,
							'product_scope'          => $product_scope,
							'max_products_per_email' => $max_products_per_email,
						)
					),
				)
			);
			if ( $email_id ) {
				wp_schedule_single_event( $time, 'yayrev_reminder_email', array( $order_id, $email_id ) );
				update_post_meta( $order_id, '_yayrev_reminder_email_scheduled_sent', 'pending' );
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
		if ( 'featured' === $product_scope ) {
			$featured_product_ids = Products::get_featured_products();
			$product_ids          = array_intersect( $product_ids, $featured_product_ids );
		} elseif ( 'on_sale' === $product_scope ) {
			$on_sale_product_ids = Products::get_on_sale_products();
			$product_ids         = array_intersect( $product_ids, $on_sale_product_ids );
		}

		if ( empty( $product_ids ) ) {
			return;
		}

		// save email log
		//TODO: VERSIONING
		$email_id = EmailQueue::insert_queue(
			array(
				'type'            => 'reminder',
				'status'          => 0,
				'customer_email'  => $order->get_billing_email(),
				'created_at'      => current_time( 'mysql' ),
				'scheduled_event' => maybe_serialize(
					array(
						'timestamp' => $time,
						'hook'      => 'yayrev_reminder_email',
						'order_id'  => $order_id,
					)
				),
				'email_data'      => maybe_serialize(
					array(
						'delay_amount'           => $delay_amount,
						'delay_unit'             => $delay_unit,
						'product_scope'          => $product_scope,
						'max_products_per_email' => $max_products_per_email,
					)
				),
			)
		);

		if ( $email_id ) {
			wp_schedule_single_event( $time, 'yayrev_reminder_email', array( $order_id, $email_id ) );
			update_post_meta( $order_id, '_yayrev_reminder_email_scheduled_sent', 'pending' );
		}
	}

	public function send_reminder_email( $order_id, $email_id ) {

		if ( ! $order_id || ! $email_id ) {
			return;
		}

		if ( 'sent' === get_post_meta( $order_id, '_yayrev_reminder_email_scheduled_sent', true ) ) {
			return;
		}

		// Ensure WooCommerce email classes are loaded
		if ( ! class_exists( 'WC_Email' ) ) {
			\WC()->mailer();
		}

		$order = \wc_get_order( $order_id );

		if ( ! $order || ! is_a( $order, 'WC_Order' ) ) {
			return;
		}

		// Trigger reminder email notification
		do_action( EmailConstants::REMINDER_EMAIL_ACTION, $order_id, $order, $email_id );
	}
}
