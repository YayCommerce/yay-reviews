<?php

namespace YayReviews;

use YayReviews\Classes\View;
class AdminMenu {

	public static $capability = 'manage_options';

	public static $position = 55.5;

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'maybe_register_yaycommerce_menu' ) );
		add_action( 'admin_menu', array( $this, 'register_sub_menu' ) );
	}
	public function maybe_register_yaycommerce_menu() {
		global $admin_page_hooks;
		if ( ! isset( $admin_page_hooks['yaycommerce'] ) ) {
			add_menu_page( 'yaycommerce', 'YayCommerce', self::$capability, 'yaycommerce', array( $this, 'yay_reviews_page_callback' ), self::get_logo_url(), self::$position );
		}
	}
	public function register_sub_menu() {
		add_submenu_page(
			'yaycommerce',
			'YayReviews',
			'YayReviews',
			self::$capability,
			'yay-reviews',
			array( $this, 'yay_reviews_page_callback' ),
		);
	}
	public function yay_reviews_page_callback() {
		?>
		<div class="wrap">
			<?php View::load( 'admin.settings' ); ?>
		</div>
		<?php
	}
	public static function get_logo_url() {
		return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQ2LjI0NzYgNi40MDg5NkM0Ni4yNDc2IDkuOTQ4MTYgNDMuMzc3OCAxMi44MTc5IDM5LjgzODYgMTIuODE3OUMzNi4yOTk0IDEyLjgxNzkgMzMuNDI5NyA5Ljk0ODE2IDMzLjQyOTcgNi40MDg5NkMzMy40Mjk3IDIuODY5NzYgMzYuMjk4MSAwIDM5LjgzODYgMEM0My4zNzkxIDAgNDYuMjQ3NiAyLjg2OTc2IDQ2LjI0NzYgNi40MDg5NlpNMS4xNjQ3MSAyMi45OTI2Qy0wLjIxODk3MiAyMy4xMzIyIC0wLjQzNzg1MiAyNS4wNTg2IDAuODc5MjY4IDI1LjUwNEM5LjI1NDMxIDI4LjMzNjYgMjEuMzAwNCAzMC45OTUyIDI3LjI0OTggMzIuMjM0MkMyOS4yOTkxIDMyLjY2MDUgMzAuNjIzOSAzNC42NDgzIDMwLjI0MTIgMzYuNzA2NkMyOC41NDUyIDQ1LjgwNjEgMjUuMzc4NSA1NS41Mjc3IDIzLjM2ODkgNjIuMzM0N0MyMi45ODYyIDYzLjYzMTQgMjQuNTk5IDY0LjU3MjIgMjUuNTM4NSA2My42MDA2QzQ3LjIxMDIgNDEuMjAxOSA1OS4zODk0IDE4LjE5OSA2My44Njk0IDguNzIzMkM2NC40MjM2IDcuNTUwNzIgNjMuMTAwMSA2LjM4NzIgNjIuMDA0NCA3LjA4MDk2QzQ1LjM5MTMgMTcuNjA2NCAxMy44NTU5IDIxLjcxNzggMS4xNjQ3MSAyMi45OTI2WiIgZmlsbD0iI0E3QUFBRCIvPgo8L3N2Zz4=';
	}
}