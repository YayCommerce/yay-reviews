<?php
namespace YayRev\Classes;

use YayRev\Addons\Reminder\ReminderAddonController;
use YayRev\Constants\EmailConstants;
use YayRev\Models\QueueModel;
use YayRev\SingletonTrait;

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
		$order = \wc_get_order( $order_id );

		// Check if order is valid
		if ( ! $order || ! ( $order instanceof \WC_Order ) ) {
			return;
		}

		// Check if reminder email is already scheduled
		if ( get_post_meta( $order_id, '_yayrev_reminder_email_scheduled_sent', true ) ) {
			return;
		}

		if ( ! ReminderAddonController::can_send_reminder_email( $order_id ) ) {
			return;
		}

		$time = ReminderAddonController::get_reminder_email_delay_time();

		$email_id = QueueModel::create(
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
				'email_data'      => maybe_serialize( ReminderAddonController::get_reminder_settings() ),
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
