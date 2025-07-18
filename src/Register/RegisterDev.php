<?php
namespace YayRev\Register;

use YayRev\SingletonTrait;
use YayRev\Register\ScriptName;

/**
 * Register in Development Mode
 * Will get deleted in production
 */
class RegisterDev {
	use SingletonTrait;

	/** Hooks Initialization */
	protected function __construct() {
		add_action( 'admin_footer', array( $this, 'render_dev_refresh' ), 5 );

		add_action( 'init', array( $this, 'register_all_scripts' ) );
	}

	public function render_dev_refresh() {
		echo '<script type="module">
        import RefreshRuntime from "http://localhost:3001/@react-refresh"
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
        </script>';
	}

	public function register_all_scripts() {
		$deps = array( 'react', 'react-dom', 'wp-hooks', 'wp-i18n' );

		wp_register_script( ScriptName::PAGE_SETTINGS, 'http://localhost:3001/main.tsx', $deps, null, true ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_set_script_translations( ScriptName::PAGE_SETTINGS, 'yay-customer-reviews-woocommerce', YAYREV_PLUGIN_PATH . 'languages' );
	}
}
