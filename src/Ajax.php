<?php

namespace YayReviews;

use YayReviews\Classes\EmailQueue;
use YayReviews\SingletonTrait;
use YayReviews\Classes\Helpers;
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
			return wp_send_json_error( array( 'mess' => __( 'Verify nonce failed', 'yay-reviews' ) ) );
		}
		try {
			$email_id = isset( $_POST['email_id'] ) ? sanitize_text_field( wp_unslash( $_POST['email_id'] ) ) : '';
			if ( ! empty( $email_id ) ) {
				$email_queue = EmailQueue::get_queue( $email_id );
				if ( ! empty( $email_queue ) ) {
					if ( 'reminder' === $email_queue->type && '0' === $email_queue->status ) {
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
						}
					} else {
						if ( ! class_exists( 'WC_Email' ) ) {
							\WC()->mailer();
						}
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
				if ( 'reminder' === $email ) {
					$email_class = 'YayReviews\Emails\ReminderEmail';
				} else {
					$email_class = 'YayReviews\Emails\RewardEmail';
				}
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
}
