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
				$email_queue = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}yay_reviews_email_queue WHERE id = %d", $email_id ) );
				if ( ! empty( $email_queue ) ) {
					if ( 'reminder' === $email_queue->type && '0' === $email_queue->status ) {
						$scheduled_event = maybe_unserialize( $email_queue->scheduled_event );
						if ( ! empty( $scheduled_event ) && isset( $scheduled_event['timestamp'] ) && isset( $scheduled_event['order_id'] ) ) {
							// Ensure timestamp is valid
							$timestamp    = intval( $scheduled_event['timestamp'] );
							$order_id     = intval( $scheduled_event['order_id'] );
							$email_id_int = intval( $email_id );

							do_action( 'yay_reviews_reminder_email', $order_id, $email_id_int );

							if ( $timestamp > 0 ) {
								// Try to unschedule the event with proper error handling
								$unscheduled = wp_unschedule_event( $timestamp, 'yay_reviews_reminder_email', array( $order_id, $email_id_int ) );
								if ( is_wp_error( $unscheduled ) ) {
									// Log the error but don't fail the entire operation
									error_log( 'YayReviews: Failed to unschedule event - ' . $unscheduled->get_error_message() );
								}
							}
						}
					} else {
						if ( 'reminder' === $email_queue->type ) {
							$email = new \YayReviews\Emails\ReminderEmail();
						} else {
							$email = new \YayReviews\Emails\RewardEmail();
						}
						$result = $email->send( $email_queue->customer_email, $email_queue->subject, $email_queue->body, $email->get_headers(), $email->get_attachments() );
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
			$email_id = isset( $_POST['email_id'] ) ? sanitize_text_field( $_POST['email_id'] ) : '';
			if ( ! empty( $email_id ) ) {
				global $wpdb;
				$email_queue = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}yay_reviews_email_queue WHERE id = %d", $email_id ) );
				if ( ! empty( $email_queue ) ) {
					// if status = 0, type = reminder, delete the scheduled event
					if ( '0' === $email_queue->status && 'reminder' === $email_queue->type ) {
						$scheduled_event = maybe_unserialize( $email_queue->scheduled_event );
						if ( ! empty( $scheduled_event ) && isset( $scheduled_event['timestamp'] ) && isset( $scheduled_event['order_id'] ) ) {
							// Ensure timestamp is valid
							$timestamp    = intval( $scheduled_event['timestamp'] );
							$order_id     = intval( $scheduled_event['order_id'] );
							$email_id_int = intval( $email_id );

							if ( $timestamp > 0 ) {
								// Try to unschedule the event with proper error handling
								$unscheduled = wp_unschedule_event( $timestamp, 'yay_reviews_reminder_email', array( $order_id, $email_id_int ), true );
								if ( is_wp_error( $unscheduled ) ) {
									// Log the error but don't fail the entire operation
									error_log( 'YayReviews: Failed to unschedule event - ' . $unscheduled->get_error_message() );
								}
							}
						}
					}
				}
				Helpers::modify_email_queue(
					false,
					array(
						'id'     => $email_id,
						'status' => 2,
					)
				);
				wp_send_json_success(
					array(
						'mess' => __( 'Email dismissed successfully', 'yay-reviews' ),
					)
				);
			}
			wp_send_json_error( array( 'mess' => __( 'Invalid email id', 'yay-reviews' ) ) );
		} catch ( \Exception $e ) {
			return wp_send_json_error( array( 'mess' => $e->getMessage() ) );
		}
	}
}
