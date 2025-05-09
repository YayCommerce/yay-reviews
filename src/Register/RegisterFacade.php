<?php
namespace YayReviews\Register;

use YayReviews\SingletonTrait;
use YayReviews\Register\ScriptName;

/**
 * Register Facade.
 *
 * @method static RegisterFacade get_instance()
 */
class RegisterFacade {
	use SingletonTrait;

	/** Hooks Initialization */
	protected function __construct() {
		add_filter( 'script_loader_tag', array( $this, 'add_entry_as_module' ), 10, 3 );
		add_action( 'init', array( $this, 'register_all_assets' ) );

		$is_prod = ! defined( 'YAY_REVIEWS_IS_DEVELOPMENT' ) || YAY_REVIEWS_IS_DEVELOPMENT !== true;
		if ( $is_prod && class_exists( '\YayReviews\Register\RegisterProd' ) ) {
			\YayReviews\Register\RegisterProd::get_instance();
		} elseif ( ! $is_prod && class_exists( '\YayReviews\Register\RegisterDev' ) ) {
			\YayReviews\Register\RegisterDev::get_instance();
		}
	}

	public function add_entry_as_module( $tag, $handle ) {
		if ( strpos( $handle, ScriptName::MODULE_PREFIX ) !== false ) {
			// Remove any existing type attribute
			$tag = preg_replace( '/\stype="[^"]*"/', '', $tag );
			// Add type="module"
			$tag = str_replace( ' src=', ' type="module" src=', $tag );
		}
		return $tag;
	}

	public function register_all_assets() {
		wp_register_style(
			ScriptName::STYLE_SETTINGS,
			YAY_REVIEWS_PLUGIN_URL . 'assets/admin/dist/style.css',
			array(
				'woocommerce_admin_styles',
				'wp-components',
			),
			YAY_REVIEWS_VERSION
		);
	}
}
