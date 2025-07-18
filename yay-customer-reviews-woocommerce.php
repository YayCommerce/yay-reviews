<?php
/**
 * Plugin Name: YayReviews - Advanced Reviews for WooCommerce
 * Description: YayReviews helps you to do more things with WooCommerce reviews.
 * Version: 1.0.0
 * Author: YayCommerce
 * Author URI: https://yaycommerce.com
 * Text Domain: yay-customer-reviews-woocommerce
 * Domain Path: /languages
 * WC requires at least: 3.0.0
 * WC tested up to: 10.0.0
 * License: GPL v3 or later
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 */

namespace YayRev;

defined( 'ABSPATH' ) || exit;

define( 'YAYREV_FILE', __FILE__ );
define( 'YAYREV_PLUGIN_URL', plugin_dir_url( YAYREV_FILE ) );
define( 'YAYREV_PLUGIN_BASENAME', plugin_basename( YAYREV_FILE ) );
define( 'YAYREV_PLUGIN_PATH', plugin_dir_path( YAYREV_FILE ) );
define( 'YAYREV_VIEW_PATH', YAYREV_PLUGIN_PATH . 'views/' );

define( 'YAYREV_REST_URL', 'yayrev/v1' );

define( 'YAYREV_VERSION', '1.0.0' );
define( 'YAYREV_IS_DEVELOPMENT', true );

require_once YAYREV_PLUGIN_PATH . 'vendor/autoload.php';

if ( ! class_exists( 'woocommerce' ) ) {
	function yayrev_admin_notice() {
		?>
		<div class="notice notice-warning is-dismissible"> 
			<p>
				<strong><?php esc_html_e( 'Please activate WooCommerce to activate Yay Reviews', 'yay-customer-reviews-woocommerce' ); ?></strong>
				<br />
			</p>
		</div>
		<?php
	}
	add_action( 'admin_notices', 'YayRev\\yayrev_admin_notice' );
	return;
}

// Ensure WooCommerce is fully loaded
if ( ! function_exists( 'WC' ) ) {
	return;
}

add_action(
	'plugins_loaded',
	function () {
		\YayRev\YayCommerceMenu\RegisterMenu::get_instance();
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
		Addons::get_instance();
	}
);

register_activation_hook( __FILE__, array( 'YayRev\ActDeact', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'YayRev\ActDeact', 'deactivate' ) );
