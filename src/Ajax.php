<?php

namespace YayReviews;

use YayReviews\Classes\EmailQueue;
use YayReviews\SingletonTrait;
use YayReviews\Models\SettingsModel;

class Ajax {
	use SingletonTrait;

	protected function __construct() {
		$this->init_hooks();
	}

	protected function init_hooks() {
		add_action( 'wp_ajax_yayrev_change_addon_status', array( $this, 'change_addon_status' ) );
		add_action( 'wp_ajax_yayrev_send_email', array( $this, 'send_email' ) );
		add_action( 'wp_ajax_yayrev_dismiss_email', array( $this, 'dismiss_email' ) );
		add_action( 'wp_ajax_yayrev_get_current_queue', array( $this, 'get_current_queue' ) );
		add_action( 'wp_ajax_yayrev_update_wc_reviews_settings', array( $this, 'update_wc_reviews_settings' ) );
		add_action( 'wp_ajax_yayrev_preview_email', array( $this, 'preview_email' ) );
		add_action( 'wp_ajax_yayrev_finish_wizard', array( $this, 'finish_wizard' ) );
	}

	public function change_addon_status() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'yayrev_nonce' ) ) {
			return wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay-reviews' ) ) );
		}
		try {
			$addon_id = isset( $_POST['addon_id'] ) ? sanitize_text_field( wp_unslash( $_POST['addon_id'] ) ) : '';
			$status   = isset( $_POST['status'] ) ? sanitize_text_field( wp_unslash( $_POST['status'] ) ) : '';

			if ( ! empty( $addon_id ) && ! empty( $status ) ) {
				SettingsModel::update_settings(
					array(
						'addons' => array(
							$addon_id => 'active' === $status ? true : false,
						),
					)
				);
				wp_send_json_success( array( 'status' => $status ) );
			}
			wp_send_json_error( array( 'mess' => __( 'Invalid addon id or status', 'yay-reviews' ) ) );
		} catch ( \Exception $e ) {
			return wp_send_json_error( array( 'mess' => $e->getMessage() ) );
		}
	}

	public function send_email() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'yayrev_nonce' ) ) {
			wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay-reviews' ) ) );
		}
		try {
			$email_id = isset( $_POST['email_id'] ) ? sanitize_text_field( wp_unslash( $_POST['email_id'] ) ) : '';
			if ( empty( $email_id ) ) {
				wp_send_json_error( array( 'mess' => __( 'Invalid email id', 'yay-reviews' ) ) );
			}

			$email_queue = EmailQueue::get_queue( $email_id );

			if ( empty( $email_queue ) ) {
				wp_send_json_error( array( 'mess' => __( 'No email found', 'yay-reviews' ) ) );
			}

			
			if ( 'reminder' === $email_queue->type ) {
				/**
				 * Process pending reminder email
				 */
				if ( '0' === $email_queue->status ) {
					$this->process_pending_reminder_email( $email_queue );
				} else {
					$this->resend_reminder_email( $email_queue );
				}
			} else {
				do_action( 'yayrev_send_other_queue_email', $email_queue );
			}

		} catch ( \Exception $e ) {
			wp_send_json_error( array( 'mess' => $e->getMessage() ) );
		}

		wp_send_json_error( array( 'mess' => __( 'No email sent', 'yay-reviews' ) ) );
	}

	public function dismiss_email() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'yayrev_nonce' ) ) {
			return wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay-reviews' ) ) );
		}
		try {
			$email_id = isset( $_POST['email_id'] ) ? sanitize_text_field( wp_unslash( $_POST['email_id'] ) ) : '';
			if ( ! empty( $email_id ) ) {
				$email_queue = EmailQueue::get_queue( $email_id );
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
								$unscheduled = wp_unschedule_event( $timestamp, 'yayrev_reminder_email', array( $order_id, $email_id_int ), true );
								if ( is_wp_error( $unscheduled ) ) {
									// Log the error but don't fail the entire operation
									if ( defined( 'WP_DEBUG' ) && WP_DEBUG && defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
										error_log( 'YayReviews: Failed to unschedule event - ' . $unscheduled->get_error_message() ); //phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
									}
								}
							}
						}
					}
				}
				EmailQueue::update_queue( 
					$email_id, 
					[
						'status' => 2,
					]
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

	public function get_current_queue() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'yayrev_nonce' ) ) {
			return wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay-reviews' ) ) );
		}
		try {
			$email_id = isset( $_POST['email_id'] ) ? sanitize_text_field( wp_unslash( $_POST['email_id'] ) ) : '';
			if ( ! empty( $email_id ) ) {
				$email_queue = EmailQueue::get_queue( $email_id );
				if ( ! empty( $email_queue ) ) {
					if ( '0' === $email_queue->status ) {
						$scheduled_event = maybe_unserialize( $email_queue->scheduled_event );
						if ( ! empty( $scheduled_event ) && isset( $scheduled_event['timestamp'] ) && isset( $scheduled_event['order_id'] ) ) {
							// Ensure timestamp is valid
							$timestamp    = intval( $scheduled_event['timestamp'] );
							$order_id     = intval( $scheduled_event['order_id'] );
							$email_id_int = intval( $email_id );

							do_action( 'yayrev_reminder_email', $order_id, $email_id_int );

							if ( $timestamp > 0 ) {
								// Try to unschedule the event with proper error handling
								$unscheduled = wp_unschedule_event( $timestamp, 'yayrev_reminder_email', array( $order_id, $email_id_int ) );
								if ( is_wp_error( $unscheduled ) ) {
									// Log the error but don't fail the entire operation
									if ( defined( 'WP_DEBUG' ) && WP_DEBUG && defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
										error_log( 'YayReviews: Failed to unschedule event - ' . $unscheduled->get_error_message() ); //phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
									}
								}
							}
							wp_send_json_success(
								array(
									'status'        => $email_queue->status,
									'delivery_time' => $email_queue->created_at,
								)
							);
						}
					} else {
						wp_send_json_success(
							array(
								'status'        => $email_queue->status,
								'delivery_time' => $email_queue->created_at,
							)
						);
					}
				} else {
					wp_send_json_error( array( 'mess' => __( 'Invalid email id', 'yay-reviews' ) ) );
				}
			}
		} catch ( \Exception $e ) {
			return wp_send_json_error( array( 'mess' => $e->getMessage() ) );
		}
	}

	public function update_wc_reviews_settings() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'yayrev_nonce' ) ) {
			return wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay-reviews' ) ) );
		}

		try {
			$update_field = isset( $_POST['update_field'] ) ? sanitize_text_field( wp_unslash( $_POST['update_field'] ) ) : '';
			$value        = isset( $_POST['value'] ) ? sanitize_text_field( wp_unslash( $_POST['value'] ) ) : '';

			if ( ! empty( $update_field ) && ! empty( $value ) ) {
				if ( 'reviews_enabled' === $update_field ) {
					update_option( 'woocommerce_enable_reviews', 'true' === $value ? 'yes' : 'no' );
				}
				if ( 'verification_label' === $update_field ) {
					update_option( 'woocommerce_review_rating_verification_label', 'true' === $value ? 'yes' : 'no' );
				} elseif ( 'verification_required' === $update_field ) {
					update_option( 'woocommerce_review_rating_verification_required', 'true' === $value ? 'yes' : 'no' );
				} elseif ( 'enable_review_rating' === $update_field ) {
					update_option( 'woocommerce_enable_review_rating', 'true' === $value ? 'yes' : 'no' );
				} elseif ( 'review_rating_required' === $update_field ) {
					update_option( 'woocommerce_review_rating_required', 'true' === $value ? 'yes' : 'no' );
				}

				wp_send_json_success( array( 'mess' => __( 'WC reviews settings updated successfully', 'yay-reviews' ) ) );
			}
			wp_send_json_error( array( 'mess' => __( 'Invalid update field or value', 'yay-reviews' ) ) );
		} catch ( \Exception $e ) {
			return wp_send_json_error( array( 'mess' => $e->getMessage() ) );
		}
	}

	public function preview_email() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'yayrev_nonce' ) ) {
			return wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay-reviews' ) ) );
		}
		try {
			$email = isset( $_POST['email'] ) ? sanitize_text_field( wp_unslash( $_POST['email'] ) ) : '';
			if ( ! empty( $email ) ) {

				$email_class = apply_filters( 'yayrev_preview_email_class', 'YayReviews\Emails\ReminderEmail', $email );
				$email_preview = wc_get_container()->get( \Automattic\WooCommerce\Internal\Admin\EmailPreview\EmailPreview::class );
				$email_preview->set_email_type( $email_class );
				$message = $email_preview->render();
				$message = $email_preview->ensure_links_open_in_new_tab( $message );
				$content = $message;
				// wrap content in iframe
				$nonce = esc_url( wp_nonce_url( admin_url( '?preview_woocommerce_mail=true' ), 'preview-mail' ) );
				// add type to url
				$content = '<iframe id="yay-reviews-email-preview-iframe" style="border-radius: 0 0 3px 3px;display: block;height: 100%;width: 100%;" src="' . $nonce . '&type=' . $email_class . '"></iframe>';
			}
			wp_send_json_success(
				array(
					'content' => $content,
					'message' => __( 'Email previewed successfully', 'yay-reviews' ),
				)
			);
		} catch ( \Exception $e ) {
			return wp_send_json_error( array( 'mess' => $e->getMessage() ) );
		}
	}

	private function process_pending_reminder_email( $email_queue ) {
		$scheduled_event = maybe_unserialize( $email_queue->scheduled_event );
		if ( ! empty( $scheduled_event ) && isset( $scheduled_event['timestamp'] ) && isset( $scheduled_event['order_id'] ) ) {
			// Ensure timestamp is valid
			$timestamp    = intval( $scheduled_event['timestamp'] );
			$order_id     = intval( $scheduled_event['order_id'] );
			$email_id_int = intval( $email_queue['id'] );

			do_action( 'yayrev_reminder_email', $order_id, $email_id_int );

			if ( $timestamp > 0 ) {
				// Try to unschedule the event with proper error handling
				$unscheduled = wp_unschedule_event( $timestamp, 'yayrev_reminder_email', array( $order_id, $email_id_int ) );
				if ( is_wp_error( $unscheduled ) ) {
					// Log the error but don't fail the entire operation
					if ( defined( 'WP_DEBUG' ) && WP_DEBUG && defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
						error_log( 'YayReviews: Failed to unschedule event - ' . $unscheduled->get_error_message() ); //phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					}
				}
			}
		}

		wp_send_json_success(
			array(
				'mess' => __( 'Email sent successfully', 'yay-reviews' ),
			)
		);
	}

	private function resend_reminder_email( $email_queue ) {
		if ( ! class_exists( 'WC_Email' ) ) {
			\WC()->mailer();
		}

		$email = new \YayReviews\Emails\ReminderEmail();
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

	public function finish_wizard() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'yayrev_nonce' ) ) {
			return wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay-reviews' ) ) );
		}

		$request_review_timing = isset( $_POST['request_review_timing'] ) ? sanitize_text_field( wp_unslash( $_POST['request_review_timing'] ) ) : '';
		$review_type = isset( $_POST['review_type'] ) ? sanitize_text_field( wp_unslash( $_POST['review_type'] ) ) : 'media';

		SettingsModel::update_settings(
			[
				'addons' => [
					'reminder_enabled' => SettingsModel::get_default_settings('addons.reminder_enabled'),
				],
				'reminder' => [
					'delay_amount' => ! empty( $request_review_timing ) ? intval( $request_review_timing ) :  SettingsModel::get_default_settings('reminder.delay_amount'),
					'delay_unit' => SettingsModel::get_default_settings('reminder.delay_unit'),
					'max_products_per_email' => SettingsModel::get_default_settings('reminder.max_products_per_email'),
					'product_scope' => SettingsModel::get_default_settings('reminder.product_scope'),
				],
				'reviews' => [
					'enable_media_upload' => 'media' === $review_type ? true : false,
					'allowed_media_types' => SettingsModel::get_default_settings('reviews.allowed_media_types'),
				],
			]
		);

		update_option( 'yayrev_wizard_completed', 'yes' );
		wp_send_json_success( array( 'mess' => __( 'Wizard finished successfully', 'yay-reviews' ) ) );
	}
}
