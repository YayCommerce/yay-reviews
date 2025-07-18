<?php
namespace YayRev\Register;

use YayRev\SingletonTrait;
use YayRev\Register\ScriptName;

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
		add_filter( 'pre_load_script_translations', array( $this, 'use_mo_file_for_script_translations' ), 10, 4 );
		$is_prod = ! defined( 'YAYREV_IS_DEVELOPMENT' ) || YAYREV_IS_DEVELOPMENT !== true;
		if ( $is_prod && class_exists( '\YayRev\Register\RegisterProd' ) ) {
			\YayRev\Register\RegisterProd::get_instance();
		} elseif ( ! $is_prod && class_exists( '\YayRev\Register\RegisterDev' ) ) {
			\YayRev\Register\RegisterDev::get_instance();
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
			YAYREV_PLUGIN_URL . 'assets/admin/dist/main.css',
			array(
				'woocommerce_admin_styles',
				'wp-components',
			),
			YAYREV_VERSION
		);
	}

	public function use_mo_file_for_script_translations( $json_translations, $file, $handle, $domain ) {
		$all_handles = array(
			ScriptName::PAGE_SETTINGS,
		);

		if ( 'yay-customer-reviews-woocommerce' !== $domain || ! in_array( $handle, $all_handles, true ) ) {
			return $json_translations;
		}

		$translations = get_translations_for_domain( 'yay-customer-reviews-woocommerce' );
		$messages     = array(
			'' => array(
				'domain' => 'messages',
			),
		);
		$entries      = $translations->entries;
		foreach ( $entries as $key => $entry ) {
			$messages[ $entry->singular ] = $entry->translations;
		}

		return wp_json_encode(
			array(
				'domain'      => 'messages',
				'locale_data' => array(
					'messages' => $messages,
				),
			)
		);
	}
}
