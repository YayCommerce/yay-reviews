<?php

namespace YayReviews\Admin;

use YayReviews\Classes\Helpers;
use YayReviews\Classes\View;
use YayReviews\Emails\PlaceholderProcessors\ReminderPlaceholderProcessor;
use YayReviews\Emails\ReminderEmail;
use YayReviews\Models\CouponModel;
use YayReviews\Models\SettingsModel;
use YayReviews\Register\ScriptName;
use YayReviews\SingletonTrait;

class AdminMenu {

	use SingletonTrait;

	public static $capability = 'manage_woocommerce';

	public static $position = 0;

	public static $menu_slug = 'yay-reviews';

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_yayrev_menu' ), YAYREV_MENU_PRIORITY );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	/**
	 * Register the YayMAil sub menu to WordPress YayCommerce menu.
	 */
	public function add_yayrev_menu() {
		$menu_args = array(
			'parent_slug' => 'yaycommerce',
			'page_title'  => __( 'Yay Reviews Settings', 'yay-reviews' ),
			'menu_title'  => __( 'YayReviews', 'yay-reviews' ),
			'capability'  => self::$capability,
			'menu_slug'   => self::$menu_slug,
			'function'    => array( $this, 'render_yayrev_page' ),
			'position'    => self::$position,
		);
		add_submenu_page( $menu_args['parent_slug'], $menu_args['page_title'], $menu_args['menu_title'], $menu_args['capability'], $menu_args['menu_slug'], $menu_args['function'], $menu_args['position'] );
	}

	/**
	 * Render the settings page
	 */
	public function render_yayrev_page() {
		?>
		<div class="wrap">
			<?php View::load( 'admin.settings' ); ?>
		</div>
		<?php
	}

	public function admin_enqueue_scripts() {
		$screen    = get_current_screen();
		$screen_id = $screen ? $screen->id : '';

		if ( 'yaycommerce_page_' . self::$menu_slug !== $screen_id ) {
			return;
		}

		wp_enqueue_script( ScriptName::PAGE_SETTINGS );
		wp_enqueue_editor();

		$uneditabled_localized_data = [
			'nonce'                     => wp_create_nonce( 'yayrev_nonce' ),
			'rest_nonce'                => wp_create_nonce( 'wp_rest' ),
			'rest_url'                  => esc_url_raw( rest_url() ),
			'ajax_url'                  => admin_url( 'admin-ajax.php' ),
			'rest_base'                 => YAYREV_REST_URL,
			'image_url'                 => YAYREV_PLUGIN_URL . 'assets/admin/images',
			'currency_symbol'           => \get_woocommerce_currency_symbol(),
			'wc_reviews_settings'       => Helpers::get_wc_reviews_settings(),
			'wc_settings_url'           => admin_url( 'admin.php?page=wc-settings&tab=products' ),
			'site_title'                => get_bloginfo( 'name' ),
			'upload_max_filesize'       => Helpers::upload_max_filesize(),
			'admin_email'               => get_option( 'admin_email' ),
			'coupons'                   => CouponModel::get_coupons(),
			'wizard_completed'          => get_option( 'yayrev_wizard_completed', false ),
		];
		
		$filtered_localize_data = apply_filters( 'yayrev_admin_localize_data', [
			'data_settings'             => SettingsModel::get_all_settings(),
			'wc_email_settings'         => array(
				'reminder' => array(
					'default' => ReminderEmail::get_default_email_settings(),
					'current' => ReminderEmail::get_email_settings(),
				),
			),
			'sample_email_placeholders' => array(
				'reminder' => ( new ReminderPlaceholderProcessor() )->get_placeholders(),
			),
		] );

		$localize_data = $uneditabled_localized_data;

		foreach ( $filtered_localize_data as $key => $value ) {
			if ( ! isset( $uneditabled_localized_data[ $key ] ) ) {
				$localize_data[ $key ] = $value;
			}
		}

		wp_localize_script(
			ScriptName::PAGE_SETTINGS,
			'yayReviews',
			$localize_data
		);

		wp_enqueue_style( ScriptName::STYLE_SETTINGS );
		
	}

}