<?php

namespace YayReviews;

use YayReviews\SingletonTrait;
use YayReviews\Classes\Helpers;

class Ajax {
	use SingletonTrait;

	protected function __construct() {
		$this->init_hooks();
	}

	protected function init_hooks() {
		add_action( 'wp_ajax_yay_reviews_change_addon_status', array( $this, 'change_addon_status' ) );
		add_action( 'wp_ajax_yay_reviews_send_email', array( $this, 'send_email' ) );
		add_action( 'wp_ajax_yay_reviews_dismiss_email', array( $this, 'dismiss_email' ) );
	}

	public function change_addon_status() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'yay_reviews_nonce' ) ) {
			return wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay-reviews' ) ) );
		}
		try {
			$addon_id = isset( $_POST['addon_id'] ) ? sanitize_text_field( $_POST['addon_id'] ) : '';
			$status   = isset( $_POST['status'] ) ? sanitize_text_field( $_POST['status'] ) : '';

			if ( ! empty( $addon_id ) && ! empty( $status ) ) {
				$settings            = Helpers::get_all_settings();
				$addons              = $settings['addons'];
				$addons[ $addon_id ] = 'active' === $status ? true : false;
				$settings['addons']  = $addons;
				Helpers::update_settings( $settings );
				wp_send_json_success( array( 'status' => $status ) );
			}
			wp_send_json_error( array( 'mess' => __( 'Invalid addon id or status', 'yay-reviews' ) ) );
		} catch ( \Exception $e ) {
			return wp_send_json_error( array( 'mess' => $e->getMessage() ) );
		}
	}

	public function send_email() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'yay_reviews_nonce' ) ) {
			return wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay-reviews' ) ) );
		}
		try {
			global $wpdb;
			$email_id = isset( $_POST['email_id'] ) ? sanitize_text_field( $_POST['email_id'] ) : '';
			if ( ! empty( $email_id ) ) {
				$email_log = $wpdb->get_row( "SELECT * FROM {$wpdb->prefix}yay_reviews_email_logs WHERE id = {$email_id}" );
				if ( ! empty( $email_log ) ) {
					if ( 'reminder' === $email_log->type && '0' === $email_log->status ) {
						$scheduled_event = maybe_unserialize( $email_log->scheduled_event );
						if ( ! empty( $scheduled_event ) ) {
							do_action( 'yay_reviews_reminder_email', $scheduled_event['order_id'], $email_id );
							wp_unschedule_event( $scheduled_event['timestamp'], 'yay_reviews_reminder_email', array( $scheduled_event['order_id'], $email_id ) );
						}
					} else {
						if ( 'reminder' === $email_log->type ) {
							$email = new \YayReviews\Emails\ReminderEmail();
						} else {
							$email = new \YayReviews\Emails\RewardEmail();
						}
						$result = $email->send( $email_log->customer_email, $email_log->subject, $email_log->body, $email->get_headers(), $email->get_attachments() );
						if ( $result ) {
							wp_send_json_success(
								array(
									'mess' => __( 'Email sent successfully', 'yay-reviews' ),
								)
							);
						} else {
							wp_send_json_error(
								array(
									'mess' => __( 'Email sending failed', 'yay-reviews' ),
								)
							);
						}
					}
					wp_send_json_success(
						array(
							'mess' => __( 'Email sent successfully', 'yay-reviews' ),
						)
					);
				}
			}
			wp_send_json_error( array( 'mess' => __( 'Invalid email id', 'yay-reviews' ) ) );
		} catch ( \Exception $e ) {
			return wp_send_json_error( array( 'mess' => $e->getMessage() ) );
		}
	}

	public function dismiss_email() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'yay_reviews_nonce' ) ) {
			return wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay-reviews' ) ) );
		}
		try {
			global $wpdb;
			$email_id = isset( $_POST['email_id'] ) ? sanitize_text_field( $_POST['email_id'] ) : '';
			$wpdb->delete(
				$wpdb->prefix . 'yay_reviews_email_logs',
				array( 'id' => $email_id )
			);

			wp_send_json_success(
				array(
					'mess' => __( 'Email dismissed successfully', 'yay-reviews' ),
				)
			);
		} catch ( \Exception $e ) {
			return wp_send_json_error( array( 'mess' => $e->getMessage() ) );
		}
	}
}
