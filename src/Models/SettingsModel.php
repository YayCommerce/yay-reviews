<?php

namespace YayReviews\Models;

use YayReviews\Classes\Helpers;

/**
 * SettingsModel is a singleton class that provides methods to get and update settings.
 */
class SettingsModel {

	/**
	 * The name of the option that stores the settings.
	 */
	public const OPTION_NAME = 'yayrev_settings';

	/**
	 * Get the default settings.
	 *
	 * @return array The default settings.
	 */
	public static function get_default_settings() {
		return array(
			'addons'          => array(
				'reminder_enabled'        => true,
				'reward_enabled'          => null,
				'optional_fields_enabled' => null,
			),
			'reviews'         => array(
				'enable_media_upload'      => true,
				'require_media_upload'     => false,
				'allowed_media_types'      => 'video_photo',
				'max_upload_filesize'      => 2000, //kb
				'max_upload_files'         => '',
				'media_upload_label'       => __( 'Upload media', 'yay-reviews' ),
				'media_upload_description' => __( 'You can upload jpg/png & video (maximum 2000Kbs)', 'yay-reviews' ),
				'enable_gdpr_consent'      => false,
				'gdpr_consent_message'     => __( 'I agree to the Privacy Policy.', 'yay-reviews' ),
				'pre_gdpr_message'         => __( 'We respect your privacy and need your consent to continue.', 'yay-reviews' ),
			),
			'reminder'        => array(
				'delay_amount'           => 5,
				'delay_unit'             => 'days',
				'max_products_per_email' => '',
				'product_scope'          => 'all',
			),
			'rewards'         => array(),
			'optional_fields' => array(),
		);
	}

	/**
	 * Get all settings.
	 *
	 * @return array The settings.
	 */
	public static function get_all_settings() {
		$settings = get_option( self::OPTION_NAME, array() );
		return Helpers::wp_parse_args_recursive( $settings, self::get_default_settings() );
	}

	/**
	 * Get a specific setting.
	 * $path is a string like 'reviews.enable_media_upload'.
	 * $default is the default value if the setting is not found.
	 */
	public static function get_settings( $path, $default = '' ) {
		$value_path = explode( '.', $path );
		$settings   = self::get_all_settings();
		$val        = $settings;
		foreach ( $value_path as $key ) {
			if ( isset( $val[ $key ] ) ) {
				$val = $val[ $key ];
			} else {
				$val = $default;
			}
		}
		return $val;
	}

	/**
	 * Update the settings.
	 *
	 * @param array $settings The settings to update.
	 * @return bool True if the settings were updated, false otherwise.
	 */
	public static function update_settings( $settings ) {
		return update_option( self::OPTION_NAME, Helpers::wp_parse_args_recursive( $settings, self::get_all_settings() ), false );
	}
}
