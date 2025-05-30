<?php
/**
 * Plugin Name: YayReviews
 * Description: YayReviews helps you to do more things with WooCommerce reviews.
 * Version: 1.0
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

define( 'YAY_REVIEWS_PLUGIN_PATH', plugin_dir_path( YAY_REVIEWS_FILE ) );
define( 'YAY_REVIEWS_VIEW_PATH', YAY_REVIEWS_PLUGIN_PATH . 'views/' );

define( 'YAY_REVIEWS_REST_URL', 'yay-reviews/v1' );

define( 'YAY_REVIEWS_VERSION', '1.0.0' );
define( 'YAY_REVIEWS_IS_DEVELOPMENT', true );

spl_autoload_register(
	function ( $class ) {
		$prefix   = __NAMESPACE__; // project-specific namespace prefix
		$base_dir = __DIR__ . '/src'; // base directory for the namespace prefix

		$len = strlen( $prefix );
		if ( strncmp( $prefix, $class, $len ) !== 0 ) { // does the class use the namespace prefix?
			return; // no, move to the next registered autoloader
		}

		$relative_class_name = substr( $class, $len );

		// replace the namespace prefix with the base directory, replace namespace
		// separators with directory separators in the relative class name, append
		// with .php
		$file = $base_dir . str_replace( '\\', '/', $relative_class_name ) . '.php';

		if ( file_exists( $file ) ) {
			require $file;
		}
	}
);

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

require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Classes/Helpers.php';
require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Classes/View.php';
require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Classes/Emails.php';
require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Classes/Cron.php';
require_once YAY_REVIEWS_PLUGIN_PATH . 'src/AdminMenu.php';
require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Admin.php';
require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Frontend.php';

add_action(
	'plugins_loaded',
	function () {
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

		// Initialize plugin components
		Initialize::get_instance();
		new Admin();
		new Frontend();
	}
);


