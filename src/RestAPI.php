<?php
namespace YayReviews;

use YayReviews\SingletonTrait;
use YayReviews\Classes\Helpers;

defined( 'ABSPATH' ) || exit;

/**
 *  Rest API
 */
class RestAPI {

	use SingletonTrait;

	private $default_swatch_customize_settings;
	private $default_button_customize_settings;
	private $default_sold_out_customize_settings;
	private $default_collection_customize_settings;

	private $settings_service;

	protected function __construct() {
		// $this->default_swatch_customize_settings     = Helper::get_default_swatch_customize_settings();
		// $this->default_button_customize_settings     = Helper::get_default_button_customize_settings();
		// $this->default_sold_out_customize_settings   = Helper::get_default_sold_out_settings();
		// $this->default_collection_customize_settings = Helper::get_default_collection_customize_settings();
		// $this->settings_service                      = SettingsService::get_instance();
		add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
	}

	/**
	 * Add Yay Reviews Endpoints
	 */
	public function register_rest_api() {
		register_rest_route(
			YAY_REVIEWS_REST_URL,
			'/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
			)
		);
	}

	public function get_settings() {
		$settings = Helpers::get_all_settings();
		return rest_ensure_response( $settings );
	}

	public function permission_callback() {
		// return true;
		return current_user_can( 'manage_options' );
	}
}
