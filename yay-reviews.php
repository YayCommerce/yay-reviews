<?php
/**
 * Plugin Name: YayReviews
 * Description: YayReviews helps you to do more things with WooCommerce reviews.
 * Version: 1.0.0
 * Author: YayCommerce
 * Author URI: https://yaycommerce.com
 * Text Domain: yay-reviews
 * Domain Path: /languages
 * Requires at least: 4.7
 * Requires PHP: 5.4
 * WC requires at least: 3.0.0
 * WC tested up to: 9.8.4
 */

namespace YayReviews;

defined( 'ABSPATH' ) || exit;

define( 'YAY_REVIEWS_FILE', __FILE__ );
define( 'YAY_REVIEWS_PLUGIN_URL', plugin_dir_url( YAY_REVIEWS_FILE ) );
define( 'YAY_REVIEWS_PLUGIN_BASENAME', plugin_basename( YAY_REVIEWS_FILE ) );
define( 'YAY_REVIEWS_PLUGIN_PATH', plugin_dir_path( YAY_REVIEWS_FILE ) );
define( 'YAY_REVIEWS_VIEW_PATH', YAY_REVIEWS_PLUGIN_PATH . 'views/' );

define( 'YAY_REVIEWS_REST_URL', 'yay-reviews/v1' );

define( 'YAY_REVIEWS_VERSION', '1.0.0' );
define( 'YAY_REVIEWS_IS_DEVELOPMENT', true );

add_action(
	'init',
	function () {
		load_plugin_textdomain( 'yay-reviews', false, dirname( YAY_REVIEWS_PLUGIN_BASENAME ) . '/languages' );
	}
);

require_once YAY_REVIEWS_PLUGIN_PATH . 'vendor/autoload.php';

if ( ! class_exists( 'woocommerce' ) ) {
	function yay_reviews_admin_notice() {
		?>
		<div class="notice notice-warning is-dismissible"> 
			<p>
				<strong><?php esc_html_e( 'Please activate WooCommerce to activate Yay Reviews', 'yay-reviews' ); ?></strong>
				<br />
			</p>
		</div>
		<?php
	}
	add_action( 'admin_notices', 'YayReviews\\yay_reviews_admin_notice' );
	return;
}

// Ensure WooCommerce is fully loaded
if ( ! function_exists( 'WC' ) ) {
	return;
}

add_action(
	'plugins_loaded',
	function () {
		\YayReviews\YayCommerceMenu\RegisterMenu::get_instance();
		// Ensure WooCommerce is loaded
		if ( ! function_exists( 'WC' ) ) {
			return;
		}

		add_action(
			'before_woocommerce_init',
			function () {
				if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
					\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
				}
			}
		);

		Initialize::get_instance();
		Admin::get_instance();
		Frontend::get_instance();
	}
);

register_activation_hook( __FILE__, array( 'YayReviews\ActDeact', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'YayReviews\ActDeact', 'deactivate' ) );
