<?php

namespace YayReviews;

use YayReviews\Classes\View;
class AdminMenu {

	public static $capability = 'manage_options';

	public static $position = 55.5;

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_yay_reviews_menu' ), YAY_REVIEWS_MENU_PRIORITY );
	}

	/**
	 * Register the YayMAil sub menu to WordPress YayCommerce menu.
	 */
	public function add_yay_reviews_menu() {
		$menu_args = array(
			'parent_slug' => 'yaycommerce',
			'page_title'  => __( 'Yay Reviews Settings', 'yay-reviews' ),
			'menu_title'  => __( 'YayReviews', 'yay-reviews' ),
			'capability'  => 'manage_woocommerce',
			'menu_slug'   => 'yay-reviews',
			'function'    => array( $this, 'render_yay_reviews_page' ),
			'position'    => 0,
		);
		add_submenu_page( $menu_args['parent_slug'], $menu_args['page_title'], $menu_args['menu_title'], $menu_args['capability'], $menu_args['menu_slug'], $menu_args['function'], $menu_args['position'] );
	}

	/**
	 * Render the settings page
	 */
	public function render_yay_reviews_page() {
		?>
		<div class="wrap">
			<?php View::load( 'admin.settings' ); ?>
		</div>
		<?php
	}
}