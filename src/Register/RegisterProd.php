<?php
namespace YayRev\Register;

use YayRev\SingletonTrait;
use YayRev\Register\ScriptName;

/** Register in Production Mode */
class RegisterProd {
	use SingletonTrait;

	/** Hooks Initialization */
	protected function __construct() {
		add_action( 'init', array( $this, 'register_all_scripts' ) );
	}

	public function register_all_scripts() {
		$deps = array( 'react', 'react-dom', 'wp-hooks', 'wp-i18n' );

		wp_register_script(
			ScriptName::PAGE_SETTINGS,
			YAYREV_PLUGIN_URL . 'assets/admin/dist/main.js',
			$deps,
			YAYREV_VERSION,
			true
		);
		wp_set_script_translations( ScriptName::PAGE_SETTINGS, 'yay-customer-reviews-woocommerce', YAYREV_PLUGIN_PATH . 'languages' );
		wp_script_add_data( ScriptName::PAGE_SETTINGS, 'type', 'module' );
	}
}
