<?php

namespace YayReviews;

use YayReviews\SingletonTrait;
use YayReviews\Classes\Helpers;
/**
 * Activate and deactive method of the plugin and relates.
 */
class ActDeact {
	use SingletonTrait;

	protected function __construct() {}

	public static function activate() {
		self::migrate_new_settings();
		update_option( 'yay_reviews_version', YAY_REVIEWS_VERSION );
		// check if table exists
		global $wpdb;
		$table_name = $wpdb->prefix . 'yay_reviews_email_queue';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$table_name'" ) !== $table_name ) {
			// create table for email queue
			$wpdb->query(
				"CREATE TABLE $table_name (
					id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
					type varchar(255) NOT NULL,
					subject varchar(255),
					body longtext,
					status int(1),
					customer_email varchar(255),
					created_at datetime NOT NULL,
					scheduled_event longtext,
					email_data longtext,
					PRIMARY KEY (id)
				)
				ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
			"
			);
		}

	}

	public static function deactivate() {
		// remove cron job
		wp_clear_scheduled_hook( 'yay_reviews_reminder_email' );
	}

	public static function migrate_new_settings() {

		if ( ! empty( get_option( 'yay_reviews_has_new_data' ) ) ) {
			return;
		}

		$settings = get_option( 'yay_reviews_settings' );

		if ( empty( $settings ) ) {
			Helpers::add_default_settings( array() );
			update_option( 'yay_reviews_has_new_data', 'yes' );
			return;
		}

		$addons   = $settings['addons'];
		$reviews  = $settings['reviews'];
		$reminder = $settings['reminder'];
		$rewards  = $settings['rewards'];
		$email    = $settings['email'];

		// migrate media type
		$new_allowed_media_types = $reviews['media_type'] ?? 'video_photo';
		if ( 'video_image' === $new_allowed_media_types ) {
			$new_allowed_media_types = 'video_photo';
		} elseif ( 'only_image' === $new_allowed_media_types ) {
			$new_allowed_media_types = 'only_photo';
		}

		$new_settings = array(
			'addons'          => array(
				'reminder_enabled'        => $addons['reminder'] ?? true,
				'reward_enabled'          => $addons['reward'] ?? false,
				'optional_fields_enabled' => $addons['optional_fields'] ?? false,
			),
			'reviews'         => array(
				'enable_media_upload'      => $reviews['upload_media'] ?? true,
				'require_media_upload'     => $reviews['upload_required'] ?? false,
				'allowed_media_types'      => $new_allowed_media_types,
				'max_upload_filesize'      => $reviews['max_upload_file_size'] ?? 2000, //kb
				'max_upload_files'         => $reviews['max_upload_file_qty'] ?? '',
				'media_upload_label'       => $reviews['upload_file_label'] ?? __( 'Upload media', 'yay-reviews' ),
				'media_upload_description' => $reviews['upload_file_description'] ?? __( 'You can upload jpg/png & video (maximum 2000Kbs)', 'yay-reviews' ),
				'enable_gdpr_consent'      => $reviews['enable_gdpr'] ?? false,
				'gdpr_consent_message'     => $reviews['gdpr_message'] ?? __( 'I agree to the Privacy Policy.', 'yay-reviews' ),
				'pre_gdpr_message'         => $reviews['before_message'] ?? __( 'We respect your privacy and need your consent to continue.', 'yay-reviews' ),
			),
			'reminder'        => array(
				'delay_amount'           => $reminder['send_after_value'] ?? 7,
				'delay_unit'             => $reminder['send_after_unit'] ?? 'days',
				'max_products_per_email' => $reminder['max_products'] ?? '',
				'product_scope'          => $reminder['products_type'] ?? 'all',
			),
			'rewards'         => $rewards,
			'optional_fields' => array(),
			'email'           => $email,
		);

		update_option( 'yay_reviews_settings', $new_settings );
		update_option( 'yay_reviews_has_new_data', 'yes' );
	}
}
