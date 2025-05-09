<?php
/**
 * Plugin Name: YayReviews
 * Description: YayReviews helps you to do more things with WooCommerce reviews.
 * Version: 1.0
 * Author: YayCommerce
 * Author URI: https://yaycommerce.com
 * Text Domain: yay_reviews
 * Domain Path: /languages
 */

namespace YayReviews;

define( 'YAY_REVIEWS_FILE', __FILE__ );
define( 'YAY_REVIEWS_PLUGIN_URL', plugin_dir_url( YAY_REVIEWS_FILE ) );

define( 'YAY_REVIEWS_PLUGIN_PATH', plugin_dir_path( YAY_REVIEWS_FILE ) );
define( 'YAY_REVIEWS_VIEW_PATH', YAY_REVIEWS_PLUGIN_PATH . 'views/' );

define( 'YAY_REVIEWS_REST_URL', 'yay-reviews/v1' );

if( ! class_exists( 'woocommerce' ) ) {
    function yay_reviews_admin_notice() {
        // $activate_woo_url = add_query_arg(array(
        //     '_wpnonce' => wp_create_nonce( 'activate-plugin_woocommerce/woocommerce.php'),
        //     'action' => 'activate',
        //     'plugin' => 'woocommerce/woocommerce.php'
        // ), admin_url('plugins.php'));
        // $activate_html = '<a href="'.esc_url($activate_woo_url).'" target="_blank" class="button button-primary" style="vertical-align: middle;margin-top: 5px">'.esc_html__('Active WooCommerce', 'yay_reviews').'</a>';
        ?>
        <div class="notice notice-warning is-dismissible"> 
            <p>
                <strong><?php esc_html_e('Please activate WooCommerce to activate Yay Reviews', 'yay_reviews'); ?></strong>
                <br />
            </p>
        </div>
        <?php
    }
    add_action('admin_notices', 'YayReviews\\yay_reviews_admin_notice');
    return;
}

require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Classes/Helpers.php';
require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Classes/View.php';

require_once YAY_REVIEWS_PLUGIN_PATH . 'src/AdminMenu.php';
require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Admin.php';
require_once YAY_REVIEWS_PLUGIN_PATH . 'src/Frontend.php';

$yay_reviews_settings = Classes\Helpers::get_all_settings_from_db();

add_action( 'plugins_loaded' , function(){
    // if ( function_exists( 'determine_locale' ) ) {
	// 	$locale = determine_locale();
	// } else {
	// 	$locale = is_admin() ? get_user_locale() : get_locale();
	// }
	// unload_textdomain( 'yay_reviews' );
	// load_textdomain( 'yay_reviews', YAY_REVIEWS_PLUGIN_PATH . '/languages/yay_reviews-' . $locale . '.mo' );

    load_plugin_textdomain('yay_reviews', false, dirname( plugin_basename( YAY_REVIEWS_FILE ) ) . '/languages/');
    new Admin();
    new Frontend();
});
